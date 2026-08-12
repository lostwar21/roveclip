export interface ScrapedStats {
  views: number | null;
  likes: number | null;
  comments: number | null;
  caption?: string;
  verificationStatus:
    | "VERIFIED"
    | "UNAVAILABLE"
    | "LOGIN_REQUIRED"
    | "NOT_FOUND";
  source: "PUBLIC_HTML" | "INSTAGRAM_API";
}

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function scrapeTikTok(url: string): Promise<ScrapedStats> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (!res.ok) {
       return { views: null, likes: null, comments: null, verificationStatus: "NOT_FOUND", source: "PUBLIC_HTML" };
    }
    const html = await res.text();

    const playCountMatch = html.match(/"playCount":\s*(\d+)/i) || html.match(/"views":\s*(\d+)/i);
    const diggCountMatch = html.match(/"diggCount":\s*(\d+)/i) || html.match(/"likes":\s*(\d+)/i);
    const commentCountMatch = html.match(/"commentCount":\s*(\d+)/i) || html.match(/"comments":\s*(\d+)/i);

    let views = playCountMatch ? parseInt(playCountMatch[1], 10) : 0;
    let likes = diggCountMatch ? parseInt(diggCountMatch[1], 10) : 0;
    let comments = commentCountMatch ? parseInt(commentCountMatch[1], 10) : 0;

    if (views === 0) {
      const rehydrationMatch = html.match(/__UNIVERSAL_DATA_FOR_REHYDRATION__\s*=\s*(\{.*?\});/);
      if (rehydrationMatch) {
        try {
          const data = JSON.parse(rehydrationMatch[1]);
          const videoData = data.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct?.stats;
          if (videoData) {
            views = videoData.playCount || views;
            likes = videoData.diggCount || likes;
            comments = videoData.commentCount || comments;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const caption = titleMatch ? titleMatch[1] : "";

    if (views > 0) {
      return { views, likes, comments, caption, verificationStatus: "VERIFIED", source: "PUBLIC_HTML" };
    }
    
    return { views: null, likes, comments, caption, verificationStatus: "UNAVAILABLE", source: "PUBLIC_HTML" };
  } catch (error) {
    return { views: null, likes: null, comments: null, verificationStatus: "UNAVAILABLE", source: "PUBLIC_HTML" };
  }
}

export async function scrapeYouTube(url: string): Promise<ScrapedStats> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!res.ok) {
       return { views: null, likes: null, comments: null, verificationStatus: "NOT_FOUND", source: "PUBLIC_HTML" };
    }
    const html = await res.text();

    const metaViewsMatch = html.match(/<meta\s+itemprop="interactionCount"\s+content="(\d+)"/i) ||
                           html.match(/<meta\s+content="(\d+)"\s+itemprop="interactionCount"/i);
    const ytInitialDataMatch = html.match(/"viewCount":"(\d+)"/i);

    const views = metaViewsMatch 
      ? parseInt(metaViewsMatch[1], 10) 
      : (ytInitialDataMatch ? parseInt(ytInitialDataMatch[1], 10) : 0);

    const likesMatch = html.match(/"likeCount":"(\d+)"/i);
    const likes = likesMatch ? parseInt(likesMatch[1], 10) : 0;

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const caption = titleMatch ? titleMatch[1] : "";
    
    if (views > 0) {
      return { views, likes, comments: 0, caption, verificationStatus: "VERIFIED", source: "PUBLIC_HTML" };
    }

    return { views: null, likes, comments: 0, caption, verificationStatus: "UNAVAILABLE", source: "PUBLIC_HTML" };
  } catch (error) {
    return { views: null, likes: null, comments: null, verificationStatus: "UNAVAILABLE", source: "PUBLIC_HTML" };
  }
}

export async function scrapeInstagram(url: string): Promise<ScrapedStats> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!res.ok) {
      return { views: null, likes: null, comments: null, verificationStatus: "NOT_FOUND", source: "PUBLIC_HTML" };
    }

    const html = await res.text();

    const metaDescMatch =
      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);

    let likes: number | null = null;
    let comments: number | null = null;
    let views: number | null = null;

    if (metaDescMatch) {
      const desc = metaDescMatch[1];
      const likesMatch = desc.match(/([\d,.]+)\s+Likes?/i);
      const commentsMatch = desc.match(/([\d,.]+)\s+Comments?/i);

      if (likesMatch) {
        likes = Number(likesMatch[1].replace(/[,.]/g, ""));
      }

      if (commentsMatch) {
        comments = Number(commentsMatch[1].replace(/[,.]/g, ""));
      }
    }

    const sharedDataMatch = html.match(/window\._sharedData\s*=\s*(\{[\s\S]*?\});/);

    if (sharedDataMatch) {
      try {
        const data = JSON.parse(sharedDataMatch[1]);
        const post = data.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;

        if (post) {
          views = post.video_view_count ?? null;
          likes = post.edge_media_preview_like?.count ?? likes;
          comments = post.edge_media_to_parent_comment?.count ?? comments;
        }
      } catch {
        // Ignore
      }
    }

    const caption = titleMatch?.[1] ?? metaDescMatch?.[1] ?? "";

    if (views !== null && views > 0) {
      return { views, likes, comments, caption, verificationStatus: "VERIFIED", source: "PUBLIC_HTML" };
    }

    return {
      views: null,
      likes,
      comments,
      caption,
      verificationStatus: likes !== null ? "LOGIN_REQUIRED" : "UNAVAILABLE",
      source: "PUBLIC_HTML",
    };
  } catch (error) {
    console.error("Instagram verification failed:", error);
    return { views: null, likes: null, comments: null, verificationStatus: "UNAVAILABLE", source: "PUBLIC_HTML" };
  }
}

export async function scrapeSocialVideo(url: string, platform: string): Promise<ScrapedStats> {
  const plat = platform.toUpperCase();
  if (plat === 'TIKTOK') {
    return scrapeTikTok(url);
  } else if (plat === 'YOUTUBE') {
    return scrapeYouTube(url);
  } else {
    return scrapeInstagram(url);
  }
}
