import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { scrapeSocialVideo } from "@/lib/scrapers";
import { reviewSubmissionWithAI } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'CLIPPER') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { campaign_id, social_url, platform } = body;

    if (!campaign_id || !social_url || !platform) {
       return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Tentukan Hashtag Wajib
    const requiredHashtag = `#Rove${campaign_id.substring(0, 6)}`;

    // Cek duplikasi link secara global (Anti-Fraud)
    const duplicateSubmission = await prisma.submission.findFirst({
      where: { social_url: social_url }
    });

    if (duplicateSubmission) {
      return NextResponse.json({ 
        error: "Link video ini sudah pernah terdaftar di sistem kami. Anda tidak bisa mendaftarkan satu video yang sama lebih dari sekali." 
      }, { status: 400 });
    }

    let verified = false;
    let author_name: string | null = null;
    let author_url: string | null = null;

    // Verifikasi Anti-Fraud & Capture Data Identitas Pembuat Asli via oEmbed API
    if (platform === 'TIKTOK') {
      try {
        const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=${social_url}`);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          const caption = (data.title || "").toLowerCase();
          if (caption.includes(requiredHashtag.toLowerCase())) {
            verified = true;
            author_name = data.author_name || null;
            author_url = data.author_url || null;
          }
        }
      } catch (err) {
        console.error("TikTok oEmbed Error", err);
      }
    } else if (platform === 'YOUTUBE') {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${social_url}&format=json`);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          const caption = (data.title || "").toLowerCase();
          if (caption.includes(requiredHashtag.toLowerCase())) {
            verified = true;
            author_name = data.author_name || null;
            author_url = data.author_url || null;
          }
        }
      } catch (err) {
        console.error("YouTube oEmbed Error", err);
      }
    } else {
      // INSTAGRAM: Best-effort extraction without official oEmbed token
      const clipperName = (session.user as any).name;
      const urlParts = social_url.split("/");
      const possibleUsername = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1]; // e.g. instagram.com/username/reel/...
      
      author_name = `@${possibleUsername}`;
      author_url = `https://instagram.com/${possibleUsername}`;
      verified = true; // Rely on AI and scrape Instagram stats to validate authenticity later
    }

    // Jika gagal terverifikasi hashtag-nya, tolak langsung!
    if (!verified) {
      return NextResponse.json({ 
        error: `FRAUD DETECTED: Kami tidak menemukan hashtag wajib (${requiredHashtag}) di caption/judul video Anda. Tolong masukkan hashtag tersebut agar kami tahu ini video asli Anda!` 
      }, { status: 400 });
    }

    // Fetch the campaign details to get the brand video URL and validate status
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaign_id }
    });
    
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: `Campaign ini sudah tidak aktif (Status: ${campaign.status}). Anda tidak dapat mendaftarkan video ke campaign yang sudah berakhir atau di-pause.` 
      }, { status: 400 });
    }

    // Scrape Clipper Video Stats (Caption, likes, views)
    let clipperStats;
    try {
      clipperStats = await scrapeSocialVideo(social_url, platform);
    } catch (err) {
      return NextResponse.json({ error: "Gagal memverifikasi video Clipper. Pastikan video publik." }, { status: 400 });
    }

    // Scrape Brand Campaign Video Title/Caption
    let campaignTitle = "";
    try {
      const detectPlatform = (uUrl: string): string => {
        const u = uUrl.toLowerCase();
        if (u.includes("tiktok.com")) return "TIKTOK";
        if (u.includes("youtube.com") || u.includes("youtu.be")) return "YOUTUBE";
        if (u.includes("instagram.com")) return "INSTAGRAM";
        return "YOUTUBE";
      };
      const campaignPlatform = detectPlatform(campaign.video_url);
      const campaignStats = await scrapeSocialVideo(campaign.video_url, campaignPlatform);
      campaignTitle = campaignStats.caption || "";
    } catch (err) {
      console.error("Gagal menarik judul video kampanye Brand:", err);
    }

    // Panggil AI Llama 3.3 untuk validasi kecocokan tema di pintu masuk (Entry Gate)
    const aiResult = await reviewSubmissionWithAI(
      campaign.video_url,
      campaignTitle,
      clipperStats.caption || "",
      social_url,
      platform
    );

    let finalStatus: 'PENDING' | 'MANUAL_REVIEW' = 'PENDING';
    let aiNotes = `Lolos seleksi AI awal: ${aiResult.reason}`;

    if (!aiResult.approved || aiResult.is_spam || aiResult.sentiment === "NEGATIVE" || aiResult.relevance_score < 75) {
        finalStatus = 'MANUAL_REVIEW';
        aiNotes = `🚨 Ditahan AI: ${aiResult.reason} (Skor: ${aiResult.relevance_score}, Spam: ${aiResult.is_spam}, Sentiment: ${aiResult.sentiment})`;
    }

    // Buat data submission di database terlepas dari hasil AI, sehingga tidak ada data yang hilang
    const submission = await prisma.submission.create({
      data: {
        campaign_id,
        clipper_id: (session.user as any).id,
        platform,
        social_url,
        status: finalStatus,
        relevance_score: aiResult.relevance_score,
        ai_notes: aiNotes,
        likes: clipperStats.likes ?? 0,
        comments: clipperStats.comments ?? 0,
        author_name,
        author_url
      }
    });

    return NextResponse.json({
      message: finalStatus === 'MANUAL_REVIEW' 
        ? "Video berhasil didaftarkan namun memerlukan tinjauan manual dari Admin (Ditahan AI)." 
        : "Video berhasil didaftarkan!",
      submission
    });
  } catch (error) {
    console.error("Submission Error", error);
    return NextResponse.json({ error: "Failed to submit link" }, { status: 500 });
  }
}
