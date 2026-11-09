// server/lyricsService.js
// Synchronized LRC Lyrics Service with caching

const lyricsCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Clean title to improve lyrics match rate
 */
function cleanSongTitle(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\(Official[^\)]*\)/gi, '')
    .replace(/\[Official[^\]]*\]/gi, '')
    .replace(/\(Audio[^\)]*\)/gi, '')
    .replace(/\[Audio[^\]]*\]/gi, '')
    .replace(/\(Lyric[^\)]*\)/gi, '')
    .replace(/\[Lyric[^\]]*\]/gi, '')
    .replace(/\(Video[^\)]*\)/gi, '')
    .replace(/\[Video[^\]]*\]/gi, '')
    .replace(/\(4K[^\)]*\)/gi, '')
    .replace(/\[4K[^\]]*\]/gi, '')
    .replace(/\(Visualizer[^\)]*\)/gi, '')
    .replace(/\(From "[^"]*"\)/gi, '')
    .replace(/feat\..*$/gi, '')
    .replace(/ft\..*$/gi, '')
    .replace(/Prod\.? by.*$/gi, '')
    .replace(/\|.*$/g, '')
    .replace(/-.*$/g, '')
    .trim();
}

/**
 * Clean artist name
 */
function cleanArtist(channelTitle) {
  if (!channelTitle) return '';
  return channelTitle
    .replace(/VEVO$/i, '')
    .replace(/ - Topic$/i, '')
    .replace(/Official$/i, '')
    .replace(/Music.*$/i, '')
    .replace(/Records.*$/i, '')
    .replace(/Company.*$/i, '')
    .replace(/Films.*$/i, '')
    .trim();
}

/**
 * Parse standard LRC format string into timestamped lines
 * [mm:ss.xx] Lyric text
 */
function parseLrc(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const parsed = [];
  const timeRegex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Skip metadata headers like [ar:Artist], [ti:Title]
    if (/^\[(ti|ar|al|by|offset|length):/i.test(trimmed)) continue;

    let match;
    const timestamps = [];
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const mins = parseFloat(match[1]);
      const secs = parseFloat(match[2]);
      timestamps.push(mins * 60 + secs);
    }

    const text = trimmed.replace(timeRegex, '').trim();
    if (timestamps.length > 0 && text) {
      for (const time of timestamps) {
        parsed.push({ time, text });
      }
    }
  }

  // Sort chronologically
  return parsed.sort((a, b) => a.time - b.time);
}

/**
 * Fetch synchronized or plain lyrics for a song
 */
async function getLyrics({ videoId, title, channelTitle, duration }) {
  if (!title) return { success: false, error: 'No title provided' };

  // Check in-memory cache
  const cacheKey = videoId || `${title}_${channelTitle}`;
  if (lyricsCache.has(cacheKey)) {
    const cached = lyricsCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const cleanTitle = cleanSongTitle(title);
  const cleanArt = cleanArtist(channelTitle);

  try {
    // 1. Primary Query: "Title Artist"
    const query = cleanArt ? `${cleanTitle} ${cleanArt}` : cleanTitle;
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MusicRoom/2.0 (contact@musicroom.internal)'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        // Pick best candidate with synced lyrics first
        const bestCandidate = results.find(r => r.syncedLyrics) || results[0];

        if (bestCandidate.syncedLyrics) {
          const lines = parseLrc(bestCandidate.syncedLyrics);
          if (lines.length > 0) {
            const data = {
              success: true,
              synced: true,
              lines,
              source: 'synced_lrc'
            };
            lyricsCache.set(cacheKey, { timestamp: Date.now(), data });
            return data;
          }
        }

        // Fallback to plain lyrics
        if (bestCandidate.plainLyrics) {
          const rawLines = bestCandidate.plainLyrics
            .split('\n')
            .map(l => l.trim())
            .filter(Boolean);
          const data = {
            success: true,
            synced: false,
            plainText: bestCandidate.plainLyrics,
            lines: rawLines.map((text, i) => ({ time: i * 4, text })),
            source: 'plain_text'
          };
          lyricsCache.set(cacheKey, { timestamp: Date.now(), data });
          return data;
        }
      }
    }
  } catch (err) {
    console.warn(`[Lyrics] Fetch error for "${cleanTitle}":`, err.message);
  }

  const notFound = {
    success: false,
    synced: false,
    lines: [],
    error: 'Lyrics unavailable for this track'
  };
  lyricsCache.set(cacheKey, { timestamp: Date.now(), data: notFound });
  return notFound;
}

module.exports = {
  getLyrics,
  parseLrc
};
