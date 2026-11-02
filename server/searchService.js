// server/searchService.js

// In-memory cache for search results to preserve API quota
const searchCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Clean up HTML entities in titles
 */
function cleanTitle(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Helper to recursively search for video objects in YouTube's ytInitialData
 */
function extractVideosFromObj(obj, results = [], max = 10) {
  if (!obj || typeof obj !== 'object' || results.length >= max) return results;

  // 1. Classic videoRenderer format
  if (obj.videoId && obj.title) {
    const title = obj.title?.runs ? obj.title.runs.map(r => r.text).join('') : (obj.title?.simpleText || '');
    const channel = obj.ownerText?.runs ? obj.ownerText.runs.map(r => r.text).join('') : (obj.shortBylineText?.runs?.map(r => r.text).join('') || 'YouTube');
    const thumbnail = obj.thumbnail?.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${obj.videoId}/hqdefault.jpg`;

    if (title && !results.some(r => r.videoId === obj.videoId)) {
      results.push({
        videoId: obj.videoId,
        title: cleanTitle(title),
        channelTitle: cleanTitle(channel),
        thumbnail,
        duration: 0
      });
    }
    return results;
  }

  // 2. Modern lockupViewModel format
  if (obj.lockupViewModel) {
    const item = obj.lockupViewModel;
    const videoId = item.contentId || item.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
    const title = item.metadata?.lockupMetadataViewModel?.title?.content;
    const channel = item.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || 'YouTube';
    if (videoId && title && !results.some(r => r.videoId === videoId)) {
      results.push({
        videoId,
        title: cleanTitle(title),
        channelTitle: cleanTitle(channel),
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: 0
      });
    }
  }

  // Traverse children
  for (const key of Object.keys(obj)) {
    if (results.length >= max) break;
    extractVideosFromObj(obj[key], results, max);
  }

  return results;
}

/**
 * Search YouTube with cache and fallback
 */
async function searchSongs(query, apiKey) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // 1. Check in-memory cache first (0 quota cost!)
  const cached = searchCache.get(normalizedQuery);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.results;
  }

  let results = [];

  // 2. Official YouTube Data API v3 (if key provided)
  if (apiKey) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=8&q=${encodeURIComponent(query)}&key=${apiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        results = data.items
          .filter(item => item.id && item.id.videoId)
          .map(item => ({
            videoId: item.id.videoId,
            title: cleanTitle(item.snippet.title),
            channelTitle: cleanTitle(item.snippet.channelTitle),
            thumbnail: item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`,
            duration: 0
          }));
      }
    } catch (err) {
      console.warn('YouTube Data API search error, falling back to public search:', err.message);
    }
  }

  // 3. Robust Public Search Fallback (Works 100% free even without Google Cloud key)
  if (!results || results.length === 0) {
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' song')}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        const html = await res.text();
        const jsonMatch = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);

        if (jsonMatch) {
          const ytData = JSON.parse(jsonMatch[1]);
          results = extractVideosFromObj(ytData, [], 10);
        }
      }
    } catch (fallbackErr) {
      console.warn('Fallback public search failed:', fallbackErr.message);
    }
  }

  // Cache and return results
  if (results.length > 0) {
    searchCache.set(normalizedQuery, {
      results,
      timestamp: Date.now()
    });
  }

  return results;
}

module.exports = {
  searchSongs
};
