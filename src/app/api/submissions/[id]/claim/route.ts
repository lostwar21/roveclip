import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scrapeSocialVideo } from "@/lib/scrapers";
import { reviewSubmissionWithAI } from "@/lib/gemini";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'CLIPPER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const submission = await prisma.submission.findUnique({
      where: { id: id, clipper_id: (session.user as any).id },
      include: { campaign: true }
    });

    if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (submission.status === 'MANUAL_REVIEW') {
      return NextResponse.json({ message: "Claim is currently under manual review by Admin." }, { status: 400 });
    }

    // Fetch live views using our self-hosted scraper
    let liveViews = 0;
    let stats: any = null;
    try {
      stats = await scrapeSocialVideo(submission.social_url, submission.platform);
      liveViews = stats.views;
    } catch (err) {
      return NextResponse.json({ 
        error: "Gagal menghubungi server platform video. Pastikan link video publik dan coba lagi beberapa saat." 
      }, { status: 400 });
    }

    const deltaViews = liveViews - submission.validated_views;
    
    if (deltaViews <= 0) {
      return NextResponse.json({ message: "Belum ada penambahan tayangan (views) baru untuk diklaim." }, { status: 400 });
    }

    // 1. Batas minimum 1.000 views untuk klaim susulan (mencegah spam klaim receh)
    if (submission.validated_views > 0 && deltaViews < 1000) {
      return NextResponse.json({ 
        error: `Minimal penambahan views untuk klaim berikutnya adalah 1.000 views. Penambahan Anda saat ini baru ${deltaViews.toLocaleString()} views.` 
      }, { status: 400 });
    }

    // 2. Cek Anti-Bot: Rasio interaksi (Likes/Views) minimum 1.5% untuk video yang memiliki views >= 2.000
    const engagementRate = stats.views > 0 ? (stats.likes / stats.views) : 0;
    const isBotSuspicious = stats.views >= 2000 && engagementRate < 0.015;

    if (isBotSuspicious) {
      const reason = `Potensi Bot/Fraud: Rasio interaksi (Likes/Views) sangat rendah yaitu ${(engagementRate * 100).toFixed(2)}% (di bawah batas normal 1.5%).`;
      console.log(`[BOT DETECTED] Payout flagged. ${reason}`);

      await prisma.submission.update({
        where: { id: submission.id },
        data: { 
          status: 'MANUAL_REVIEW', 
          snapshot_date: new Date(),
          ai_notes: `🚨 ${reason}`,
          relevance_score: 0,
          likes: stats.likes,
          comments: stats.comments
        }
      });

      return NextResponse.json({ 
        message: `Klaim Anda ditahan untuk peninjauan manual oleh Admin karena rasio interaksi (Likes/Views) yang tidak wajar (${(engagementRate * 100).toFixed(2)}%).`,
        status: "MANUAL_REVIEW"
      });
    }

    // Calculate Gross and Net Payouts (20% Platform Fee)
    const grossEarnings = (deltaViews / 1000) * Number(submission.campaign.cpm_rate);
    const platformFee = grossEarnings * 0.20;
    const netEarnings = grossEarnings - platformFee;

    // Deteksi platform video kampanye Brand dan tarik judulnya secara otomatis
    let campaignTitle = "";
    try {
      const detectPlatform = (uUrl: string): string => {
        const u = uUrl.toLowerCase();
        if (u.includes("tiktok.com")) return "TIKTOK";
        if (u.includes("youtube.com") || u.includes("youtu.be")) return "YOUTUBE";
        if (u.includes("instagram.com")) return "INSTAGRAM";
        return "YOUTUBE";
      };
      const campaignPlatform = detectPlatform(submission.campaign.video_url);
      const campaignStats = await scrapeSocialVideo(submission.campaign.video_url, campaignPlatform);
      campaignTitle = campaignStats.caption || "";
      console.log(`[AI AUDIT] Scraped Brand Campaign Title: "${campaignTitle}"`);
    } catch (err) {
      console.error("Gagal mendeteksi/menarik judul video kampanye Brand:", err);
    }

    let aiRelevanceScore = submission.relevance_score;

    // 3. AI Relevance Score Gate (>= 75) - Dijalankan jika belum tervalidasi (untuk migrasi data lama)
    if (submission.relevance_score < 75) {
      const aiResult = await reviewSubmissionWithAI(
        submission.campaign.video_url,
        campaignTitle,
        stats.caption || "",
        submission.social_url,
        submission.platform
      );

      aiRelevanceScore = aiResult.relevance_score;

      if (aiResult.approved && aiResult.relevance_score >= 75) {
        console.log(`[AI APPROVED] Claim of $${grossEarnings.toFixed(2)} approved automatically. Score: ${aiResult.relevance_score}/100. Reason: ${aiResult.reason}`);
        // Let it fall through to process auto-approve!
      } else {
        const flagReason = aiResult.relevance_score < 75 
          ? `Skor relevansi AI terlalu rendah (${aiResult.relevance_score}/100). ${aiResult.reason}`
          : aiResult.reason;

        console.log(`[AI FLAGGED] Claim of $${grossEarnings.toFixed(2)} flagged. Reason: ${flagReason}`);
        
        await prisma.submission.update({
          where: { id: submission.id },
          data: { 
            status: 'MANUAL_REVIEW', 
            snapshot_date: new Date(),
            ai_notes: `🚨 AI Audit: ${flagReason}`,
            relevance_score: aiResult.relevance_score,
            likes: stats.likes,
            comments: stats.comments
          }
        });

        return NextResponse.json({ 
          message: `Klaim Anda ditahan karena ditandai oleh AI. Klaim telah dikirim ke Admin untuk ditinjau secara manual. Analisis AI: ${flagReason}`,
          status: "MANUAL_REVIEW"
        });
      }
    } else {
      console.log(`[AI BYPASSED] Video relevance verified at submission time: ${submission.relevance_score}/100.`);
    }

    // Fetch brand balance to ensure they have enough funds
    const brand = await prisma.user.findUnique({
      where: { id: submission.campaign.brand_id },
      select: { wallet_balance: true }
    });

    if (!brand || Number(brand.wallet_balance) < grossEarnings) {
      return NextResponse.json({ error: "Brand has insufficient wallet balance to pay for these views." }, { status: 400 });
    }

    // Auto-Approve Atomic Transaction
    await prisma.$transaction([
      prisma.submission.update({
        where: { id: submission.id },
        data: { 
          validated_views: liveViews, 
          snapshot_date: new Date(), 
          status: 'APPROVED',
          relevance_score: aiRelevanceScore,
          likes: stats.likes,
          comments: stats.comments
        }
      }),
      // Brand is charged the full gross amount
      prisma.user.update({
        where: { id: submission.campaign.brand_id },
        data: { wallet_balance: { decrement: grossEarnings } }
      }),
      // Clipper receives the net amount (80%)
      prisma.user.update({
        where: { id: submission.clipper_id },
        data: { wallet_balance: { increment: netEarnings } }
      }),
      // Ledger: Clipper's Earnings
      prisma.transactionLedger.create({
        data: {
          user_id: submission.clipper_id,
          amount: netEarnings,
          type: 'PAYOUT',
          reference_id: submission.id
        }
      }),
      // Ledger: Brand's Spend (recorded as negative PAYOUT)
      prisma.transactionLedger.create({
        data: {
          user_id: submission.campaign.brand_id,
          amount: -grossEarnings,
          type: 'PAYOUT',
          reference_id: submission.id
        }
      }),
      // Ledger: Platform Fee (We can associate this fee record to the Clipper to show what was deducted)
      prisma.transactionLedger.create({
        data: {
          user_id: submission.clipper_id,
          amount: -platformFee,
          type: 'FEE',
          reference_id: submission.id
        }
      })
    ]);

    return NextResponse.json({ 
      message: `Successfully claimed $${netEarnings.toFixed(2)} (Net) for ${deltaViews.toLocaleString()} new views! Platform fee: $${platformFee.toFixed(2)}`,
      status: "APPROVED",
      amount: netEarnings
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process claim" }, { status: 500 });
  }
}
