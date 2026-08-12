export interface VerificationResult {
  status:
    | "VERIFIED"
    | "UNVERIFIED"
    | "MANUAL_REVIEW"
    | "NOT_FOUND"
    | "AUTH_REQUIRED"
    | "PERMISSION_DENIED"
    | "UNAVAILABLE"
    | "LOGIN_REQUIRED";

  source:
    | "INSTAGRAM_API"
    | "PUBLIC_METADATA"
    | "MANUAL";

  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE";

  mediaId?: string;
  ownerVerified: boolean;

  views: number | null;
  likes: number | null;
  comments: number | null;
  reach?: number | null;
  caption?: string | null;

  checkedAt: Date;
  reason?: string;
}

export interface SocialProvider {
  getAuthorizationUrl(state: string, redirectUri: string): string;
  exchangeCodeForToken(code: string, redirectUri: string): Promise<any>;
  getCurrentUser(accessToken: string): Promise<{ id: string, username: string }>;
  resolveMedia(accessToken: string, socialUrl: string): Promise<{ mediaId: string, ownerId: string }>;
  getMediaMetrics(accessToken: string, mediaId: string): Promise<VerificationResult>;
  verifyMediaOwnership(ownerId: string, expectedUserId: string): boolean;
}
