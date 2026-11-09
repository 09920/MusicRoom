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

const CURATED_MOODS = {
  'trending': [
    { videoId: 'hBCrkxP6L4A', title: 'Millionaire', channelTitle: 'Yo Yo Honey Singh', thumbnail: 'https://i.ytimg.com/vi/hBCrkxP6L4A/hqdefault.jpg' },
    { videoId: 'LK7-_dgAVQE', title: 'Tauba Tauba', channelTitle: 'Karan Aujla', thumbnail: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg' },
    { videoId: 'hOHKltAiKXQ', title: 'Big Dawgs', channelTitle: 'Hanumankind', thumbnail: 'https://i.ytimg.com/vi/hOHKltAiKXQ/hqdefault.jpg' },
    { videoId: 'qf48bK8f564', title: 'Aayi Nai', channelTitle: 'Pawan Singh, Simran Choudhary', thumbnail: 'https://i.ytimg.com/vi/qf48bK8f564/hqdefault.jpg' },
    { videoId: 'kPa7bsKwL-c', title: 'Die With A Smile', channelTitle: 'Lady Gaga, Bruno Mars', thumbnail: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg' },
    { videoId: 'eVTXPUF4Oz4', title: 'Espresso', channelTitle: 'Sabrina Carpenter', thumbnail: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg' },
    { videoId: 'V9PVRfjEBTI', title: 'Birds of a Feather', channelTitle: 'Billie Eilish', thumbnail: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg' },
    { videoId: 'gRhv0RrhYk8', title: 'Jo Tum Mere Ho', channelTitle: 'Anuv Jain', thumbnail: 'https://i.ytimg.com/vi/gRhv0RrhYk8/hqdefault.jpg' }
  ],
  'hindi hits': [
    { videoId: 'ElZfdU54Cp8', title: 'Apna Bana Le', channelTitle: 'Arijit Singh, Sachin-Jigar', thumbnail: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg' },
    { videoId: 'BddP6PYo2gs', title: 'Kesariya', channelTitle: 'Arijit Singh, Pritam', thumbnail: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg' },
    { videoId: 'VAdGW7QDJUI', title: 'Chaleya', channelTitle: 'Arijit Singh, Anirudh', thumbnail: 'https://i.ytimg.com/vi/VAdGW7QDJUI/hqdefault.jpg' },
    { videoId: 'RLzC55ai0eo', title: 'Heeriye', channelTitle: 'Jasleen Royal, Arijit Singh', thumbnail: 'https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg' },
    { videoId: 'e-ORhEE9VVg', title: 'O Maahi', channelTitle: 'Arijit Singh, Pritam', thumbnail: 'https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg' },
    { videoId: '8vg_sX_Hh1w', title: 'Pehle Bhi Main', channelTitle: 'Vishal Mishra, Raj Shekhar', thumbnail: 'https://i.ytimg.com/vi/8vg_sX_Hh1w/hqdefault.jpg' }
  ],
  'chill lo-fi': [
    { videoId: 'k70n_2Z2w-g', title: 'Iraada - Banjaare (Lo-Fi)', channelTitle: 'SBH Editz', thumbnail: 'https://i.ytimg.com/vi/k70n_2Z2w-g/hqdefault.jpg' },
    { videoId: 'pSAn6p2V644', title: 'Tum Se Tum Tak (Lo-Fi)', channelTitle: 'ta editor', thumbnail: 'https://i.ytimg.com/vi/pSAn6p2V644/hqdefault.jpg' },
    { videoId: 'JkZ3Z17_i4M', title: 'Nazar', channelTitle: 'oheydox', thumbnail: 'https://i.ytimg.com/vi/JkZ3Z17_i4M/hqdefault.jpg' },
    { videoId: '6v2L2UGZJAM', title: 'Zikr', channelTitle: 'Niyam', thumbnail: 'https://i.ytimg.com/vi/6v2L2UGZJAM/hqdefault.jpg' },
    { videoId: 'nfs8NYg7yQM', title: 'Kami', channelTitle: 'Niyam', thumbnail: 'https://i.ytimg.com/vi/nfs8NYg7yQM/hqdefault.jpg' },
    { videoId: 'fHI8X480mxo', title: 'Afsana', channelTitle: 'Niyam', thumbnail: 'https://i.ytimg.com/vi/fHI8X480mxo/hqdefault.jpg' },
    { videoId: '1w7OgIMMRc4', title: 'Behisaab', channelTitle: 'Niyam', thumbnail: 'https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg' }
  ],
  'punjabi': [
    { videoId: 'cl0a3i2wFcc', title: 'Winning Speech', channelTitle: 'Karan Aujla', thumbnail: 'https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg' },
    { videoId: 'cWMxCE2HTag', title: 'Softly', channelTitle: 'Karan Aujla, Ikky', thumbnail: 'https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg' },
    { videoId: 'D-2q_KqQv-U', title: 'With You', channelTitle: 'AP Dhillon', thumbnail: 'https://i.ytimg.com/vi/D-2q_KqQv-U/hqdefault.jpg' },
    { videoId: 'vX2cDW8LUWk', title: 'Born to Shine', channelTitle: 'Diljit Dosanjh', thumbnail: 'https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg' },
    { videoId: 'mH_LFkWxpI0', title: 'Lover', channelTitle: 'Diljit Dosanjh', thumbnail: 'https://i.ytimg.com/vi/mH_LFkWxpI0/hqdefault.jpg' },
    { videoId: 'b_KkU_K2XpA', title: 'One Love', channelTitle: 'Shubh', thumbnail: 'https://i.ytimg.com/vi/b_KkU_K2XpA/hqdefault.jpg' }
  ],
  'romantic': [
    { videoId: 'gvyUuxdRdR4', title: 'Raataan Lambiyan', channelTitle: 'Jubin Nautiyal, Asees Kaur', thumbnail: 'https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg' },
    { videoId: 'kxouC7d0ZpM', title: 'Shayad', channelTitle: 'Arijit Singh, Pritam', thumbnail: 'https://i.ytimg.com/vi/kxouC7d0ZpM/hqdefault.jpg' },
    { videoId: 'x6Q7c9RyMzk', title: 'Pal Pal Dil Ke Paas', channelTitle: 'Arijit Singh, Parampara', thumbnail: 'https://i.ytimg.com/vi/x6Q7c9RyMzk/hqdefault.jpg' },
    { videoId: 'yIRvG_UqE24', title: 'Tere Hawaale', channelTitle: 'Arijit Singh, Shilpa Rao', thumbnail: 'https://i.ytimg.com/vi/yIRvG_UqE24/hqdefault.jpg' },
    { videoId: 'VuG7GUq390c', title: 'Maan Meri Jaan', channelTitle: 'King', thumbnail: 'https://i.ytimg.com/vi/VuG7GUq390c/hqdefault.jpg' }
  ],
  'english pop': [
    { videoId: '4NRXx6U8ABQ', title: 'Blinding Lights', channelTitle: 'The Weeknd', thumbnail: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg' },
    { videoId: '34Na4j8AVgA', title: 'Starboy', channelTitle: 'The Weeknd ft. Daft Punk', thumbnail: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg' },
    { videoId: 'ic8j13piAhQ', title: 'Cruel Summer', channelTitle: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' },
    { videoId: 'H5v3kku4y6Q', title: 'As It Was', channelTitle: 'Harry Styles', thumbnail: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg' },
    { videoId: 'G7KNmW9a75Y', title: 'Flowers', channelTitle: 'Miley Cyrus', thumbnail: 'https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg' }
  ],
  'workout': [
    { videoId: '7wtfhZwyrcc', title: 'Believer', channelTitle: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg' },
    { videoId: 'jn8f_G8k3vM', title: "'Till I Collapse", channelTitle: 'Eminem ft. Nate Dogg', thumbnail: 'https://i.ytimg.com/vi/jn8f_G8k3vM/hqdefault.jpg' },
    { videoId: '_Yhyp-_hX2s', title: 'Lose Yourself', channelTitle: 'Eminem', thumbnail: 'https://i.ytimg.com/vi/_Yhyp-_hX2s/hqdefault.jpg' },
    { videoId: 'UTHLKgkMtVw', title: 'Industry Baby', channelTitle: 'Lil Nas X, Jack Harlow', thumbnail: 'https://i.ytimg.com/vi/UTHLKgkMtVw/hqdefault.jpg' },
    { videoId: 'dxWvtMOGAhw', title: 'Zinda', channelTitle: 'Shankar Mahadevan', thumbnail: 'https://i.ytimg.com/vi/dxWvtMOGAhw/hqdefault.jpg' }
  ]
};

const MOOD_SEARCH_MAP = {
  'trending': 'top hits viral songs 2026',
  'hindi hits': 'latest bollywood hindi hit songs',
  'chill lo-fi': 'hindi lofi chill songs study relax',
  'punjabi': 'latest punjabi viral hit songs',
  'romantic': 'romantic hindi love songs arijit',
  'english pop': 'billboard hot 100 top pop songs',
  'workout': 'high energy workout gym songs motivation'
};

async function getTrendingSongs(mood = 'trending', apiKey) {
  const key = (mood || 'trending').toLowerCase().trim();
  const curated = CURATED_MOODS[key] || CURATED_MOODS['trending'];

  // Asynchronously query live search in background if not already cached
  const query = MOOD_SEARCH_MAP[key] || MOOD_SEARCH_MAP['trending'];
  const normalizedQuery = query.toLowerCase().trim();
  const cached = searchCache.get(normalizedQuery);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.results;
  }

  // Trigger search
  try {
    const liveResults = await searchSongs(query, apiKey);
    if (liveResults && liveResults.length > 0) {
      // Merge curated official singles with live results, avoiding duplicates
      const merged = [...curated];
      for (const item of liveResults) {
        if (!merged.some(m => m.videoId === item.videoId)) {
          merged.push(item);
        }
      }
      return merged.slice(0, 16);
    }
  } catch (_) {}

  return curated;
}

module.exports = {
  searchSongs,
  getTrendingSongs
};
