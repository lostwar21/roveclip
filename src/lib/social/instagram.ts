import { SocialProvider, VerificationResult } from "./types";

export class InstagramProvider implements SocialProvider {
  private appId: string;
  private appSecret: string;
  private version: string;

  constructor() {
    this.appId = process.env.INSTAGRAM_APP_ID || '';
    this.appSecret = process.env.INSTAGRAM_APP_SECRET || '';
    this.version = process.env.INSTAGRAM_GRAPH_VERSION || 'v19.0';
  }

  getAuthorizationUrl(state: string, redirectUri: string): string {
    // Menggunakan Meta Graph API (Facebook Login) untuk mendapatkan akses ke Instagram Professional Account
    const scopes = [
      'instagram_basic', 
      'instagram_manage_insights', 
      'pages_show_list', 
      'pages_read_engagement'
    ].join(',');
    
    return `https://www.facebook.com/${this.version}/dialog/oauth?client_id=${this.appId}&redirect_uri=${redirectUri}&state=${state}&scope=${scopes}&response_type=code`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<any> {
    const url = `https://graph.facebook.com/${this.version}/oauth/access_token?client_id=${this.appId}&redirect_uri=${redirectUri}&client_secret=${this.appSecret}&code=${code}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to exchange code: ${await res.text()}`);
    }
    const data = await res.json();
    return data;
  }

  async getCurrentUser(accessToken: string): Promise<{ id: string, username: string }> {
    // 1. Dapatkan halaman Facebook yang dikelola oleh user ini
    const pagesRes = await fetch(`https://graph.facebook.com/${this.version}/me/accounts?access_token=${accessToken}`);
    if (!pagesRes.ok) throw new Error("Gagal mengambil daftar halaman Facebook");
    const pagesData = await pagesRes.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error("Tidak ada Halaman Facebook yang terhubung dengan akun ini.");
    }

    // 2. Iterasi untuk mencari halaman yang memiliki Instagram Business Account
    for (const page of pagesData.data) {
      const igRes = await fetch(`https://graph.facebook.com/${this.version}/${page.id}?fields=instagram_business_account&access_token=${accessToken}`);
      const igData = await igRes.json();
      
      if (igData.instagram_business_account) {
        const igAccountId = igData.instagram_business_account.id;
        
        // 3. Ambil username Instagram
        const profileRes = await fetch(`https://graph.facebook.com/${this.version}/${igAccountId}?fields=username&access_token=${accessToken}`);
        const profileData = await profileRes.json();
        
        return {
          id: igAccountId,
          username: profileData.username
        };
      }
    }

    throw new Error("Akun Instagram Professional tidak ditemukan pada halaman Facebook yang terhubung.");
  }

  async resolveMedia(accessToken: string, socialUrl: string): Promise<{ mediaId: string, ownerId: string }> {
    // Secara teknis, dari URL publik kita harus mengambil Shortcode
    // e.g. https://www.instagram.com/reel/C1234567890/ -> C1234567890
    const match = socialUrl.match(/\/(?:reel|p)\/([A-Za-z0-9_-]+)/i);
    if (!match) throw new Error("URL Instagram tidak valid atau tidak memiliki shortcode yang dikenali.");
    const shortcode = match[1];

    // Karena Official Meta API tidak menyediakan endpoint `/media/shortcode` secara langsung untuk mendapatkan IG Media ID bagi 3rd party secara gampang tanpa oEmbed,
    // Kita harus mencari media ini di daftar media milik user.
    // Dapatkan IG User ID dari sesi ini
    const user = await this.getCurrentUser(accessToken);
    
    // Tarik daftar media user dan cocokkan shortcode
    const mediaRes = await fetch(`https://graph.facebook.com/${this.version}/${user.id}/media?fields=shortcode,id&limit=100&access_token=${accessToken}`);
    const mediaData = await mediaRes.json();
    
    if (!mediaData.data) throw new Error("Gagal mengambil daftar media dari API Instagram.");
    
    const media = mediaData.data.find((m: any) => m.shortcode === shortcode);
    if (!media) {
      throw new Error("Video tidak ditemukan di akun Instagram Anda yang terhubung. Pastikan URL benar dan video tersebut milik akun ini.");
    }

    return { mediaId: media.id, ownerId: user.id };
  }

  async getMediaMetrics(accessToken: string, mediaId: string): Promise<VerificationResult> {
    try {
      // Ambil metrik dasar (likes, comments, caption) dan metrik insight (plays/views, reach)
      const res = await fetch(`https://graph.facebook.com/${this.version}/${mediaId}?fields=like_count,comments_count,media_type,caption&access_token=${accessToken}`);
      const basicData = await res.json();
      
      if (basicData.error) {
        throw new Error(basicData.error.message);
      }

      // Ambil Insights untuk plays (views)
      let plays = null;
      let reach = null;
      
      const insightsRes = await fetch(`https://graph.facebook.com/${this.version}/${mediaId}/insights?metric=plays,reach&access_token=${accessToken}`);
      const insightsData = await insightsRes.json();
      
      if (insightsData.data) {
        const playsMetric = insightsData.data.find((m: any) => m.name === 'plays');
        const reachMetric = insightsData.data.find((m: any) => m.name === 'reach');
        
        if (playsMetric && playsMetric.values && playsMetric.values.length > 0) {
          plays = playsMetric.values[0].value;
        }
        if (reachMetric && reachMetric.values && reachMetric.values.length > 0) {
          reach = reachMetric.values[0].value;
        }
      }

      return {
        status: plays !== null ? "VERIFIED" : "UNVERIFIED",
        source: "INSTAGRAM_API",
        platform: "INSTAGRAM",
        mediaId: mediaId,
        ownerVerified: true,
        views: plays,
        likes: basicData.like_count ?? null,
        comments: basicData.comments_count ?? null,
        reach: reach,
        caption: basicData.caption ?? null,
        checkedAt: new Date()
      };

    } catch (error: any) {
      console.error("Instagram API Metrics Error:", error);
      return {
        status: "UNAVAILABLE",
        source: "INSTAGRAM_API",
        platform: "INSTAGRAM",
        ownerVerified: false,
        views: null,
        likes: null,
        comments: null,
        checkedAt: new Date(),
        reason: error.message
      };
    }
  }

  verifyMediaOwnership(ownerId: string, expectedUserId: string): boolean {
    return ownerId === expectedUserId;
  }
}

export const instagramProvider = new InstagramProvider();
