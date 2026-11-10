import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getTracksForCompilation } from '../data/topHitsData';

function formatDuration(val) {
  if (typeof val === 'string' && val.includes(':')) return val;
  const sec = Number(val);
  if (isNaN(sec) || !sec) return '3:45';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function PlaylistView() {
  const {
    selectedPlaylist,
    setActiveTab,
    playSong,
    currentSong,
    playback,
    togglePlayPause,
    isLiked,
    toggleLike,
    addToQueue,
    setMenuSong
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('custom'); // 'custom' | 'recent' | 'artist' | 'title'
  const [isDownloaded, setIsDownloaded] = useState(true);

  // Fallback if no playlist is selected: Default to Chrono Trigger Re-Imagined / Synthwave 2088
  const playlist = selectedPlaylist || {
    id: 'synthwave-2088',
    name: 'Synthwave 2088',
    title: 'Synthwave 2088',
    artist: 'Alex M. & Master Artists',
    composer: 'Alex M.',
    year: '2024',
    genre: 'Synthwave / Retro Electro',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5RLhC_0ngzLxhcP5ssJQZt91z6PaSdUcMBdNcX80qNkXeYv-MxXCJZmC8Tvl5iRLf6Z3U1j3v0YMWBeELFAMdljy3FSYTbfymw_LOqStXU2EbkePL2GGvFXc8_MrEiJAB7nZWzdyjM8ZzSJb9dQViKKag4Y6avP2BLieNwwaiQYW-bKjP7QbpxSBiN31N2Ea2W1HMyhjczPUnUZ7aXvDdYGkBiJRWyKZHZbksd_4',
    composerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaPlPFxtZgj05ubsylxm7YmCnK1ImClZAyoykokvevb0RU4ycOQOc0oJa_Or1BE9IK8-13DAqE7JSRv8TzWMswIX3MfcaKQH2z-nywHLhNNkNz3TqgQhyA7PKsusIjQTn2-dGOTK49wQMLCmCX9QbeW4hZKMTGixMMuvJcPVJgxYlJ3YdfBstRa5i6FnwMMoecdsUEXUXs5Lm_Ufxb0ZE_D2vdJhz0mGoYcmBdPWM',
    songs: [
      {
        videoId: 'MV_3Dpw-BRY',
        title: 'Nightcall',
        artist: 'Kavinsky',
        album: 'OutRun',
        plays: '142,840,192',
        duration: '4:19',
        thumbnail: 'https://i.ytimg.com/vi/MV_3Dpw-BRY/hqdefault.jpg'
      },
      {
        videoId: '4lzfqn2FpY0',
        title: 'Voyager',
        artist: 'Daft Punk',
        album: 'Discovery',
        plays: '98,241,902',
        duration: '3:47',
        thumbnail: 'https://i.ytimg.com/vi/4lzfqn2FpY0/hqdefault.jpg'
      },
      {
        videoId: 'rDBbaGCCIhk',
        title: 'Sunset',
        artist: 'The Midnight',
        album: 'Endless Summer',
        plays: '45,954,120',
        duration: '5:26',
        thumbnail: 'https://i.ytimg.com/vi/rDBbaGCCIhk/hqdefault.jpg'
      },
      {
        videoId: '8GW6sLrK40k',
        title: 'Resonance',
        artist: 'HOME',
        album: 'Odyssey',
        plays: '112,109,481',
        duration: '3:32',
        thumbnail: 'https://i.ytimg.com/vi/8GW6sLrK40k/hqdefault.jpg'
      },
      {
        videoId: 'qFfybn_W8Ak',
        title: 'Roller Mobster',
        artist: 'Carpenter Brut',
        album: 'Trilogy',
        plays: '34,720,443',
        duration: '3:34',
        thumbnail: 'https://i.ytimg.com/vi/qFfybn_W8Ak/hqdefault.jpg'
      }
    ]
  };

  const rawTracks = playlist.songs || getTracksForCompilation(playlist.id) || [];
  const albumCover = playlist.cover || playlist.thumbnail || (rawTracks[0]?.thumbnail) || 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5RLhC_0ngzLxhcP5ssJQZt91z6PaSdUcMBdNcX80qNkXeYv-MxXCJZmC8Tvl5iRLf6Z3U1j3v0YMWBeELFAMdljy3FSYTbfymw_LOqStXU2EbkePL2GGvFXc8_MrEiJAB7nZWzdyjM8ZzSJb9dQViKKag4Y6avP2BLieNwwaiQYW-bKjP7QbpxSBiN31N2Ea2W1HMyhjczPUnUZ7aXvDdYGkBiJRWyKZHZbksd_4';

  const filteredTracks = rawTracks.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.artist && t.artist.toLowerCase().includes(q)) ||
      (t.channelTitle && t.channelTitle.toLowerCase().includes(q))
    );
  });

  const handlePlayAll = () => {
    if (filteredTracks.length > 0) {
      playSong(filteredTracks[0], true);
      for (let i = 1; i < Math.min(filteredTracks.length, 15); i++) {
        addToQueue(filteredTracks[i]);
      }
    }
  };

  const handleShufflePlay = () => {
    if (filteredTracks.length > 0) {
      const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], true);
      for (let i = 1; i < Math.min(shuffled.length, 15); i++) {
        addToQueue(shuffled[i]);
      }
    }
  };

  const handlePlayTrack = (track) => {
    playSong({
      videoId: track.videoId,
      title: track.title,
      artist: track.artist || track.channelTitle || playlist.artist,
      channelTitle: track.channelTitle || track.artist || playlist.artist,
      thumbnail: track.thumbnail || albumCover
    }, true);
  };

  return (
    <div className="flex flex-col w-full pb-28 px-4 sm:px-gutter select-none relative">
      
      {/* Subtle Gradient Ambient Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary-container/15 via-surface-container/30 to-transparent pointer-events-none -z-10" />

      <div className="flex flex-col gap-space-lg pt-space-md max-w-7xl mx-auto w-full">

        {/* Top Back Navigation Link */}
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-body-sm font-medium transition-colors self-start"
        >
          <span className="material-symbols-outlined text-title-md">arrow_back</span>
          <span>Back to Discovery</span>
        </button>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 1. PLAYLIST HERO SECTION (RESPONSIVE DESKTOP & MOBILE)     */}
        {/* (Stitch Mobile Screen a5f548f3576e49eeb50820e6bce0a31f)  */}
        {/* ───────────────────────────────────────────────────────── */}
        <header className="flex flex-col lg:flex-row items-center lg:items-end gap-space-lg lg:gap-space-xl pt-space-xs pb-space-md text-center lg:text-left">
          
          {/* Album Cover Artwork with Ambient Glow & Badges */}
          <div className="relative group flex-shrink-0 w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-xl overflow-hidden bg-surface-container-high shadow-2xl border border-white/5">
            <img
              src={albumCover}
              alt={playlist.name || playlist.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest/60 via-transparent to-white/10 pointer-events-none" />
            
            {/* Live Sync Badge */}
            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-mono text-[11px] text-secondary font-bold uppercase tracking-wider">
                LIVE SYNC
              </span>
            </div>
          </div>

          {/* Album Metadata & Action Bar */}
          <div className="flex flex-col justify-end flex-1 min-w-0 items-center lg:items-start w-full">
            <div className="inline-flex items-center gap-1.5 mb-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Studio Master • 96kHz Lossless
              </span>
            </div>

            <h1 className="text-display-mobile sm:text-headline-md lg:text-headline-lg font-headline text-on-surface font-extrabold tracking-tight truncate leading-tight">
              {playlist.name || playlist.title}
            </h1>

            {/* Meta Line */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-space-sm gap-y-1 mt-space-sm text-body-sm font-body text-on-surface-variant">
              <div className="flex items-center gap-space-xs">
                {playlist.composerAvatar && (
                  <img
                    src={playlist.composerAvatar}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                )}
                <span className="text-on-surface font-semibold">
                  Curated by {playlist.composer || playlist.artist || 'Alex M.'}
                </span>
              </div>
              <span className="text-outline">•</span>
              <span>{filteredTracks.length} tracks</span>
              <span className="text-outline">•</span>
              <span>{playlist.year || '2024'}</span>
              <span className="text-outline">•</span>
              <span className="text-secondary flex items-center gap-0.5 font-medium">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Offline Ready</span>
              </span>
            </div>

            {/* Tactile Action Strip */}
            <div className="flex items-center justify-between lg:justify-start gap-space-sm w-full mt-space-lg pt-1">
              
              {/* Secondary Action Buttons */}
              <div className="flex items-center gap-space-xs">
                {/* Download Offline Toggle */}
                <button
                  type="button"
                  onClick={() => setIsDownloaded(!isDownloaded)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isDownloaded
                      ? 'bg-surface-container text-secondary hover:bg-surface-bright'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                  title={isDownloaded ? "Downloaded for offline playback" : "Download offline"}
                >
                  <span className="material-symbols-outlined text-title-md">
                    {isDownloaded ? 'download_done' : 'download'}
                  </span>
                </button>

                {/* Heart / Favorite */}
                <button
                  type="button"
                  onClick={() => {
                    if (filteredTracks.length > 0) toggleLike(filteredTracks[0]);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-primary hover:bg-surface-bright transition-all"
                  title="Favorite playlist"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </button>

                {/* Share Link */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-bright transition-all"
                  title="Share playlist link"
                >
                  <span className="material-symbols-outlined text-title-md">share</span>
                </button>
              </div>

              {/* Play & Shuffle Dual Controller */}
              <div className="flex items-center gap-space-sm ml-auto lg:ml-space-md">
                <button
                  type="button"
                  onClick={handleShufflePlay}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-primary transition-all"
                  title="Shuffle play"
                >
                  <span className="material-symbols-outlined text-title-md">shuffle</span>
                </button>

                {/* Big Impact FAB Play Button */}
                <button
                  type="button"
                  onClick={handlePlayAll}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-primary hover:bg-primary-container text-on-primary shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all p-3"
                  title="Play all tracks"
                >
                  <span className="material-symbols-outlined text-[32px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>

            </div>

          </div>
        </header>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 2. SEARCH & FILTER PILL CLUSTER                          */}
        {/* ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-space-sm border-t border-surface-container-high/60 pt-space-md">
          {/* Find in playlist input */}
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in playlist..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 font-body text-body-md focus:outline-none focus:bg-surface-container-high transition-colors border border-surface-container-high/40"
            />
          </div>

          {/* Filter/Sort Horizontal Scroller */}
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveSort('custom')}
              className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1 flex-shrink-0 transition-colors ${
                activeSort === 'custom'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
              }`}
            >
              <span>Custom Sort</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSort('recent')}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md flex-shrink-0 transition-colors ${
                activeSort === 'recent'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
              }`}
            >
              Recently Added
            </button>

            <button
              type="button"
              onClick={() => setActiveSort('artist')}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md flex-shrink-0 transition-colors ${
                activeSort === 'artist'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
              }`}
            >
              Artist
            </button>

            <button
              type="button"
              onClick={() => setActiveSort('title')}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md flex-shrink-0 transition-colors ${
                activeSort === 'title'
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
              }`}
            >
              Title
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* 3. TRACKLIST SECTION                                     */}
        {/* ───────────────────────────────────────────────────────── */}
        <section className="mt-space-xs">
          
          {/* Desktop Table Headers (Hidden on Mobile) */}
          <div className="hidden lg:grid grid-cols-[48px_1fr_120px_90px_48px] items-center px-space-md py-space-xs text-label-sm font-label-sm uppercase tracking-wider text-outline mb-space-xs font-semibold border-b border-surface-container-high/40">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="text-right">Plays</span>
            <span className="text-right">Time</span>
            <span className="text-center">
              <span className="material-symbols-outlined text-body-md text-outline">favorite</span>
            </span>
          </div>

          {/* Tracks List (Touch-Optimized on Mobile, Wide Table on Desktop) */}
          <div className="flex flex-col gap-1.5 lg:gap-0.5">
            {filteredTracks.map((track, idx) => {
              const isPlayingThis = currentSong?.videoId === track.videoId && playback.isPlaying;
              const liked = isLiked(track.videoId);

              return (
                <div
                  key={track.videoId || idx}
                  onClick={() => handlePlayTrack(track)}
                  className={`group flex items-center justify-between p-2.5 sm:p-space-sm rounded-xl transition-all cursor-pointer ${
                    isPlayingThis
                      ? 'bg-surface-container-high/90 text-primary shadow-sm border border-primary/20'
                      : 'hover:bg-surface-container bg-surface-container-low/40 lg:bg-transparent'
                  }`}
                >
                  {/* Left: Artwork / Equalizer + Title & Artist */}
                  <div className="flex items-center gap-space-sm min-w-0 flex-1 pr-2">
                    {/* Equalizer Graphic / Cover Thumbnail */}
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-surface-container-highest overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={track.thumbnail || albumCover}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = albumCover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80';
                        }}
                      />
                      {isPlayingThis && (
                        <div className="absolute inset-0 bg-black/50 flex items-end justify-center gap-0.5 pb-2">
                          <span className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_100ms] h-3.5"></span>
                          <span className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_300ms] h-5"></span>
                          <span className="w-1 bg-primary rounded-full animate-[bounce_1s_infinite_200ms] h-2.5"></span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className={`font-title text-title-sm font-semibold truncate ${isPlayingThis ? 'text-primary' : 'text-on-surface group-hover:text-primary transition-colors'}`}>
                        {track.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-body-sm text-on-surface-variant truncate">
                        <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-secondary font-mono text-[10px] font-semibold leading-none py-0.5 flex-shrink-0">
                          24-BIT FLAC
                        </span>
                        <span className="truncate">
                          {track.artist || track.channelTitle || playlist.artist} • {track.album || playlist.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Plays, Time & Actions */}
                  <div className="flex items-center gap-space-sm flex-shrink-0">
                    <span className="hidden md:inline text-right text-body-sm font-mono text-outline">
                      {track.plays || '1,248,392'}
                    </span>

                    <span className="font-mono text-body-sm text-outline">
                      {formatDuration(track.duration)}
                    </span>

                    {/* Action buttons */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        liked ? 'text-primary' : 'text-outline hover:text-primary'
                      }`}
                      title="Favorite"
                    >
                      <span className="material-symbols-outlined text-title-sm" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                        {liked ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (setMenuSong) setMenuSong(track);
                      }}
                      className="p-1 rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                      title="More options"
                    >
                      <span className="material-symbols-outlined text-title-md">more_vert</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
