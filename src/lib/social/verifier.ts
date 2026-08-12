import prisma from "@/lib/prisma";
import { VerificationResult } from "./types";
import { instagramProvider } from "./instagram";
import { decryptToken } from "./encryption";
import { scrapeSocialVideo } from "../scrapers";

export async function verifyMediaSubmission(
  submission: any,
  clipperId: string
): Promise<VerificationResult> {
  const platform = submission.platform;

  if (platform === "INSTAGRAM") {
    // 1. Cek koneksi resmi
    const connection = await prisma.socialConnection.findFirst({
      where: {
        user_id: clipperId,
        platform: "INSTAGRAM",
      },
    });

    if (connection) {
      try {
        const accessToken = decryptToken(connection.access_token_enc);
        
        // 2. Resolve media ID dari URL publik
        // Catatan: Jika resolve gagal (karena media bukan milik user ini), maka throw Error.
        const { mediaId, ownerId } = await instagramProvider.resolveMedia(
          accessToken,
          submission.social_url
        );

        // 3. Pastikan kepemilikan
        if (!instagramProvider.verifyMediaOwnership(ownerId, connection.platform_user_id)) {
          return {
            status: "PERMISSION_DENIED",
            source: "INSTAGRAM_API",
            platform: "INSTAGRAM",
            ownerVerified: false,
            views: null,
            likes: null,
            comments: null,
            checkedAt: new Date(),
            reason: "URL video tidak cocok dengan akun Instagram yang terhubung.",
          };
        }

        // 4. Ambil metrik
        const metrics = await instagramProvider.getMediaMetrics(accessToken, mediaId);
        return metrics;

      } catch (err: any) {
        console.error("Instagram Verification Error:", err);
        return {
          status: "UNAVAILABLE",
          source: "INSTAGRAM_API",
          platform: "INSTAGRAM",
          ownerVerified: false,
          views: null,
          likes: null,
          comments: null,
          checkedAt: new Date(),
          reason: err.message,
        };
      }
    }
  }

  // 5. Fallback ke Scraper (Untuk TikTok, YouTube, atau Instagram tanpa koneksi)
  try {
    const stats = await scrapeSocialVideo(submission.social_url, platform);
    
    if (stats.views === null) {
      return {
        status: "AUTH_REQUIRED",
        source: "PUBLIC_METADATA",
        platform: platform,
        ownerVerified: false,
        views: null,
        likes: stats.likes ?? null,
        comments: stats.comments ?? null,
        caption: stats.caption ?? null,
        checkedAt: new Date(),
        reason: "Login Wall atau proteksi bot menghalangi akses ke jumlah tayangan (views).",
      };
    }

    return {
      status: "VERIFIED",
      source: "PUBLIC_METADATA",
      platform: platform,
      ownerVerified: false, // Scraper publik tidak bisa verifikasi owner
      views: stats.views,
      likes: stats.likes ?? null,
      comments: stats.comments ?? null,
      caption: stats.caption ?? null,
      checkedAt: new Date(),
    };
  } catch (err: any) {
    return {
      status: "UNAVAILABLE",
      source: "PUBLIC_METADATA",
      platform: platform,
      ownerVerified: false,
      views: null,
      likes: null,
      comments: null,
      checkedAt: new Date(),
      reason: err.message,
    };
  }
}
