// server/lyricsService.js
// Synchronized LRC Lyrics Service with multi-strategy matching and caching

const lyricsCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const RECORD_LABEL_REGEX = /\b(t-series|tseries|sony music|zee music|yrf|tips|saregama|speed records|geet mp3|white hill|times music|universal music|warner music|dm desi music|vyrf|records|company|films|entertainment|vevo|music)\b/i;

/**
 * Clean title to improve lyrics match rate
 */
function cleanSongTitle(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\((Official|Music|Lyrical|Full|Visualizer|HD|4K|Audio|Video)[^\)]*\)/gi, '')
    .replace(/\[(Official|Music|Lyrical|Full|Visualizer|HD|4K|Audio|Video)[^\]]*\]/gi, '')
    .replace(/\(From "[^"]*"\)/gi, '')
    .replace(/\(feat\..*?\)/gi, '')
    .replace(/\[feat\..*?\]/gi, '')
    .replace(/feat\..*$/gi, '')
    .replace(/ft\..*$/gi, '')
    .replace(/Prod\.? by.*$/gi, '')
    .replace(/\|.*$/g, '')
    .trim();
}

/**
 * Extract track name and artist from title and channel metadata
 */
function extractTrackAndArtist(rawTitle, rawChannel) {
  const cleaned = cleanSongTitle(rawTitle);
  let track = cleaned;
  let artist = '';

  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      track = parts[0];
      artist = parts[1];
    }
  }

  let cleanChannel = (rawChannel || '')
    .replace(/VEVO$/i, '')
    .replace(/ - Topic$/i, '')
    .replace(/Official$/i, '')
    .trim();

  if (RECORD_LABEL_REGEX.test(cleanChannel)) {
    cleanChannel = '';
  }

  if (!artist && cleanChannel) {
    artist = cleanChannel;
  }

  return { track, artist, cleanChannel };
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

  // Extract [offset: +/- ms] header if present in LRC
  let offsetSec = 0;
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    const offsetMatch = trimmed.match(/^\[offset:\s*([+-]?\d+)\s*\]/i);
    if (offsetMatch) {
      offsetSec = (parseInt(offsetMatch[1], 10) || 0) / 1000;
      break;
    }
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Skip metadata headers like [ar:Artist], [ti:Title], [al:Album], [offset:123], [length:...]
    if (/^\[(ti|ar|al|by|offset|length):/i.test(trimmed)) continue;

    let match;
    const timestamps = [];
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const mins = parseFloat(match[1]);
      const secs = parseFloat(match[2]);
      const lineTime = Math.max(0, mins * 60 + secs + offsetSec);
      timestamps.push(lineTime);
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
 * Fetch synchronized lyrics for a song from LRCLIB
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

  const { track, artist, cleanChannel } = extractTrackAndArtist(title, channelTitle);

  // Strategy order:
  // 1. "Track Artist"
  // 2. "Track" alone
  // 3. "Artist Track"
  // 4. "Track cleanChannel"
  const candidateQueries = [];
  if (track && artist) candidateQueries.push(`${track} ${artist}`);
  if (track) candidateQueries.push(track);
  if (artist && track) candidateQueries.push(`${artist} ${track}`);
  if (cleanChannel && track && cleanChannel !== artist) candidateQueries.push(`${track} ${cleanChannel}`);

  for (const q of candidateQueries) {
    try {
      const url = `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'MusicRoom/2.0 (contact@musicroom.internal)'
        },
        signal: AbortSignal.timeout(4500)
      });

      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          // Priority 1: Synced Lyrics
          const syncedCandidate = results.find(r => r.syncedLyrics);
          if (syncedCandidate && syncedCandidate.syncedLyrics) {
            const lines = parseLrc(syncedCandidate.syncedLyrics);
            if (lines.length > 0) {
              const data = {
                success: true,
                synced: true,
                lines,
                trackName: syncedCandidate.trackName || track,
                artistName: syncedCandidate.artistName || artist,
                source: 'lrclib_synced'
              };
              lyricsCache.set(cacheKey, { timestamp: Date.now(), data });
              return data;
            }
          }

          // Priority 2: Plain Lyrics fallback if synced not found
          const plainCandidate = results.find(r => r.plainLyrics);
          if (plainCandidate && plainCandidate.plainLyrics) {
            const rawLines = plainCandidate.plainLyrics
              .split('\n')
              .map(l => l.trim())
              .filter(Boolean);
            const data = {
              success: true,
              synced: false,
              plainText: plainCandidate.plainLyrics,
              lines: rawLines.map((text, i) => ({ time: i * 4, text })),
              trackName: plainCandidate.trackName || track,
              artistName: plainCandidate.artistName || artist,
              source: 'lrclib_plain'
            };
            lyricsCache.set(cacheKey, { timestamp: Date.now(), data });
            return data;
          }
        }
      }
    } catch (err) {
      console.warn(`[Lyrics] Search query "${q}" failed:`, err.message);
    }
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
  parseLrc,
  cleanSongTitle,
  extractTrackAndArtist
};
