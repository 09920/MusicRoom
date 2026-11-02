// server/playlistParser.js

/**
 * Extract YouTube playlist ID from various URL formats
 */
function extractYouTubePlaylistId(url) {
  if (!url) return null;
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // If user pasted raw playlist ID
  if (/^[a-zA-Z0-9_-]{18,}$/.test(url.trim())) return url.trim();
  return null;
}

/**
 * Extract Spotify playlist ID from URL
 */
function extractSpotifyPlaylistId(url) {
  if (!url) return null;
  const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match) return match[1];
  return null;
}

/**
 * Fetch YouTube Playlist items using YouTube Data API v3 or fallback to public RSS
 */
async function fetchYouTubePlaylist(playlistId, apiKey) {
  // Strategy 1: Official YouTube API if key provided (with multi-page pagination up to 250 songs)
  if (apiKey) {
    try {
      const allSongs = [];
      let nextPageToken = '';
      let pages = 0;

      do {
        pages++;
        const tokenQuery = nextPageToken ? `&pageToken=${nextPageToken}` : '';
        const endpoint = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${tokenQuery}`;
        const res = await fetch(endpoint);
        const data = await res.json();

        if (data.items && data.items.length > 0) {
          const pageSongs = data.items
            .filter(item => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId)
            .map(item => ({
              videoId: item.snippet.resourceId.videoId,
              title: item.snippet.title,
              channelTitle: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle || '',
              thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${item.snippet.resourceId.videoId}/hqdefault.jpg`,
              duration: 0
            }));
          allSongs.push(...pageSongs);
        }

        nextPageToken = data.nextPageToken;
      } while (nextPageToken && allSongs.length < 250 && pages < 6);

      if (allSongs.length > 0) {
        return allSongs;
      }
    } catch (err) {
      console.warn('YouTube API fetch failed, falling back to public feed:', err.message);
    }
  }

  // Strategy 2: Scrape YouTube playlist page via ytInitialData (Fetches up to 100 tracks free without API key)
  try {
    const pageUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    const pageRes = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      const jsonMatch = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        const songs = [];

        // Check for lockupViewModel (modern YouTube layout)
        const lockups = [];
        const playlistVideos = [];

        function walk(node) {
          if (!node) return;
          if (node.lockupViewModel) {
            lockups.push(node.lockupViewModel);
          }
          if (node.playlistVideoRenderer) {
            playlistVideos.push(node.playlistVideoRenderer);
          }
          if (typeof node === 'object') {
            for (const key of Object.keys(node)) {
              walk(node[key]);
            }
          }
        }
        walk(data);

        // Process lockupViewModel items
        for (const item of lockups) {
          const videoId = item.contentId || item.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
          const title = item.metadata?.lockupMetadataViewModel?.title?.content;
          const channel = item.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || 'YouTube';
          if (videoId && title && !songs.some(s => s.videoId === videoId)) {
            songs.push({
              videoId,
              title,
              channelTitle: channel,
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              duration: 0
            });
          }
        }

        // Process playlistVideoRenderer items (classic YouTube layout)
        for (const item of playlistVideos) {
          const videoId = item.videoId;
          const title = item.title?.runs?.[0]?.text || item.title?.simpleText;
          const channel = item.shortBylineText?.runs?.[0]?.text || 'YouTube';
          if (videoId && title && !songs.some(s => s.videoId === videoId)) {
            songs.push({
              videoId,
              title,
              channelTitle: channel,
              thumbnail: item.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              duration: parseInt(item.lengthSeconds, 10) || 0
            });
          }
        }

        if (songs.length > 0) {
          return songs;
        }
      }
    }
  } catch (err) {
    console.warn('Scraping ytInitialData failed, trying RSS fallback:', err.message);
  }

  // Strategy 3: YouTube public RSS feed (Works without API key, 100% free fallback)
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (res.ok) {
      const xml = await res.text();
      const entries = xml.split('<entry>');
      const songs = [];

      for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];
        const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
        const authorMatch = entry.match(/<name>([^<]+)<\/name>/);

        if (videoIdMatch && titleMatch) {
          const videoId = videoIdMatch[1];
          songs.push({
            videoId,
            title: titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
            channelTitle: authorMatch ? authorMatch[1] : 'YouTube',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: 0
          });
        }
      }

      if (songs.length > 0) {
        return songs;
      }
    }
  } catch (err) {
    console.warn('YouTube RSS feed failed:', err.message);
  }

  throw new Error('Could not fetch playlist. Please check that the playlist is Public or Unlisted.');
}

/**
 * Fetch tracks from a public Spotify playlist embed
 */
async function fetchSpotifyPlaylist(playlistId) {
  try {
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      throw new Error('Spotify playlist not found or private');
    }

    const html = await res.text();
    // Spotify embed HTML contains JSON in <script id="__NEXT_DATA__" type="application/json">
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

    if (nextDataMatch) {
      const data = JSON.parse(nextDataMatch[1]);
      const entity = data?.props?.pageProps?.state?.data?.entity;
      const trackList = entity?.trackList || [];

      if (trackList.length > 0) {
        return trackList.map(t => ({
          title: t.title,
          subtitle: t.subtitle,
          duration: Math.round((t.duration || 0) / 1000)
        }));
      }
    }

    throw new Error('Could not parse Spotify playlist tracks.');
  } catch (err) {
    console.error('Error fetching Spotify playlist:', err.message);
    throw new Error('Could not import Spotify playlist. Ensure it is public.');
  }
}

const videoSearchCache = new Map();

/**
 * Search YouTube for a song title (used to resolve Spotify tracks or direct search)
 */
async function searchYouTubeVideo(query, apiKey) {
  if (!query) return null;
  const cleanQ = query.toLowerCase().trim();
  if (videoSearchCache.has(cleanQ)) {
    return videoSearchCache.get(cleanQ);
  }

  let result = null;

  if (apiKey) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=1&q=${encodeURIComponent(query)}&key=${apiKey}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2800) });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        result = {
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id.videoId}/hqdefault.jpg`
        };
      }
    } catch (e) {
      console.warn('API search failed or timed out:', e.message);
    }
  }

  // Fallback: search via YouTube public search suggest / page with strict 2.5s timeout
  if (!result) {
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const html = await res.text();
        const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (videoIdMatch) {
          const videoId = videoIdMatch[1];
          result = {
            videoId,
            title: query,
            channelTitle: 'YouTube',
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          };
        }
      }
    } catch (e) {
      // Abort or network failure handled cleanly without hanging
    }
  }

  if (result) {
    videoSearchCache.set(cleanQ, result);
  }

  return result;
}

module.exports = {
  extractYouTubePlaylistId,
  extractSpotifyPlaylistId,
  fetchYouTubePlaylist,
  fetchSpotifyPlaylist,
  searchYouTubeVideo
};

