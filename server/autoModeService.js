// server/autoModeService.js
const { searchSongs } = require('./searchService');

// Mood/Language search pools
const MOOD_QUERIES = {
  'Hindi': [
    'Top Bollywood Hindi Songs',
    'Best Hindi Romantic Songs Playlist',
    'Arijit Singh Melodies',
    'Hindi Retro Classics',
    'Bollywood Dance Beats'
  ],
  'English': [
    'Top English Pop Songs',
    'Chill English Acoustic and Pop',
    'Lo-Fi Beats to Relax to',
    'Global English Top Hits'
  ],
  'Other Languages': [
    'Global Hit Songs',
    'Top Punjabi Songs',
    'Latin Chill Music'
  ]
};

// In-memory song cache for auto mode
const autoPoolCache = new Map();

/**
 * Pre-load or fetch songs for a given language
 */
async function getSongPoolForMood(mood, apiKey) {
  const normalizedMood = MOOD_QUERIES[mood] ? mood : 'Hindi';

  if (autoPoolCache.has(normalizedMood) && autoPoolCache.get(normalizedMood).length > 5) {
    return autoPoolCache.get(normalizedMood);
  }

  const queries = MOOD_QUERIES[normalizedMood] || MOOD_QUERIES['Hindi'];
  const pool = [];

  for (const q of queries.slice(0, 3)) {
    try {
      const songs = await searchSongs(q, apiKey);
      if (songs && songs.length > 0) {
        pool.push(...songs);
      }
    } catch (err) {
      console.warn(`Could not load auto pool for query "${q}":`, err.message);
    }
  }

  // Deduplicate pool by videoId
  const uniquePool = [];
  const seenIds = new Set();
  for (const s of pool) {
    if (!seenIds.has(s.videoId)) {
      seenIds.add(s.videoId);
      uniquePool.push(s);
    }
  }

  if (uniquePool.length > 0) {
    autoPoolCache.set(normalizedMood, uniquePool);
  }

  return uniquePool;
}

/**
 * Pick the next song matching the room's language that isn't in history
 */
async function pickNextSong(room, apiKey) {
  const mood = room.mood || 'Hindi';
  const pool = await getSongPoolForMood(mood, apiKey);

  if (!pool || pool.length === 0) {
    return null;
  }

  const historySet = new Set(room.history || []);

  // Filter out songs already played in the last 50 songs
  const eligible = pool.filter(song => !historySet.has(song.videoId));

  let picked = null;
  if (eligible.length > 0) {
    // Pick random song from eligible pool
    const randomIndex = Math.floor(Math.random() * eligible.length);
    picked = eligible[randomIndex];
  } else {
    // If all songs played, reset history check and pick from pool
    const randomIndex = Math.floor(Math.random() * pool.length);
    picked = pool[randomIndex];
  }

  return picked;
}

module.exports = {
  pickNextSong,
  getSongPoolForMood
};
