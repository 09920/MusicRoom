import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { 
  DAILY_MIX_1,
  DISCOVER_WEEKLY,
  FAST_165BPM_DRIVING,
  DEEP_FOCUS_NEURAL,
  LATE_NIGHT_LOFI,
  TOP_100_HITS,
  INSTAGRAM_TRENDING_HITS,
  INDIE_HINDI_HITS
} from '../data/topHitsData';

export default function DiscoverView({ onOpenAiTheme }) {
  const {
    playSong,
    currentSong,
    playback,
    togglePlayPause,
    addToQueue,
    setActiveTab,
    likedSongs,
    toggleLike,
    openPlaylist
  } = usePlayer();

  const [trendingFilter, setTrendingFilter] = useState('Today'); // 'Today' | 'This Week' | 'All Time'

  // Trending tracks fallback segmented by timeframe
  const TRENDING_BY_FILTER = {
    'Today': [
      { id: 1, title: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', duration: '4:11', videoId: 'kPa7bsKwL-c', cover: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg' },
      { id: 2, title: 'Tauba Tauba', artist: 'Karan Aujla', duration: '3:24', videoId: 'LK7-_dgAVQE', cover: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg' },
      { id: 3, title: 'Big Dawgs', artist: 'Hanumankind, Kalmi', duration: '3:56', videoId: 'hOHKltAiKXQ', cover: 'https://i.ytimg.com/vi/hOHKltAiKXQ/hqdefault.jpg' },
      { id: 4, title: 'Aayi Nai', artist: 'Pawan Singh, Simran Choudhary', duration: '2:58', videoId: '0nrvPVnTWlc', cover: 'https://i.ytimg.com/vi/0nrvPVnTWlc/hqdefault.jpg' },
      { id: 5, title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', duration: '4:05', videoId: 'ilNt2bikxDI', cover: 'https://i.ytimg.com/vi/ilNt2bikxDI/hqdefault.jpg' },
      { id: 6, title: 'Softly', artist: 'Karan Aujla, Ikky', duration: '2:36', videoId: 'cWMxCE2HTag', cover: 'https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg' }
    ],
    'This Week': [
      { id: 1, title: 'Espresso', artist: 'Sabrina Carpenter', duration: '2:55', videoId: 'eVTXPUF4Oz4', cover: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg' },
      { id: 2, title: 'Birds of a Feather', artist: 'Billie Eilish', duration: '3:18', videoId: 'V9PVRfjEBTI', cover: 'https://i.ytimg.com/vi/V9PVRfjEBTI/hqdefault.jpg' },
      { id: 3, title: 'Millionaire', artist: 'Yo Yo Honey Singh', duration: '3:21', videoId: 'XO8wew38VM8', cover: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg' },
      { id: 4, title: 'Taste', artist: 'Sabrina Carpenter', duration: '2:37', videoId: 'KEG7b851Ric', cover: 'https://i.ytimg.com/vi/KEG7b851Ric/hqdefault.jpg' },
      { id: 5, title: 'Winning Speech', artist: 'Karan Aujla', duration: '3:38', videoId: '0DS5jYQeiw0', cover: 'https://i.ytimg.com/vi/0DS5jYQeiw0/hqdefault.jpg' },
      { id: 6, title: 'Too Sweet', artist: 'Hozier', duration: '4:11', videoId: 'NTpbbQUBbuo', cover: 'https://i.ytimg.com/vi/NTpbbQUBbuo/hqdefault.jpg' }
    ],
    'All Time': [
      { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', videoId: '4NRXx6U8ABQ', cover: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg' },
      { id: 2, title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', duration: '3:50', videoId: '34Na4j8AVgA', cover: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg' },
      { id: 3, title: 'Tum Hi Ho', artist: 'Arijit Singh', duration: '4:22', videoId: 'IJq0yyWug1k', cover: 'https://i.ytimg.com/vi/IJq0yyWug1k/hqdefault.jpg' },
      { id: 4, title: 'Kesariya', artist: 'Arijit Singh, Pritam', duration: '4:28', videoId: 'BddP6PYo2gs', cover: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg' },
      { id: 5, title: 'As It Was', artist: 'Harry Styles', duration: '2:47', videoId: 'H5v3kku4y6Q', cover: 'https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg' },
      { id: 6, title: 'Cruel Summer', artist: 'Taylor Swift', duration: '2:58', videoId: 'ic8j13piAhQ', cover: 'https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg' }
    ]
  };

  const [trendingTracks, setTrendingTracks] = useState(() => {
    return TRENDING_BY_FILTER['Today'];
  });
  const [isFetchingTrending, setIsFetchingTrending] = useState(false);

  // Fetch live daily rotating trending tracks from backend with automated 24h refresh
  React.useEffect(() => {
    let active = true;
    const loadTrending = async () => {
      setIsFetchingTrending(true);
      try {
        const filterKey = trendingFilter.toLowerCase().replace(/\s+/g, '');
        const res = await fetch(`/api/trending?filter=${filterKey}`);
        if (res.ok) {
          const json = await res.json();
          if (active && json.songs && Array.isArray(json.songs) && json.songs.length > 0) {
            setTrendingTracks(json.songs);
            return;
          }
        }
      } catch (err) {
        console.warn('Live trending fetch failed, keeping fallback:', err);
      } finally {
        if (active) setIsFetchingTrending(false);
      }
      if (active) {
        setTrendingTracks(TRENDING_BY_FILTER[trendingFilter] || TRENDING_BY_FILTER['Today']);
      }
    };

    loadTrending();
    return () => { active = false; };
  }, [trendingFilter]);

  const handlePlayTrack = (track) => {
    playSong({
      videoId: track.videoId,
      title: track.title,
      artist: track.artist,
      channelTitle: track.artist,
      thumbnail: track.cover
    }, true);
  };

  const handlePlayMix = (mixData, mixTitle) => {
    if (mixData && mixData.length > 0) {
      playSong(mixData[0], true);
      // Queue remaining songs
      for (let i = 1; i < Math.min(mixData.length, 15); i++) {
        addToQueue(mixData[i]);
      }
    }
  };

  const featuredRelease = {
    title: 'Chrono Trigger Re-Imagined',
    artist: 'Yasunori Mitsuda & London Symphony Orchestra',
    description: 'A symphonic re-orchestration featuring an 82-piece acoustic brass and strings arrangement recorded live at Abbey Road Studios.',
    videoId: 'kPa7bsKwL-c',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaeXpdfMXsEDt0zEfE_2v3Una0EA5fCTXrEozOHnxlTX5r-SZutJLjkb9FFfrIce1sGd8FxOF9Ec5uGKsMj-kGT_FbQ2Nr_yCGwlTPV160ElMEBTZqHJzLjZ_c7v3tu4gRjPmZOujzatyE13OYgRlm--CM-RramI40ITJgzCN6GoyL7I_2SDAKKEs31eJCxm5EFayn49Phi-h8YapwKFLA_DdjPY5iakPeanSnAJU'
  };

  return (
    <div className="flex flex-col w-full pb-20 px-gutter select-none">
      <div className="flex flex-col gap-space-xl pt-space-lg max-w-7xl mx-auto w-full">

        {/* 1. Clean Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-surface-container-high pb-space-md">
          <div className="flex flex-col">
            <h1 className="text-headline-md font-headline font-bold text-on-surface">
              Discover Music
            </h1>
            <p className="text-body-sm font-body text-on-surface-variant">
              Handpicked albums, popular releases, and community favorites.
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-body-sm font-medium transition-colors"
            >
              Explore Genres
            </button>
            {onOpenAiTheme && (
              <button
                type="button"
                onClick={onOpenAiTheme}
                className="px-space-md py-1.5 rounded-lg bg-primary-container/20 hover:bg-primary-container/30 text-primary text-body-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-title-sm">auto_awesome</span>
                <span>AI Room Art</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Clean Featured Hero Banner */}
        <div 
          onClick={() => openPlaylist({
            id: 'chrono-trigger',
            name: featuredRelease.title,
            title: featuredRelease.title,
            artist: featuredRelease.artist,
            composer: featuredRelease.artist,
            year: '2024',
            genre: 'Symphonic Orchestral',
            description: featuredRelease.description,
            cover: featuredRelease.cover,
            songs: [
              {
                videoId: 'kPa7bsKwL-c',
                title: 'Presentiment (Wind Scene)',
                artist: 'Yasunori Mitsuda, London Symphony Orchestra',
                plays: '1,248,392',
                duration: '4:18',
                thumbnail: featuredRelease.cover
              },
              {
                videoId: 'eVTXPUF4Oz4',
                title: 'Chrono Corridor (Corridors of Time)',
                artist: 'Yasunori Mitsuda',
                plays: '2,841,902',
                duration: '5:24',
                thumbnail: featuredRelease.cover
              },
              {
                videoId: 'V9PVRfjEBTI',
                title: 'Secret of the Forest',
                artist: 'Yasunori Mitsuda, London Symphony Orchestra',
                plays: '954,120',
                duration: '4:46',
                thumbnail: featuredRelease.cover
              },
              {
                videoId: 'LK7-_dgAVQE',
                title: 'Schala’s Theme',
                artist: 'Yasunori Mitsuda',
                plays: '3,109,481',
                duration: '3:58',
                thumbnail: featuredRelease.cover
              },
              {
                videoId: 'MV_3Dpw-BRY',
                title: 'To Far Away Times',
                artist: 'Yasunori Mitsuda, London Symphony Orchestra',
                plays: '1,720,443',
                duration: '4:30',
                thumbnail: featuredRelease.cover
              }
            ]
          })}
          className="flex flex-col md:flex-row items-center gap-space-lg p-space-lg rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40 cursor-pointer hover:border-primary/40 transition-all group"
        >
          <img 
            className="w-48 h-48 md:w-56 md:h-56 rounded-lg object-cover shadow-sm flex-shrink-0 group-hover:scale-[1.02] transition-transform duration-300" 
            alt={featuredRelease.title} 
            src={featuredRelease.cover} 
          />
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <span className="text-label-sm uppercase tracking-wider text-outline font-semibold mb-1">
              Featured Release
            </span>
            <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-1 truncate group-hover:text-primary transition-colors">
              {featuredRelease.title}
            </h2>
            <p className="text-body-md font-medium text-primary mb-space-sm">
              {featuredRelease.artist}
            </p>
            <p className="text-body-sm text-on-surface-variant mb-space-lg line-clamp-3 leading-relaxed">
              {featuredRelease.description}
            </p>
            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayTrack(featuredRelease);
                }}
                className="flex items-center gap-1.5 px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-body-sm transition-all shadow active:scale-95"
              >
                <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                <span>Play Album</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openPlaylist({
                    id: 'chrono-trigger',
                    name: featuredRelease.title,
                    title: featuredRelease.title,
                    artist: featuredRelease.artist,
                    cover: featuredRelease.cover,
                    songs: getTracksForCompilation(featuredRelease.title)
                  });
                }}
                className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-body-sm transition-colors"
              >
                <span className="material-symbols-outlined text-title-md">queue_music</span>
                <span>View Playlist</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike({
                    videoId: featuredRelease.videoId,
                    title: featuredRelease.title,
                    artist: featuredRelease.artist,
                    thumbnail: featuredRelease.cover
                  });
                }}
                className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-body-sm transition-colors"
              >
                <span className="material-symbols-outlined text-title-md">favorite_border</span>
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Clean 'Made For You' Grid */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-space-md">
            <h3 className="text-title-lg font-headline font-bold text-on-surface">
              Made For You
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className="text-body-sm font-semibold text-primary hover:underline"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {/* Card 1: Daily Mix 1 */}
            <div 
              onClick={() => openPlaylist({
                id: 'daily-mix-1',
                name: 'Daily Mix 1',
                title: 'Daily Mix 1',
                artist: 'Jon Hopkins, Bonobo, Rival Consoles',
                composer: 'MusicRoom Algorithm',
                genre: 'Synthwave / Electronic',
                year: '2024',
                cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6yVw5M7qnJyfkF3OHN41cm40lxRjqtO2st6JrDM1mNqVV6ARQOTh_WxE1b4i7DEPy46fYWs1zX0NDVkY6UuZlRKyq0g_x2l26ZXeK56GAcWwJHy0QHyk3i_0RuzL9yQnaUIASU4s9jbwBgD3PqGuXRCHADf2d6Mj7dAv1JUyRIV_JwivTEHfBJ-seB_DcMWR8aEBNAXmPjfpTMyIt32jRaMogwyl8JBlCx8gP2cQ',
                songs: DAILY_MIX_1
              })}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/30 hover:border-primary/40"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-space-sm bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Daily Mix 1 cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6yVw5M7qnJyfkF3OHN41cm40lxRjqtO2st6JrDM1mNqVV6ARQOTh_WxE1b4i7DEPy46fYWs1zX0NDVkY6UuZlRKyq0g_x2l26ZXeK56GAcWwJHy0QHyk3i_0RuzL9yQnaUIASU4s9jbwBgD3PqGuXRCHADf2d6Mj7dAv1JUyRIV_JwivTEHfBJ-seB_DcMWR8aEBNAXmPjfpTMyIt32jRaMogwyl8JBlCx8gP2cQ" 
                />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayMix(DAILY_MIX_1, 'Daily Mix 1');
                  }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Play Daily Mix 1"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <span className="text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Daily Mix 1</span>
              <span className="text-body-sm text-on-surface-variant truncate">Synthwave, Electronic</span>
              <span className="text-label-sm font-metric-mono text-outline mt-1">50 Tracks • Tap to Open</span>
            </div>

            {/* Card 2: Discover Weekly */}
            <div 
              onClick={() => openPlaylist({
                id: 'discover-weekly',
                name: 'Discover Weekly',
                title: 'Discover Weekly',
                artist: 'Indie & Underground Electronic',
                composer: 'MusicRoom Algorithm',
                genre: 'Indie / Electronica',
                year: '2024',
                cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACHyCSyZUmrwQ84aavBBf8tKqLQDJX9ELKXsnm0x3oeUOWP-Y37tOBxfCgh0rUsy3bu4FCDucAW8Iom7aDB2WXkiKQyyd60HGUzIOH3h3h_gya-VezLu89Y75nD9GdREotRwjC-IkAinyeXAFirB-aD8-cRp56cL8LTYVdLyo7BBVpotaYlu1yI7uc4ESIto8Hq8E6ngeIek6KQAMX2cJGlukkNVDJSG202sdlstQ',
                songs: DISCOVER_WEEKLY
              })}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/30 hover:border-primary/40"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-space-sm bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Discover Weekly cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACHyCSyZUmrwQ84aavBBf8tKqLQDJX9ELKXsnm0x3oeUOWP-Y37tOBxfCgh0rUsy3bu4FCDucAW8Iom7aDB2WXkiKQyyd60HGUzIOH3h3h_gya-VezLu89Y75nD9GdREotRwjC-IkAinyeXAFirB-aD8-cRp56cL8LTYVdLyo7BBVpotaYlu1yI7uc4ESIto8Hq8E6ngeIek6KQAMX2cJGlukkNVDJSG202sdlstQ" 
                />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayMix(DISCOVER_WEEKLY, 'Discover Weekly');
                  }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Play Discover Weekly"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <span className="text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Discover Weekly</span>
              <span className="text-body-sm text-on-surface-variant truncate">Indie &amp; Electronica</span>
              <span className="text-label-sm font-metric-mono text-outline mt-1">30 Tracks • Tap to Open</span>
            </div>

            {/* Card 3: Deep Focus */}
            <div 
              onClick={() => openPlaylist({
                id: 'deep-focus',
                name: 'Deep Focus',
                title: 'Deep Focus',
                artist: 'Ambient & Binaural Drone Masters',
                composer: 'MusicRoom Neural Studio',
                genre: 'Ambient / Study',
                year: '2024',
                cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIZKkFakC3ShKy-Bl4JFWJDBM4G1OK8l_CyPAYEq2CXTqqhxRzmjDUHy5qcBGNgTQP1izrcFAkWz7hOukD7-Bvyx3oxyPDcH9y1ObW9npDJyct3G6eoCJs_Leo-zwaQBukaPoARCwGrJ4vcKqRXHPXxWa1UCS3i8RcpjaVvmzDC2pQiYPFiEloYolQIykVT4FwdXuwcry7SNBIo0UStEq0mrv83wHvtxX3T_feFTo',
                songs: DEEP_FOCUS_NEURAL
              })}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/30 hover:border-primary/40"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-space-sm bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Deep Focus cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIZKkFakC3ShKy-Bl4JFWJDBM4G1OK8l_CyPAYEq2CXTqqhxRzmjDUHy5qcBGNgTQP1izrcFAkWz7hOukD7-Bvyx3oxyPDcH9y1ObW9npDJyct3G6eoCJs_Leo-zwaQBukaPoARCwGrJ4vcKqRXHPXxWa1UCS3i8RcpjaVvmzDC2pQiYPFiEloYolQIykVT4FwdXuwcry7SNBIo0UStEq0mrv83wHvtxX3T_feFTo" 
                />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayMix(DEEP_FOCUS_NEURAL, 'Deep Focus');
                  }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Play Deep Focus"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <span className="text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Deep Focus</span>
              <span className="text-body-sm text-on-surface-variant truncate">Ambient Study Beats</span>
              <span className="text-label-sm font-metric-mono text-outline mt-1">44 Tracks • Tap to Open</span>
            </div>

            {/* Card 4: Late Night Lo-Fi */}
            <div 
              onClick={() => openPlaylist({
                id: 'late-night-lofi',
                name: 'Late Night Lo-Fi',
                title: 'Late Night Lo-Fi',
                artist: 'Warm Vinyl, Coffee & Rain',
                composer: 'MusicRoom Lo-Fi Lab',
                genre: 'Lo-Fi / Chill',
                year: '2024',
                cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRHOsES2xlzV9VZseDMLjq_ioK5JH63zcZv0YBu1e2Isa3Je053YU15mhBT3SVi7aSbOAqIVNNbyOIStb9h7I_nyS3whTiTGgAsmR4D0g2povJCwIx2RfKrEQBjOPjgxf3huRBe-ktPXL8VGLjxKhP3t58XYqEXFnUoAhQdMh28YzIl-R4QLChijH2uzKdUinSpcosYSgEMmFouyrgr9OAOLlDNidzk-1UIXKJteQ',
                songs: LATE_NIGHT_LOFI
              })}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/30 hover:border-primary/40"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-space-sm bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Late Night Lo-Fi cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRHOsES2xlzV9VZseDMLjq_ioK5JH63zcZv0YBu1e2Isa3Je053YU15mhBT3SVi7aSbOAqIVNNbyOIStb9h7I_nyS3whTiTGgAsmR4D0g2povJCwIx2RfKrEQBjOPjgxf3huRBe-ktPXL8VGLjxKhP3t58XYqEXFnUoAhQdMh28YzIl-R4QLChijH2uzKdUinSpcosYSgEMmFouyrgr9OAOLlDNidzk-1UIXKJteQ" 
                />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayMix(LATE_NIGHT_LOFI, 'Late Night Lo-Fi');
                  }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Play Late Night Lo-Fi"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <span className="text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">Late Night Lo-Fi</span>
              <span className="text-body-sm text-on-surface-variant truncate">Warm Vinyl &amp; Rain</span>
              <span className="text-label-sm font-metric-mono text-outline mt-1">62 Tracks • Tap to Open</span>
            </div>
          </div>
        </section>

        {/* 4. Clean Top Trending Table Section */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-space-md">
            <h3 className="text-title-lg font-headline font-bold text-on-surface">
              Top Trending
            </h3>
            <div className="flex items-center gap-space-xs">
              {['Today', 'This Week', 'All Time'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTrendingFilter(filter)}
                  className={`px-space-sm py-1 rounded text-body-sm transition-colors ${
                    trendingFilter === filter
                      ? 'bg-surface-container-high text-primary font-semibold'
                      : 'hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full bg-surface-container-low rounded-lg overflow-hidden border border-surface-container-high/40">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-space-md py-2.5 text-label-sm uppercase tracking-wider text-outline font-semibold border-b border-surface-container-high">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Title</div>
              <div className="col-span-3 hidden md:block">Artist</div>
              <div className="col-span-2 hidden md:block text-right">Duration</div>
              <div className="col-span-6 md:col-span-1 text-right">Play</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-surface-container-high">
              {trendingTracks.map((track) => {
                const isPlayingThis = currentSong?.videoId === track.videoId && playback.isPlaying;
                return (
                  <div
                    key={track.id}
                    onClick={() => handlePlayTrack(track)}
                    className="grid grid-cols-12 items-center px-space-md py-2.5 hover:bg-surface-container transition-colors group cursor-pointer"
                  >
                    <div className="col-span-1 text-center text-body-sm text-outline font-medium">
                      {isPlayingThis ? (
                        <span className="material-symbols-outlined text-title-sm text-primary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                          volume_up
                        </span>
                      ) : (
                        <span>{track.id}</span>
                      )}
                    </div>
                    <div className="col-span-5 flex items-center gap-space-sm min-w-0 pr-space-xs">
                      <img 
                        className="w-9 h-9 rounded object-cover flex-shrink-0" 
                        alt={track.title} 
                        src={track.cover}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80';
                        }} 
                      />
                      <span className={`text-body-sm font-semibold truncate ${isPlayingThis ? 'text-primary' : 'text-on-surface'}`}>
                        {track.title}
                      </span>
                    </div>
                    <div className="col-span-3 hidden md:block text-body-sm text-on-surface-variant truncate">
                      {track.artist}
                    </div>
                    <div className="col-span-2 hidden md:block text-right text-body-sm font-metric-mono text-outline">
                      {track.duration}
                    </div>
                    <div className="col-span-6 md:col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrack(track);
                        }}
                        className="text-outline hover:text-primary transition-colors p-1"
                        title="Play"
                      >
                        <span className="material-symbols-outlined text-title-md">
                          {isPlayingThis ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
