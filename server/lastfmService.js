// server/lastfmService.js
// Last.fm Track Similarity Graph & Recommendation Engine
// Powers "Up Next" smart song suggestions using the world's largest music listening graph

const lastFmCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const RECORD_LABEL_REGEX = /\b(t-series|tseries|sony music|zee music|yrf|tips|saregama|speed records|geet mp3|white hill|times music|universal music|warner music|dm desi music|vyrf|records|company|films|entertainment|vevo|music)\b/i;

/**
 * Clean track title and artist for optimal Last.fm graph lookup
 */
function cleanTrackAndArtist(rawTitle, rawChannel) {
  let title = (rawTitle || '')
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
    .trim();

  let track = title;
  let artist = '';

  if (title.includes(' - ')) {
    const parts = title.split(' - ').map(s => s.trim()).filter(Boolean);
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

  return { track, artist };
}

/**
 * Query Last.fm track.getSimilar
 * @param {string} track 
 * @param {string} artist 
 * @param {string} apiKey 
 * @returns {Promise<Array<{name: string, artist: string, match: number, image: string}>>}
 */
async function fetchTrackSimilar(track, artist, apiKey) {
  if (!apiKey || !track) return [];

  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${apiKey}&format=json&limit=15&autocorrect=1`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'MusicRoom/2.0 (contact@musicroom.internal)' },
    signal: AbortSignal.timeout(5000)
  });

  if (!res.ok) return [];

  const data = await res.json();
  const rawList = data?.similartracks?.track;

  if (Array.isArray(rawList)) {
    return rawList.map(item => ({
      name: item.name,
      artist: typeof item.artist === 'string' ? item.artist : item.artist?.name || 'Artist',
      match: parseFloat(item.match) || 0,
      image: item.image?.find(img => img.size === 'medium' || img.size === 'large')?.['#text'] || ''
    }));
  }

  return [];
}

/**
 * Fallback: Query Last.fm artist.getSimilar and grab top tracks
 */
async function fetchArtistSimilarTracks(artist, apiKey) {
  if (!apiKey || !artist) return [];

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${encodeURIComponent(artist)}&api_key=${apiKey}&format=json&limit=4&autocorrect=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MusicRoom/2.0' },
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) return [];
    const data = await res.json();
    const similarArtists = data?.similarartists?.artist;

    if (!Array.isArray(similarArtists) || similarArtists.length === 0) return [];

    const tracks = [];
    for (const simArtist of similarArtists.slice(0, 3)) {
      const topUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(simArtist.name)}&api_key=${apiKey}&format=json&limit=3`;
      const topRes = await fetch(topUrl, { signal: AbortSignal.timeout(3000) });
      if (topRes.ok) {
        const topData = await topRes.json();
        const topList = topData?.toptracks?.track;
        if (Array.isArray(topList)) {
          for (const t of topList) {
            tracks.push({
              name: t.name,
              artist: simArtist.name,
              match: parseFloat(simArtist.match) || 0.7,
              image: t.image?.find(img => img.size === 'medium')?.['#text'] || ''
            });
          }
        }
      }
    }
    return tracks;
  } catch (err) {
    return [];
  }
}

/**
 * Main function: Get musically similar tracks for a song
 * @param {object} song - { title, channelTitle, artist }
 * @param {string} [customApiKey]
 * @returns {Promise<{success: boolean, source: string, tracks: Array}>}
 */
async function getSimilarTracks(song, customApiKey) {
  const apiKey = customApiKey || process.env.LASTFM_API_KEY;

  if (!song || !song.title) {
    return { success: false, source: 'none', tracks: [], reason: 'NO_TITLE' };
  }

  const { track, artist } = cleanTrackAndArtist(song.title, song.channelTitle || song.artist);
  const cacheKey = `${track.toLowerCase()}___${artist.toLowerCase()}`;

  if (lastFmCache.has(cacheKey)) {
    const cached = lastFmCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (!apiKey) {
    return {
      success: false,
      source: 'lastfm',
      tracks: [],
      reason: 'MISSING_API_KEY',
      instructions: 'Add LASTFM_API_KEY to server/.env to enable Last.fm track similarity'
    };
  }

  try {
    // 1. Try track.getSimilar
    let similarList = await fetchTrackSimilar(track, artist, apiKey);

    // 2. Fallback: If 0 results, try artist.getSimilar
    if (similarList.length === 0 && artist) {
      similarList = await fetchArtistSimilarTracks(artist, apiKey);
    }

    if (similarList.length > 0) {
      const data = {
        success: true,
        source: 'lastfm_graph',
        seed: { track, artist },
        tracks: similarList
      };
      lastFmCache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    }

    return {
      success: false,
      source: 'lastfm',
      seed: { track, artist },
      tracks: [],
      reason: 'NO_SIMILAR_TRACKS'
    };
  } catch (err) {
    console.warn('[LastFM] Similar query failed:', err.message);
    return {
      success: false,
      source: 'lastfm',
      tracks: [],
      reason: err.message
    };
  }
}

module.exports = {
  getSimilarTracks,
  cleanTrackAndArtist
};
