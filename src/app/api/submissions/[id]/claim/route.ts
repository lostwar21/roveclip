import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reviewSubmissionWithAI } from "@/lib/gemini";
import { verifyMediaSubmission } from "@/lib/social/verifier";

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

    // Fetch live views using our Hybrid Verification Engine (API + Scraper Fallback)
    const verification = await verifyMediaSubmission(submission, (session.user as any).id);

    // Save verification snapshot for audit trails
    await prisma.verificationSnapshot.create({
      data: {
        submission_id: submission.id,
        source: verification.source,
        status: verification.status,
        media_id: verification.mediaId,
        owner_verified: verification.ownerVerified,
        views: verification.views,
        likes: verification.likes,
        comments: verification.comments,
        reach: verification.reach,
        reason: verification.reason,
      }
    });

    if (verification.views === null || verification.status === "UNAVAILABLE" || verification.status === "AUTH_REQUIRED" || verification.status === "PERMISSION_DENIED") {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: "MANUAL_REVIEW",
          snapshot_date: new Date(),
          ai_notes: verification.reason || "Tidak dapat memverifikasi views secara otomatis. Diteruskan ke review manual.",
          likes: verification.likes ?? 0,
          comments: verification.comments ?? 0,
        },
      });

      return NextResponse.json({
        status: "MANUAL_REVIEW",
        message: verification.reason || "Views video tidak dapat diverifikasi secara otomatis. Submission diteruskan ke review manual.",
      });
    }

    const liveViews = verification.views;
    const stats = { 
      views: liveViews, 
      likes: verification.likes ?? 0, 
      comments: verification.comments ?? 0, 
      caption: verification.caption || "" 
    };

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

    // Calculate Gross and Net Payouts (20% Platform Fee), bounded by remaining_budget
    const cpmRate = Number(submission.campaign.cpm_rate);
    const remainingBudget = Number(submission.campaign.remaining_budget);
    
    let theoreticalGross = (deltaViews / 1000) * cpmRate;
    let actualGross = Math.min(theoreticalGross, remainingBudget);

    if (actualGross <= 0) {
      // Auto-complete campaign if budget is effectively zero
      if (remainingBudget <= 0 && submission.campaign.status === 'ACTIVE') {
        await prisma.campaign.update({
          where: { id: submission.campaign.id },
          data: { status: 'COMPLETED' }
        });
      }
      return NextResponse.json({ error: "Kampanye ini sudah kehabisan anggaran (budget). Tidak ada pencairan baru." }, { status: 400 });
    }

    const platformFee = actualGross * 0.20;
    const netEarnings = actualGross - platformFee;

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
      const { scrapeSocialVideo } = require("@/lib/scrapers");
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
        console.log(`[AI APPROVED] Claim of Rp${actualGross.toFixed(2)} approved automatically. Score: ${aiResult.relevance_score}/100. Reason: ${aiResult.reason}`);
        // Let it fall through to process auto-approve!
      } else {
        const flagReason = aiResult.relevance_score < 75 
          ? `Skor relevansi AI terlalu rendah (${aiResult.relevance_score}/100). ${aiResult.reason}`
          : aiResult.reason;

        console.log(`[AI FLAGGED] Claim of Rp${actualGross.toFixed(2)} flagged. Reason: ${flagReason}`);
        
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

    // Update the transaction logic to rely on Campaign budgets instead of direct brand wallet subtraction
    const updatedStatus = (remainingBudget - actualGross <= 0) ? 'COMPLETED' : submission.campaign.status;

    // Auto-Approve Atomic Transaction
    await prisma.$transaction([
      // Update Submission
      prisma.submission.update({
        where: { 
          id: submission.id,
          validated_views: submission.validated_views // Idempotency check: ensures views haven't been updated concurrently
        },
        data: { 
          validated_views: liveViews, 
          snapshot_date: new Date(), 
          status: 'APPROVED',
          relevance_score: aiRelevanceScore,
          likes: stats.likes,
          comments: stats.comments
        }
      }),
      // Deduct from Campaign Budgets instead of brand wallet
      prisma.campaign.update({
        where: { id: submission.campaign.id },
        data: {
          reserved_budget: { decrement: actualGross },
          remaining_budget: { decrement: actualGross },
          spent_budget: { increment: actualGross },
          status: updatedStatus
        }
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
      // Ledger: Brand's Spend (recorded against brand to show usage)
      prisma.transactionLedger.create({
        data: {
          user_id: submission.campaign.brand_id,
          amount: -actualGross,
          type: 'PAYOUT',
          reference_id: submission.id
        }
      }),
      // Ledger: Platform Fee
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
      message: `Berhasil klaim Rp${netEarnings.toLocaleString('id-ID')} (Net) untuk ${deltaViews.toLocaleString()} views baru! Biaya platform: Rp${platformFee.toLocaleString('id-ID')}`,
      status: "APPROVED",
      amount: netEarnings
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process claim" }, { status: 500 });
  }
}
