// server/sponsorBlockService.js
// Fetches and caches SponsorBlock skip segments for YouTube video IDs
// Specifically targets non-music intro/outro skits and sponsor segments

const segmentsCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Fetch skip segments for a given video ID
 * @param {string} videoId 
 * @returns {Promise<Array<{category: string, start: number, end: number}>>}
 */
async function getSkipSegments(videoId) {
  if (!videoId || typeof videoId !== 'string' || videoId.length !== 11) {
    return [];
  }

  if (segmentsCache.has(videoId)) {
    const cached = segmentsCache.get(videoId);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.segments;
    }
  }

  try {
    const categoriesParam = encodeURIComponent(JSON.stringify(['music_offtopic', 'intro', 'outro', 'sponsor']));
    const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}&categories=${categoriesParam}`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(3500)
    });

    if (res.status === 404) {
      // 404 means no skip segments recorded for this video
      segmentsCache.set(videoId, { timestamp: Date.now(), segments: [] });
      return [];
    }

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    const segments = Array.isArray(data)
      ? data.map(item => ({
          category: item.category,
          start: Math.round((item.segment[0] || 0) * 10) / 10,
          end: Math.round((item.segment[1] || 0) * 10) / 10
        })).sort((a, b) => a.start - b.start)
      : [];

    segmentsCache.set(videoId, { timestamp: Date.now(), segments });
    return segments;
  } catch (err) {
    console.warn(`[SponsorBlock] Lookup failed for ${videoId}:`, err.message);
    return [];
  }
}

module.exports = {
  getSkipSegments
};

