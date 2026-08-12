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
    return NextResponse.json(stats);
  } catch (error: any) {
    // We log it as a warning/info rather than a critical stacktrace error, since scraper blocks are expected
    console.warn("Admin view checking info:", error.message);
    return NextResponse.json({ 
      error: error.message || "Gagal menarik data live dari internet. Pastikan video publik." 
    }, { status: 422 });
  }
}
