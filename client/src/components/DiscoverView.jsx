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
    toggleLike
  } = usePlayer();

  const [trendingFilter, setTrendingFilter] = useState('Today'); // 'Today' | 'This Week' | 'All Time'

  // Trending tracks for table
  const trendingTracks = [
    {
      id: 1,
      title: 'Die With A Smile',
      artist: 'Lady Gaga, Bruno Mars',
      duration: '4:11',
      videoId: 'kPa7bsKwL-c',
      cover: 'https://i.ytimg.com/vi/kPa7bsKwL-c/hqdefault.jpg'
    },
    {
      id: 2,
      title: 'Tauba Tauba',
      artist: 'Karan Aujla',
      duration: '3:24',
      videoId: 'LK7-_dgAVQE',
      cover: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg'
    },
    {
      id: 3,
      title: 'Espresso',
      artist: 'Sabrina Carpenter',
      duration: '2:55',
      videoId: 'eVTXPUF4Oz4',
      cover: 'https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg'
    },
    {
      id: 4,
      title: 'Big Dawgs',
      artist: 'Hanumankind, Kalmi',
      duration: '3:56',
      videoId: 'hOHKltAiKXQ',
      cover: 'https://i.ytimg.com/vi/hOHKltAiKXQ/hqdefault.jpg'
    },
    {
      id: 5,
      title: 'Neon Horizon',
      artist: 'The Midnight • Timecop1983',
      duration: '4:15',
      videoId: 'MV_3Dpw-BRY',
      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHlMcD6WRSsBh4X5St7J_4oZzQsS234DF0-EH2eT252GWtcOFyk6iDo8E-NgcXM_MogmCdT5p5a6PDzIkyLVjitY5lwpiH9o4-LHRKg8aUB9QNAzhPXzvhHe0UiSrkpBYteOpwdTnMdo3l1VUtTScLu6sDfSOmCgtMZj-yigVUQfCd86VSV3ovTaIvwVYTKfuSrRw4Gccp5njoD61BLr89S5yJbyCc84iBFA4hw8U'
    },
    {
      id: 6,
      title: 'Jo Tum Mere Ho',
      artist: 'Anuv Jain',
      duration: '4:05',
      videoId: 'gPpQNzKP6g4',
      cover: 'https://i.ytimg.com/vi/gPpQNzKP6g4/hqdefault.jpg'
    }
  ];

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
        <div className="flex flex-col md:flex-row items-center gap-space-lg p-space-lg rounded-xl bg-surface-container-low shadow-sm border border-surface-container-high/40">
          <img 
            className="w-48 h-48 md:w-56 md:h-56 rounded-lg object-cover shadow-sm flex-shrink-0" 
            alt={featuredRelease.title} 
            src={featuredRelease.cover} 
          />
          <div className="flex flex-col justify-center flex-1 min-w-0">
            <span className="text-label-sm uppercase tracking-wider text-outline font-semibold mb-1">
              Featured Release
            </span>
            <h2 className="text-headline-sm font-headline font-bold text-on-surface mb-1 truncate">
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
                onClick={() => handlePlayTrack(featuredRelease)}
                className="flex items-center gap-1.5 px-space-lg py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-body-sm transition-all shadow active:scale-95"
              >
                <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
                <span>Play Album</span>
              </button>
              <button
                type="button"
                onClick={() => {
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
                <span>Save to Library</span>
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
              onClick={() => handlePlayMix(DAILY_MIX_1, 'Daily Mix 1')}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/30"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-space-sm bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Daily Mix 1 cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6yVw5M7qnJyfkF3OHN41cm40lxRjqtO2st6JrDM1mNqVV6ARQOTh_WxE1b4i7DEPy46fYWs1zX0NDVkY6UuZlRKyq0g_x2l26ZXeK56GAcWwJHy0QHyk3i_0RuzL9yQnaUIASU4s9jbwBgD3PqGuXRCHADf2d6Mj7dAv1JUyRIV_JwivTEHfBJ-seB_DcMWR8aEBNAXmPjfpTMyIt32jRaMogwyl8JBlCx8gP2cQ" 
                />
                <button 
                  type="button"
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Play Daily Mix 1"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <span className="text-body-md font-semibold text-on-surface truncate">Daily Mix 1</span>
              <span className="text-body-sm text-on-surface-variant truncate">Synthwave, Electronic</span>
              <span className="text-label-sm font-metric-mono text-outline mt-1">50 Tracks</span>
            </div>

            {/* Card 2: Discover Weekly */}
            <div 
              onClick={() => handlePlayMix(DISCOVER_WEEKLY, 'Discover Weekly')}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/30"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-space-sm bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Discover Weekly cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACHyCSyZUmrwQ84aavBBf8tKqLQDJX9ELKXsnm0x3oeUOWP-Y37tOBxfCgh0rUsy3bu4FCDucAW8Iom7aDB2WXkiKQyyd60HGUzIOH3h3h_gya-VezLu89Y75nD9GdREotRwjC-IkAinyeXAFirB-aD8-cRp56cL8LTYVdLyo7BBVpotaYlu1yI7uc4ESIto8Hq8E6ngeIek6KQAMX2cJGlukkNVDJSG202sdlstQ" 
                />
                <button 
                  type="button"
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Play Discover Weekly"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <span className="text-body-md font-semibold text-on-surface truncate">Discover Weekly</span>
              <span className="text-body-sm text-on-surface-variant truncate">Indie &amp; Electronica</span>
              <span className="text-label-sm font-metric-mono text-outline mt-1">30 Tracks</span>
            </div>

            {/* Card 3: Deep Focus */}
            <div 
              onClick={() => handlePlayMix(DEEP_FOCUS_NEURAL, 'Deep Focus')}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/30"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-space-sm bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Deep Focus cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIZKkFakC3ShKy-Bl4JFWJDBM4G1OK8l_CyPAYEq2CXTqqhxRzmjDUHy5qcBGNgTQP1izrcFAkWz7hOukD7-Bvyx3oxyPDcH9y1ObW9npDJyct3G6eoCJs_Leo-zwaQBukaPoARCwGrJ4vcKqRXHPXxWa1UCS3i8RcpjaVvmzDC2pQiYPFiEloYolQIykVT4FwdXuwcry7SNBIo0UStEq0mrv83wHvtxX3T_feFTo" 
                />
                <button 
                  type="button"
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Play Deep Focus"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <span className="text-body-md font-semibold text-on-surface truncate">Deep Focus</span>
              <span className="text-body-sm text-on-surface-variant truncate">Ambient Study Beats</span>
              <span className="text-label-sm font-metric-mono text-outline mt-1">44 Tracks</span>
            </div>

            {/* Card 4: Late Night Lo-Fi */}
            <div 
              onClick={() => handlePlayMix(LATE_NIGHT_LOFI, 'Late Night Lo-Fi')}
              className="flex flex-col p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/30"
            >
              <div className="relative aspect-square w-full rounded-md overflow-hidden mb-space-sm bg-surface-container-high">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt="Late Night Lo-Fi cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRHOsES2xlzV9VZseDMLjq_ioK5JH63zcZv0YBu1e2Isa3Je053YU15mhBT3SVi7aSbOAqIVNNbyOIStb9h7I_nyS3whTiTGgAsmR4D0g2povJCwIx2RfKrEQBjOPjgxf3huRBe-ktPXL8VGLjxKhP3t58XYqEXFnUoAhQdMh28YzIl-R4QLChijH2uzKdUinSpcosYSgEMmFouyrgr9OAOLlDNidzk-1UIXKJteQ" 
                />
                <button 
                  type="button"
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                  title="Play Late Night Lo-Fi"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
              <span className="text-body-md font-semibold text-on-surface truncate">Late Night Lo-Fi</span>
              <span className="text-body-sm text-on-surface-variant truncate">Warm Vinyl &amp; Rain</span>
              <span className="text-label-sm font-metric-mono text-outline mt-1">62 Tracks</span>
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
