import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { instagramProvider } from "@/lib/social/instagram";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;
  const redirectUri = `${baseUrl}/api/social/instagram/callback`;

  // State is used to prevent CSRF and pass session state
  const state = (session.user as any).id;
  
  const authUrl = instagramProvider.getAuthorizationUrl(state, redirectUri);
  
  return NextResponse.redirect(authUrl);
}
