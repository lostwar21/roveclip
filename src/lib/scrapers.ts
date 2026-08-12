interface ScrapedStats {
  views: number;
  likes: number;
  comments: number;
  caption?: string;
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

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const html = await res.text();

    // Strategy 1: Look for playCount directly in the raw HTML string
    const playCountMatch = html.match(/"playCount":\s*(\d+)/i) || html.match(/"views":\s*(\d+)/i);
    const diggCountMatch = html.match(/"diggCount":\s*(\d+)/i) || html.match(/"likes":\s*(\d+)/i);
    const commentCountMatch = html.match(/"commentCount":\s*(\d+)/i) || html.match(/"comments":\s*(\d+)/i);

    const views = playCountMatch ? parseInt(playCountMatch[1], 10) : 0;
    const likes = diggCountMatch ? parseInt(diggCountMatch[1], 10) : 0;
    const comments = commentCountMatch ? parseInt(commentCountMatch[1], 10) : 0;

    // Strategy 2: Universal Data Rehydration parser (TikTok's built-in state JSON)
    if (views === 0) {
      const rehydrationMatch = html.match(/__UNIVERSAL_DATA_FOR_REHYDRATION__\s*=\s*(\{.*?\});/);
      if (rehydrationMatch) {
        try {
          const data = JSON.parse(rehydrationMatch[1]);
          const videoData = data.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct?.stats;
          if (videoData) {
            return {
              views: videoData.playCount || 0,
              likes: videoData.diggCount || 0,
              comments: videoData.commentCount || 0,
              caption: data.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct?.desc || ""
            };
          }
        } catch (e) {
          console.error("Failed to parse TikTok UNIVERSAL_DATA JSON:", e);
        }
      }
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const caption = titleMatch ? titleMatch[1] : "";
    return { views, likes, comments, caption };
  } catch (error) {
    console.error("Error scraping TikTok:", error);
    throw new Error("Unable to parse TikTok video statistics from internet.");
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

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const html = await res.text();

    // Strategy 1: Meta tags (standard SEO / crawler optimization)
    const metaViewsMatch = html.match(/<meta\s+itemprop="interactionCount"\s+content="(\d+)"/i) ||
                           html.match(/<meta\s+content="(\d+)"\s+itemprop="interactionCount"/i);
    
    // Strategy 2: YT Initial Data structure
    const ytInitialDataMatch = html.match(/"viewCount":"(\d+)"/i);

    const views = metaViewsMatch 
      ? parseInt(metaViewsMatch[1], 10) 
      : (ytInitialDataMatch ? parseInt(ytInitialDataMatch[1], 10) : 0);

    const likesMatch = html.match(/"likeCount":"(\d+)"/i);
    const likes = likesMatch ? parseInt(likesMatch[1], 10) : 0;

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const caption = titleMatch ? titleMatch[1] : "";
    return { views, likes, comments: 0, caption };
  } catch (error) {
    console.error("Error scraping YouTube:", error);
    throw new Error("Unable to parse YouTube video statistics from internet.");
  }
}

export async function scrapeInstagram(url: string): Promise<ScrapedStats> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const html = await res.text();

    // Strategy 1: Open Graph tags / meta description which usually contains "Likes, Comments - Author on Instagram: Caption"
    const metaDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) || html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    
    let likes = 0;
    let comments = 0;
    let views = 0; // IG often doesn't show views on og meta, might just be likes.

    if (metaDescMatch) {
      const desc = metaDescMatch[1].replace(/,/g, ''); // "1000 Likes 20 Comments - Name on Instagram"
      const likesMatch = desc.match(/([\d\.]+)\s+Likes/i);
      const commentsMatch = desc.match(/([\d\.]+)\s+Comments/i);
      if (likesMatch) likes = parseInt(likesMatch[1].replace(/\./g, ''), 10);
      if (commentsMatch) comments = parseInt(commentsMatch[1].replace(/\./g, ''), 10);
    }

    // Instagram video views might be hidden in sharedData json if not login walled
    const sharedDataMatch = html.match(/window\._sharedData\s*=\s*(\{.*?\});/);
    if (sharedDataMatch) {
        try {
            const data = JSON.parse(sharedDataMatch[1]);
            const post = data.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
            if (post) {
               views = post.video_view_count || views;
               likes = post.edge_media_preview_like?.count || likes;
               comments = post.edge_media_to_parent_comment?.count || comments;
            }
        } catch (e) {
             // Ignore json parse error, fall back to meta tags
        }
    }

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const caption = titleMatch ? titleMatch[1] : (metaDescMatch ? metaDescMatch[1] : "");

    // Require at least views or likes to consider it a successful scrape, otherwise assume login wall hit
    if (views === 0 && likes === 0) {
        throw new Error("Data tersembunyi oleh Login Wall Instagram.");
    }

    return { views: views > 0 ? views : likes, likes, comments, caption }; // fallback views to likes if views not found
  } catch (error) {
    console.error("Error scraping Instagram:", error);
    throw new Error("Unable to parse Instagram video statistics. Platform requires login or API access.");
  }
}

export async function scrapeSocialVideo(url: string, platform: string): Promise<ScrapedStats> {
  const plat = platform.toUpperCase();
  if (plat === 'TIKTOK') {
    return scrapeTikTok(url);
  } else if (plat === 'YOUTUBE') {
    return scrapeYouTube(url);
  } else {
    // INSTAGRAM
    return scrapeInstagram(url);
  }
}
