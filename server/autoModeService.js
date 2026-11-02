// server/autoModeService.js
const { searchSongs } = require('./searchService');

// Keywords to strictly filter out long jukeboxes, full album mixes, compilations, and kids rhymes
const COMPILATION_KEYWORDS = [
  'jukebox', 'playlist', 'compilation', 'full album', 'all songs',
  'non stop', 'non-stop', 'nonstop', 'hour', 'hours', 'top 10', 'top 20', 'top 50', 'top 100',
  'best of', 'mashup', 'discography', 'collection', 'full ep', 'audio jukebox', 'video jukebox',
  'hit songs', 'golden hits', 'evergreen hits', 'superhit songs', 'all hit songs', 'songs collection',
  'song collection', 'phonics', 'nursery', 'cocomelon', 'kids tv', 'kids song', 'kids songs',
  'toddler', 'rhymes', 'abc song', 'shapes song', 'alphabet song', 'chuchu', 'baby shark',
  'educational songs', 'kindergarten', 'preschool', 'bedtime rhyme'
];

/**
 * Filter out long playlists, full albums, mix endpoints, and hour-long jukeboxes
 */
function isCompilation(title, videoId) {
  if (videoId && (videoId.length !== 11 || videoId.startsWith('RD') || videoId.startsWith('PL'))) {
    return true;
  }
  if (!title) return false;
  const lower = title.toLowerCase();
  if (lower.startsWith('mix -') || lower.startsWith('mix ')) return true;
  return COMPILATION_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Clean HTML entity encoding
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
 * Extract clean artist and core song title for YouTube Music-style vibe matching
 */
function extractArtistAndTitle(song) {
  let rawTitle = song.title || '';
  let channel = song.channelTitle || '';

  let cleaned = rawTitle
    .replace(/\(Official[^\)]*\)/gi, '')
    .replace(/\[Official[^\]]*\]/gi, '')
    .replace(/\(Audio[^\)]*\)/gi, '')
    .replace(/\[Audio[^\]]*\]/gi, '')
    .replace(/\(Lyric[^\)]*\)/gi, '')
    .replace(/\[Lyric[^\]]*\]/gi, '')
    .replace(/\(4K[^\)]*\)/gi, '')
    .replace(/\[4K[^\]]*\]/gi, '')
    .replace(/\(Video[^\)]*\)/gi, '')
    .replace(/\[Video[^\]]*\]/gi, '')
    .replace(/\(From "[^"]*"\)/gi, '')
    .replace(/feat\..*$/gi, '')
    .replace(/ft\..*$/gi, '')
    .replace(/Prod\.? by.*$/gi, '')
    .trim();

  const segments = cleaned.split(/[\|\-]/).map(s => s.trim()).filter(Boolean);

  let title = segments[0] || cleaned;
  let artist = channel
    .replace(/VEVO$/i, '')
    .replace(/ - Topic$/i, '')
    .replace(/Official$/i, '')
    .replace(/Music.*$/i, '')
    .replace(/Records.*$/i, '')
    .replace(/Company.*$/i, '')
    .replace(/Films.*$/i, '')
    .trim();

  // If there are other segments, check if one of them has singer / artist name
  let candidateArtist = '';
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (/arijit|pritam|atif|shreya|ar rahman|badshah|karan|sidhu|diljit|anirudh|armaan|darshan|honey singh|neha kakkar|jubin|weeknd|drake|swift|sheeran|eminem|dua lipa|bieber|billie/i.test(seg)) {
      candidateArtist = seg;
      break;
    }
  }

  if (candidateArtist) {
    artist = candidateArtist;
  } else if (!artist || artist.length < 3 || /youtube|t-series|sony|zee|tips|speed/i.test(artist)) {
    if (segments.length >= 2) {
      artist = segments[segments.length - 1];
    }
  }

  return { title, artist };
}

/**
 * Extract individual video recommendations from YouTube watch page ytInitialData
 */
function extractVideosFromObj(obj, results = [], max = 15) {
  if (!obj || typeof obj !== 'object' || results.length >= max) return results;

  // 1. Classic compactVideoRenderer
  if (obj.compactVideoRenderer) {
    const v = obj.compactVideoRenderer;
    const title = v.title?.simpleText || v.title?.runs?.map(r => r.text).join('') || '';
    const channel = v.shortBylineText?.runs?.map(r => r.text).join('') || '';
    if (v.videoId && v.videoId.length === 11 && !v.videoId.startsWith('RD') && title && !results.some(r => r.videoId === v.videoId)) {
      results.push({
        videoId: v.videoId,
        title: cleanTitle(title),
        channelTitle: cleanTitle(channel),
        thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
        duration: 0
      });
    }
  }

  // 2. Modern lockupViewModel format
  if (obj.lockupViewModel) {
    const item = obj.lockupViewModel;
    const videoId = item.contentId || item.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
    const title = item.metadata?.lockupMetadataViewModel?.title?.content;
    const channel = item.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || 'YouTube';
    if (videoId && videoId.length === 11 && !videoId.startsWith('RD') && title && !results.some(r => r.videoId === videoId)) {
      results.push({
        videoId,
        title: cleanTitle(title),
        channelTitle: cleanTitle(channel),
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: 0
      });
    }
  }

  for (const key of Object.keys(obj)) {
    if (results.length >= max) break;
    extractVideosFromObj(obj[key], results, max);
  }

  return results;
}

/**
 * Scrape YouTube watch page related videos (YouTube's actual "Up Next" algorithm)
 */
async function fetchWatchPageRelated(videoId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const match = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
    if (!match) return [];
    const data = JSON.parse(match[1]);
    const sec = data?.contents?.twoColumnWatchNextResults?.secondaryResults;
    if (!sec) return [];
    return extractVideosFromObj(sec, [], 15).filter(v => v.videoId !== videoId);
  } catch (err) {
    console.warn(`[Radio] fetchWatchPageRelated error for ${videoId}:`, err.message);
    return [];
  }
}

// Initial fallback queries for fresh rooms with zero history (strictly single tracks, NO playlist/compilation keywords)
const FRESH_MOOD_QUERIES = {
  'Hindi': [
    'Trending Bollywood Song Audio',
    'Arijit Singh Song Audio',
    'Latest Hindi Song Official Music Video',
    'Bollywood Romantic Song Audio'
  ],
  'English': [
    'Trending English Pop Song Audio',
    'Top Global Song Official Audio',
    'Acoustic Pop Song'
  ],
  'Other Languages': [
    'Global Trending Song Audio',
    'Punjabi Pop Song Audio',
    'Latin Pop Song Audio'
  ]
};

// Cache for recent vibe recommendations by videoId to save network overhead
const vibeCache = new Map();
const VIBE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Pick the next song dynamically matching the vibe of the currently playing song,
 * just like YouTube Music Radio.
 */
async function pickNextSong(room, apiKey) {
  const historySet = new Set(room.history || []);
  if (room.currentSong?.videoId) {
    historySet.add(room.currentSong.videoId);
  }
  if (Array.isArray(room.queue)) {
    for (const q of room.queue) {
      if (q.videoId) historySet.add(q.videoId);
    }
  }

  // 1. Identify Seed Song: currentSong or the last played song from history
  const seedSong = room.currentSong || (room.history && room.history.length > 0 ? { videoId: room.history[room.history.length - 1] } : null);

  let candidates = [];

  // Check cache for this seed
  if (seedSong?.videoId && vibeCache.has(seedSong.videoId)) {
    const cachedEntry = vibeCache.get(seedSong.videoId);
    if (Date.now() - cachedEntry.timestamp < VIBE_CACHE_TTL) {
      candidates = cachedEntry.songs.filter(s => !historySet.has(s.videoId) && !isCompilation(s.title, s.videoId));
    }
  }

  // Strategy 1: YouTube "Up Next" / Related Sidebar from Seed Video
  if (candidates.length < 3 && seedSong?.videoId) {
    try {
      const related = await fetchWatchPageRelated(seedSong.videoId);
      const cleanRelated = related.filter(s => !isCompilation(s.title, s.videoId) && !historySet.has(s.videoId));
      if (cleanRelated.length > 0) {
        candidates.push(...cleanRelated);
      }
    } catch (e) {
      console.warn('[Radio] Strategy 1 error:', e.message);
    }
  }

  // Strategy 2: Dynamic Artist / Song Search
  if (candidates.length < 3 && seedSong) {
    const { title, artist } = extractArtistAndTitle(seedSong);
    const queries = [];
    if (artist && artist.length >= 3 && !/unknown/i.test(artist)) {
      queries.push(`${artist} song audio`);
    }
    if (title && title.length >= 3) {
      queries.push(`${title} song`);
    }
    if (queries.length === 0 && seedSong.title) {
      queries.push(`${seedSong.title} audio`);
    }

    for (const q of queries) {
      try {
        const results = await searchSongs(q, apiKey);
        const cleanResults = results.filter(s => !isCompilation(s.title, s.videoId) && !historySet.has(s.videoId));
        candidates.push(...cleanResults);
        if (candidates.length >= 6) break;
      } catch (err) {
        console.warn(`[Radio] Query "${q}" failed:`, err.message);
      }
    }
  }

  // Strategy 3: Language Mood Fallback (Fresh room or zero match)
  if (candidates.length === 0) {
    const mood = room.mood || 'Hindi';
    const queries = FRESH_MOOD_QUERIES[mood] || FRESH_MOOD_QUERIES['Hindi'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    try {
      const results = await searchSongs(randomQuery, apiKey);
      const cleanResults = results.filter(s => !isCompilation(s.title, s.videoId) && !historySet.has(s.videoId));
      candidates.push(...cleanResults);
    } catch (e) {
      console.warn('[Radio] Strategy 3 fallback failed:', e.message);
    }
  }

  // Deduplicate candidates
  const unique = [];
  const seenIds = new Set();
  for (const s of candidates) {
    if (!seenIds.has(s.videoId) && !historySet.has(s.videoId)) {
      seenIds.add(s.videoId);
      unique.push(s);
    }
  }

  if (seedSong?.videoId && unique.length > 0) {
    vibeCache.set(seedSong.videoId, {
      songs: unique,
      timestamp: Date.now()
    });
  }

  if (unique.length === 0) {
    // If all candidates were already in history, relax history check (except currently playing song)
    const relaxed = candidates.filter(s => s.videoId !== room.currentSong?.videoId);
    if (relaxed.length > 0) {
      return relaxed[Math.floor(Math.random() * relaxed.length)];
    }
    return null;
  }

  // Pick one from top candidates (weighted towards the top 5 vibe matches)
  const pickPool = unique.slice(0, Math.min(5, unique.length));
  const picked = pickPool[Math.floor(Math.random() * pickPool.length)];
  return picked;
}

module.exports = {
  pickNextSong,
  isCompilation,
  extractArtistAndTitle
};
