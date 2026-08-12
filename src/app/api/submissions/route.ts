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
      // INSTAGRAM: Simulasi identitas Akun Sosial (Anti-Theft)
      const clipperName = (session.user as any).name;
      
      // Jika URL mengandung "curi" atau "steal", simulasikan video milik orang lain (kasus fraud)
      if (social_url.toLowerCase().includes("curi") || social_url.toLowerCase().includes("steal")) {
        author_name = "AkunOrangLain";
        author_url = "https://instagram.com/akunoranglain";
      } else {
        author_name = `@${clipperName.toLowerCase().replace(/\s+/g, '')}`;
        author_url = `https://instagram.com/${clipperName.toLowerCase().replace(/\s+/g, '')}`;
      }
      verified = true;
    }

    // Jika gagal terverifikasi hashtag-nya, tolak langsung!
    if (!verified) {
      return NextResponse.json({ 
        error: `FRAUD DETECTED: Kami tidak menemukan hashtag wajib (${requiredHashtag}) di caption/judul video Anda. Tolong masukkan hashtag tersebut agar kami tahu ini video asli Anda!` 
      }, { status: 400 });
    }

    // Fetch the campaign details to get the brand video URL
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaign_id }
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
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

    // Jika AI mendeteksi Spam
    if (aiResult.is_spam) {
      return NextResponse.json({
        error: `PENDAFTARAN DITOLAK AI: Konten video Anda terindikasi spam/bot. Alasan: ${aiResult.reason}`
      }, { status: 400 });
    }

    // Jika AI mendeteksi Sentimen Negatif
    if (aiResult.sentiment === "NEGATIVE") {
      return NextResponse.json({
        error: `PENDAFTARAN DITOLAK AI: Dilarang menggunakan bahasa yang menghina atau merendahkan produk/Brand kampanye. (Sentimen Negatif terdeteksi). Alasan: ${aiResult.reason}`
      }, { status: 400 });
    }

    // Jika AI Relevance Score < 75
    if (aiResult.relevance_score < 75) {
      return NextResponse.json({
        error: `PENDAFTARAN DITOLAK AI: Konten video Anda tidak relevan dengan kriteria kampanye Brand (Skor: ${aiResult.relevance_score}/100). Alasan: ${aiResult.reason}`
      }, { status: 400 });
    }

    // Jika lolos seleksi AI, buat data submission di database
    const submission = await prisma.submission.create({
      data: {
        campaign_id,
        clipper_id: (session.user as any).id,
        platform,
        social_url,
        relevance_score: aiResult.relevance_score,
        ai_notes: `Lolos seleksi AI awal: ${aiResult.reason}`,
        likes: clipperStats.likes,
        comments: clipperStats.comments,
        author_name,
        author_url
      }
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Submission Error", error);
    return NextResponse.json({ error: "Failed to submit link" }, { status: 500 });
  }
}
