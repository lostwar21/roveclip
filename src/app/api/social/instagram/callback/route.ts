import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { instagramProvider } from "@/lib/social/instagram";
import { encryptToken } from "@/lib/social/encryption";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // User ID
    const error = searchParams.get("error");
    
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/social/instagram/callback`;

    if (error) {
      console.error("Instagram OAuth Error:", searchParams.get("error_description"));
      return NextResponse.redirect(`${baseUrl}/clipper/dashboard?error=oauth_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/clipper/dashboard?error=invalid_oauth_request`);
    }

    // 1. Exchange code for access token
    const tokenData = await instagramProvider.exchangeCodeForToken(code, redirectUri);
    const accessToken = tokenData.access_token;
    
    // 2. Get user info using the token (ensure they have an IG professional account)
    const igUser = await instagramProvider.getCurrentUser(accessToken);

    // 3. Encrypt the token before saving
    const encryptedToken = encryptToken(accessToken);
    
    // Calculate expiration if provided
    let expiresAt = null;
    if (tokenData.expires_in) {
      expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    }

    // 4. Save or update the SocialConnection in DB
    await prisma.socialConnection.upsert({
      where: {
        platform_platform_user_id: {
          platform: "INSTAGRAM",
          platform_user_id: igUser.id,
        },
      },
      update: {
        user_id: state,
        username: igUser.username,
        access_token_enc: encryptedToken,
        token_expires_at: expiresAt,
      },
      create: {
        user_id: state,
        platform: "INSTAGRAM",
        platform_user_id: igUser.id,
        username: igUser.username,
        access_token_enc: encryptedToken,
        token_expires_at: expiresAt,
      },
    });

    return NextResponse.redirect(`${baseUrl}/clipper/dashboard?success=instagram_connected`);

  } catch (err: any) {
    console.error("Callback Error:", err);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    return NextResponse.redirect(`${protocol}://${host}/clipper/dashboard?error=connection_failed`);
  }
}
