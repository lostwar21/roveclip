import { scrapeSocialVideo } from "@/lib/scrapers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized. Admins only." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const platform = searchParams.get("platform");

    if (!url || !platform) {
      return NextResponse.json({ error: "Missing required query parameters: url and platform" }, { status: 400 });
    }

    const stats = await scrapeSocialVideo(url, platform);

    if (platform === "INSTAGRAM" && stats.verificationStatus !== "VERIFIED") {
      return NextResponse.json({
        ok: true,
        status: stats.verificationStatus,
        verified: false,
        message:
          "Instagram tidak memberikan metrik views pada request publik ini. Gunakan koneksi akun Instagram atau lanjutkan ke review manual.",
        stats,
      });
    }

    return NextResponse.json({
      ok: true,
      status: stats.verificationStatus ?? "VERIFIED",
      verified: true,
      stats,
    });
  } catch (error: any) {
    console.error("Admin view checking error:", error);
    return NextResponse.json({ 
      error: error.message || "Gagal menarik data live dari internet." 
    }, { status: 500 });
  }
}
