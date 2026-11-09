import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(sec) {
  if (isNaN(sec) || sec === null || sec === undefined) return '0:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function DesktopLeftSidebar() {
  const {
    activeTab,
    setActiveTab,
    playlists,
    setPlaylistModalMode,
    openPlaylist,
    activeRoom,
    roomMembers,
    setIsPartyModalOpen,
    setIsImportModalOpen,
    likedSongs,
    playPlaylist
  } = usePlayer();

  return (
    <aside className="fixed left-0 top-0 bottom-20 w-64 bg-surface-container-low z-40 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] select-none border-r border-surface-container-high">
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Brand Header */}
        <div 
          onClick={() => setActiveTab('discover')}
          className="px-gutter-sm pt-space-lg pb-space-md flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-space-sm">
            <img 
              alt="MusicRoom Brand Mark" 
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida/ALJJyrBOkg2RAx8dgowYF5zHZZ2e5aYwPREUsOUawFJlwR7Rt3x95vsabcN1lAzcarKZWgPGIQ1fpHcfi5H-6uAF0niJe2Skch_9yiGnmulyJS_rt8a9RAe-_zRprOlra9AWWFC-VPITVQXvE42EXKTBz14gFfkBhLUjToMJ32DhfDfStFc-ngsHLucBEwMfwE01y7MhUOC_3nlAfqe28xOxFYzZ6MJOqTp3X27z-pmgQKU" 
            />
            <span className="font-title text-title-lg font-bold text-on-surface tracking-tight">
              MusicRoom
            </span>
          </div>
        </div>

        {/* Section: Menu */}
        <div className="px-gutter-sm pt-space-xs">
          <p className="px-space-sm pb-space-xs text-label-sm font-label-sm text-outline uppercase tracking-wider font-semibold">
            Menu
          </p>
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('discover')}
              className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors text-left ${
                activeTab === 'discover'
                  ? 'bg-surface-container-high text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-title-md font-normal">explore</span>
              <span className="font-title text-title-sm font-medium">Discovery</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors text-left ${
                activeTab === 'search'
                  ? 'bg-surface-container-high text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-title-md font-normal">search</span>
              <span className="font-title text-title-sm font-medium">Search &amp; Explore</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors text-left ${
                activeTab === 'library'
                  ? 'bg-surface-container-high text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-title-md font-normal">library_music</span>
              <span className="font-title text-title-sm font-medium">Your Library</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPartyModalOpen(true)}
              className="flex items-center justify-between px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors group text-left"
            >
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-title-md font-normal text-secondary">podcasts</span>
                <span className="font-title text-title-sm font-medium">Aux Room</span>
              </div>
              {activeRoom ? (
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" title="Connected to Party" />
              ) : (
                <span className="text-[10px] font-metric-mono px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary uppercase font-semibold">
                  Live
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-space-sm px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left"
            >
              <span className="material-symbols-outlined text-title-md font-normal text-primary">sync_alt</span>
              <span className="font-title text-title-sm font-medium">Playlist Importer</span>
            </button>
          </nav>
        </div>

        {/* Section: Playlists */}
        <div className="flex-1 flex flex-col min-h-0 px-gutter-sm mt-space-md">
          <div className="flex items-center justify-between px-space-sm pb-space-xs">
            <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider font-semibold">
              Playlists
            </span>
            <button
              type="button"
              onClick={() => setPlaylistModalMode('create')}
              className="flex items-center text-outline hover:text-on-surface text-label-sm font-label-sm p-1 rounded hover:bg-surface-container transition-colors"
              title="Create new playlist"
            >
              <span className="material-symbols-outlined text-title-sm">add</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
            {/* Liked Songs Entry */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('library');
              }}
              className="flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-title-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
                <span className="truncate font-body-sm text-body-sm font-medium">Liked Songs</span>
              </div>
              <span className="font-metric-mono text-metric-mono text-outline">
                {likedSongs ? likedSongs.length : 342}
              </span>
            </button>

            {/* Curated Presets */}
            <button
              type="button"
              onClick={() => playPlaylist('lofi-focus')}
              className="flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left group"
            >
              <span className="truncate font-body-sm text-body-sm group-hover:text-primary transition-colors">
                Deep Lo-Fi Focus
              </span>
              <span className="font-metric-mono text-[10px] text-outline">44</span>
            </button>

            <button
              type="button"
              onClick={() => playPlaylist('synthwave')}
              className="flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left group"
            >
              <span className="truncate font-body-sm text-body-sm group-hover:text-primary transition-colors">
                Synthwave 2088
              </span>
              <span className="font-metric-mono text-[10px] text-outline">50</span>
            </button>

            <button
              type="button"
              onClick={() => playPlaylist('techno')}
              className="flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left group"
            >
              <span className="truncate font-body-sm text-body-sm group-hover:text-primary transition-colors">
                Melodic Techno Club
              </span>
              <span className="font-metric-mono text-[10px] text-outline">38</span>
            </button>

            {/* User Custom Playlists */}
            {playlists && playlists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => openPlaylist(pl)}
                className="flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left group"
              >
                <span className="truncate font-body-sm text-body-sm group-hover:text-primary transition-colors">
                  {pl.name}
                </span>
                <span className="font-metric-mono text-[10px] text-outline">
                  {pl.songs ? pl.songs.length : 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="p-gutter-sm border-t border-surface-container-high/60">
          <button
            type="button"
            onClick={() => setPlaylistModalMode('create')}
            className="w-full flex items-center justify-center gap-space-xs py-2.5 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-title text-title-sm font-semibold transition-all shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-95"
          >
            <span className="material-symbols-outlined text-title-md text-primary">playlist_add</span>
            <span>New Playlist</span>
          </button>
        </div>

      </div>
    </aside>
  );
}

export function DesktopTopHeader() {
  const {
    setActiveTab,
    setIsPartyModalOpen,
    activeRoom,
    roomMembers
  } = usePlayer();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl z-30 flex items-center justify-between px-gutter border-b border-surface-container-high/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Quick Search Trigger */}
      <div className="flex items-center gap-space-md max-w-md w-full">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className="w-full flex items-center justify-between bg-surface-container-low hover:bg-surface-container px-space-md py-2 rounded-full text-on-surface-variant transition-colors border border-surface-container-high/50"
        >
          <div className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-title-md text-outline">search</span>
            <span className="font-body text-body-sm text-outline">Search tracks, playlists, artists...</span>
          </div>
          <kbd className="px-space-xs py-0.5 rounded bg-surface-container-high text-outline text-label-sm font-label-sm uppercase font-mono">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Navigation Shortcuts & User Status */}
      <div className="flex items-center gap-space-md">
        <nav className="hidden md:flex items-center gap-space-md text-body-sm text-on-surface-variant font-medium">
          <button 
            type="button" 
            onClick={() => setActiveTab('discover')}
            className="hover:text-on-surface transition-colors"
          >
            Discover
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('search')}
            className="hover:text-on-surface transition-colors"
          >
            Search
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('library')}
            className="hover:text-on-surface transition-colors"
          >
            Library
          </button>
          <button 
            type="button" 
            onClick={() => setIsPartyModalOpen(true)}
            className="hover:text-secondary transition-colors flex items-center gap-1.5"
          >
            <span>Aux Room</span>
            {activeRoom && (
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            )}
          </button>
        </nav>

        {/* Aux Room Connect Action */}
        <button
          type="button"
          onClick={() => setIsPartyModalOpen(true)}
          className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-full font-title text-title-sm font-semibold transition-all shadow-sm ${
            activeRoom 
              ? 'bg-secondary text-on-secondary shadow-glow-emerald' 
              : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-title-sm">
            {activeRoom ? 'podcasts' : 'sensors'}
          </span>
          <span>{activeRoom ? `Room #${activeRoom.id} (${roomMembers.length})` : 'Join Aux Room'}</span>
        </button>

        {/* Profile Avatar */}
        <div className="relative flex items-center cursor-pointer" title="MusicRoom Session Profile">
          <img 
            alt="Profile Avatar" 
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40 hover:ring-primary transition-all" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAHwDvGARDDVyKPZKt921jmiMDxRisc9Jbts1ryL_XwOVChyNE_S8ScaKyf3u2pVDCts-S1B13lo5Zz7S4932UWwCoH5EVeJqPnxKA2J1hxBjxycRXzJw7XNOYiNz48KOQqcFNxNua8rcTTRoZxlEnj1O4KjhEkC0kigETYBaGQUkNCRjnArkPuC6uEJ1L3hLAWL4HthsF9STx5Jp9gcocSBWn6M4kunNeHmOvLkg" 
          />
        </div>
      </div>
    </header>
  );
}

export function DesktopPlayerBar() {
  const {
    currentSong,
    playback,
    togglePlayPause,
    seekTo,
    nextSong,
    prevSong,
    isLiked,
    toggleLike,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    setIsFullScreen,
    isQueueOpen,
    setIsQueueOpen
  } = usePlayer();

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  if (!currentSong) return null;

  const liked = isLiked(currentSong.videoId);
  const progressPercent = playback.duration > 0
    ? Math.min(100, Math.max(0, (playback.currentTime / playback.duration) * 100))
    : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-surface-container-lowest/95 backdrop-blur-2xl z-50 px-gutter border-t border-surface-container-high/80 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.4)] select-none">
      
      {/* 1. Left: Track Artwork & Identity */}
      <div className="flex items-center gap-space-md w-1/4 min-w-[200px] max-w-sm">
        <div 
          onClick={() => setIsFullScreen(true)}
          className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer group shadow-sm relative border border-white/5"
          title="Open Lyrics & Now Playing Studio"
        >
          <img
            src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
            alt={currentSong.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="material-symbols-outlined text-white text-title-md">open_in_full</span>
          </div>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span 
            onClick={() => setIsFullScreen(true)}
            className="truncate text-body-sm font-semibold text-on-surface cursor-pointer hover:text-primary transition-colors leading-tight"
            title={currentSong.title}
          >
            {currentSong.title}
          </span>
          <span className="truncate text-label-sm text-on-surface-variant font-medium mt-0.5">
            {currentSong.channelTitle || 'Artist'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => toggleLike(currentSong)}
          className={`p-1 transition-colors ${
            liked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`}
          title={liked ? "Remove from Liked" : "Like track"}
        >
          <span 
            className="material-symbols-outlined text-title-md" 
            style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
          >
            {liked ? 'favorite' : 'favorite_border'}
          </span>
        </button>
      </div>

      {/* 2. Center: Controls & Scrubber */}
      <div className="flex flex-col items-center justify-center w-2/4 max-w-xl px-space-md">
        {/* Controls Row */}
        <div className="flex items-center gap-space-md mb-1.5">
          <button
            type="button"
            onClick={() => setIsShuffle(!isShuffle)}
            className={`transition-colors p-1 ${isShuffle ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            title="Shuffle"
          >
            <span className="material-symbols-outlined text-body-md">shuffle</span>
          </button>

          <button
            type="button"
            onClick={prevSong}
            className="text-on-surface hover:text-primary transition-colors p-1"
            title="Previous track"
          >
            <span className="material-symbols-outlined text-title-md">skip_previous</span>
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
            title={playback.isPlaying ? "Pause" : "Play"}
          >
            <span 
              className="material-symbols-outlined text-headline-sm" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {playback.isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            type="button"
            onClick={nextSong}
            className="text-on-surface hover:text-primary transition-colors p-1"
            title="Next track"
          >
            <span className="material-symbols-outlined text-title-md">skip_next</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRepeat(!isRepeat)}
            className={`transition-colors p-1 ${isRepeat ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            title="Repeat"
          >
            <span className="material-symbols-outlined text-body-md">repeat</span>
          </button>
        </div>

        {/* Scrubber Row */}
        <div className="w-full flex items-center gap-space-sm">
          <span className="text-label-sm font-metric-mono text-outline min-w-[34px] text-right">
            {formatTime(playback.currentTime)}
          </span>
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              seekTo(ratio * playback.duration);
            }}
            className="relative flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden cursor-pointer group py-1"
          >
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-surface-container-high rounded-full">
              <div
                className="h-full bg-primary rounded-full relative group-hover:bg-primary-container transition-all"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow transition-opacity" />
              </div>
            </div>
          </div>
          <span className="text-label-sm font-metric-mono text-outline min-w-[34px]">
            {formatTime(playback.duration)}
          </span>
        </div>
      </div>

      {/* 3. Right: Quality Badge, Lyrics Studio, Volume & Queue */}
      <div className="flex items-center justify-end gap-space-sm w-1/4 min-w-[200px]">
        {/* Hi-Fi Lossless Chip */}
        <div className="hidden xl:flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full border border-surface-container-high">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          <span className="text-[10px] font-metric-mono text-secondary uppercase font-semibold">
            24-bit/96kHz
          </span>
        </div>

        {/* Lyrics Studio Button */}
        <button
          type="button"
          onClick={() => setIsFullScreen(true)}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          title="Open Synchronized Lyrics Studio"
        >
          <span className="material-symbols-outlined text-title-md">mic</span>
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="hover:text-on-surface transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            <span className="material-symbols-outlined text-title-md">
              {isMuted || volume === 0 ? 'volume_off' : volume > 50 ? 'volume_up' : 'volume_down'}
            </span>
          </button>
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              setVolume(Math.round(ratio * 100));
            }}
            className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden cursor-pointer relative py-1"
          >
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-surface-container-high rounded-full">
              <div 
                className="h-full bg-on-surface-variant rounded-full" 
                style={{ width: `${isMuted ? 0 : volume}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Up Next Drawer Toggle */}
        <button
          type="button"
          onClick={() => setIsQueueOpen(!isQueueOpen)}
          className={`p-1.5 rounded-lg transition-colors ${
            isQueueOpen 
              ? 'bg-surface-container-high text-primary' 
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
          title="Up Next Queue"
        >
          <span className="material-symbols-outlined text-title-md">queue_music</span>
        </button>
      </div>

    </footer>
  );
}
