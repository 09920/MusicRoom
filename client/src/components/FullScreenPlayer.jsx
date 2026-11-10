import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const MOOD_FILTERS = ['All', 'Familiar', 'Discover', 'Romance', 'Downbeat', 'Upbeat'];

export default function FullScreenPlayer() {
  const {
    currentSong,
    playback,
    isFullScreen,
    setIsFullScreen,
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
    queue,
    setQueue,
    playSong,
    removeFromQueue,
    isAudioOnly,
    toggleAudioOnly,
    lyricsState,
    fetchLyrics,
    openAddToPlaylistModal,
    autoplay,
    toggleAutoplay,
    activeMood,
    setActiveMood,
    generateRadioQueue,
    isRadioLoading,
    playingFrom,
    createPlaylist,
    addSongToPlaylist,
    setActiveTab: setAppActiveTab,
    setSearchQuery
  } = usePlayer();

  const [activeTab, setActiveTab] = useState('upnext'); // 'upnext' | 'lyrics' | 'related'
  const [autoScroll, setAutoScroll] = useState(true);
  const [isMixSaved, setIsMixSaved] = useState(false);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubProgress, setScrubProgress] = useState(null);

  const volumeTrackRef = useRef(null);
  const scrubberTrackRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);

  // Hold & drag to adjust volume
  const updateVolumeFromEvent = (e) => {
    if (!volumeTrackRef.current) return;
    const rect = volumeTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newVol = Math.round(ratio * 100);
    setVolume(newVol);
    if (isMuted && newVol > 0) setIsMuted(false);
  };

  const handleVolumePointerDown = (e) => {
    e.preventDefault();
    setIsVolumeDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateVolumeFromEvent(e);
  };

  const handleVolumePointerMove = (e) => {
    if (isVolumeDragging) {
      updateVolumeFromEvent(e);
    }
  };

  const handleVolumePointerUp = (e) => {
    if (isVolumeDragging) {
      setIsVolumeDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Hold & drag to scrub progress
  const updateScrubFromEvent = (e, commit = false) => {
    if (!scrubberTrackRef.current || !playback.duration) return;
    const rect = scrubberTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = ratio * playback.duration;
    if (commit) {
      seekTo(targetTime);
      setScrubProgress(null);
    } else {
      setScrubProgress(targetTime);
    }
  };

  const handleScrubPointerDown = (e) => {
    e.preventDefault();
    setIsScrubbing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateScrubFromEvent(e, false);
  };

  const handleScrubPointerMove = (e) => {
    if (isScrubbing) {
      updateScrubFromEvent(e, false);
    }
  };

  const handleScrubPointerUp = (e) => {
    if (isScrubbing) {
      updateScrubFromEvent(e, true);
      setIsScrubbing(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  // Auto-fetch lyrics when song changes
  useEffect(() => {
    if (isFullScreen && currentSong) {
      fetchLyrics(currentSong);
    }
  }, [isFullScreen, currentSong?.videoId]);

  // Auto-scroll lyrics smoothly to active line
  useEffect(() => {
    if (autoScroll && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [lyricsState?.lines, lyricsState?.syncedLines, playback.currentTime, autoScroll]);

  // Save current mix to playlist
  const handleSaveMix = () => {
    const mixName = playingFrom?.name || `${currentSong?.title || 'Current'} Mix`;
    const newPl = createPlaylist(mixName);
    if (newPl && newPl.id) {
      if (currentSong) addSongToPlaylist(newPl.id, currentSong);
      if (queue && queue.length > 0) {
        queue.forEach((s) => addSongToPlaylist(newPl.id, s));
      }
      setIsMixSaved(true);
      setTimeout(() => setIsMixSaved(false), 3000);
    }
  };

  // Play a track from the Up Next queue
  const handlePlayFromQueue = (song, idx) => {
    setQueue((prev) => prev.filter((_, i) => i !== idx));
    playSong(song, true, { preserveQueue: true });
  };

  // Handle mood filter click
  const handleMoodSelect = (mood) => {
    setActiveMood(mood);
    if (currentSong) {
      generateRadioQueue(currentSong, mood);
    }
  };

  if (!isFullScreen || !currentSong) return null;

  const liked = isLiked(currentSong.videoId);
  const currentDisplayTime = isScrubbing && scrubProgress !== null ? scrubProgress : playback.currentTime;
  const currentProgressPercent = playback.duration > 0
    ? Math.min(100, Math.max(0, (currentDisplayTime / playback.duration) * 100))
    : 0;

  // Find active line in synced lyrics
  const syncedLines = lyricsState?.lines || lyricsState?.syncedLines || [];
  const currentSec = playback.currentTime || 0;
  let activeIndex = -1;
  for (let i = syncedLines.length - 1; i >= 0; i--) {
    if (currentSec >= syncedLines[i].time) {
      activeIndex = i;
      break;
    }
  }

  const currentMixTitle = playingFrom?.name || `${currentSong.title} Mix`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0c]/98 backdrop-blur-3xl flex flex-col overflow-y-auto select-none p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* 1. Top Breadcrumb & Status Ribbon */}
        <div className="flex items-center justify-between py-2 mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-sm font-medium"
              title="Close Player"
            >
              <span className="material-symbols-outlined text-xl">expand_more</span>
              <span className="hidden sm:inline">Close</span>
            </button>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-white/60">
              Now Playing
            </span>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs text-white/40 truncate max-w-xs">
              {currentSong.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                Lossless 24-bit • 96kHz
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* 2. Primary 2-Column Split: YouTube Music Player Left & Up Next Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start flex-1 min-h-0">

          {/* LEFT COLUMN: Track Identity, Sleeve & Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-[#121316] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xl border border-white/10">
              
              {/* YouTube Music Song / Video Mode Toggle Pill */}
              <div className="flex items-center justify-center p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 max-w-fit mx-auto shadow-lg select-none">
                <button
                  type="button"
                  onClick={() => !isAudioOnly && toggleAudioOnly()}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isAudioOnly
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="Switch to Song (Audio) Mode"
                >
                  <span className="material-symbols-outlined text-sm">music_note</span>
                  <span>Song</span>
                </button>
                <button
                  type="button"
                  onClick={() => isAudioOnly && toggleAudioOnly()}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    !isAudioOnly
                      ? 'bg-white text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                  title="Switch to Music Video Mode"
                >
                  <span className="material-symbols-outlined text-sm">smart_display</span>
                  <span>Video</span>
                </button>
              </div>

              {/* Artwork Sleeve or Video Viewport Slot */}
              <div
                id="fullscreen-media-slot"
                className="relative w-full aspect-square rounded-xl overflow-hidden bg-black shadow-2xl border border-white/5 group"
              >
                <img
                  src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105 ${
                    !isAudioOnly ? 'opacity-0' : 'opacity-100'
                  }`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';
                  }}
                />
                {isAudioOnly && (
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white/90">
                      Stereo
                    </span>
                    <span className="bg-sky-500/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white font-bold">
                      Master
                    </span>
                  </div>
                )}
              </div>

              {/* Metadata & Actions */}
              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex flex-col min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate" title={currentSong.title}>
                    {currentSong.title}
                  </h1>
                  <p className="text-sm sm:text-base text-white/70 truncate mt-0.5 font-medium">
                    {currentSong.channelTitle || currentSong.artist || 'Artist'}
                  </p>
                  <p className="text-xs text-white/40 mt-1 truncate">
                    Hi-Fi Stream • Studio Master
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleLike(currentSong)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-primary transition-all active:scale-95"
                    title={liked ? "Saved to Liked Songs" : "Like track"}
                  >
                    <span 
                      className="material-symbols-outlined text-xl" 
                      style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {liked ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAddToPlaylistModal(currentSong)}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95"
                    title="Add to Playlist"
                  >
                    <span className="material-symbols-outlined text-xl">playlist_add</span>
                  </button>
                </div>
              </div>

              {/* Scrubber & Timing */}
              <div className="flex flex-col gap-1.5 pt-1 select-none">
                <div 
                  ref={scrubberTrackRef}
                  onPointerDown={handleScrubPointerDown}
                  onPointerMove={handleScrubPointerMove}
                  onPointerUp={handleScrubPointerUp}
                  onPointerCancel={handleScrubPointerUp}
                  className="relative w-full h-6 flex items-center cursor-pointer group py-1 touch-none"
                  title="Click & drag to scrub"
                >
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-[background-color] ${
                        isScrubbing ? 'bg-sky-400' : 'bg-white group-hover:bg-sky-400'
                      }`}
                      style={{ width: `${currentProgressPercent}%` }} 
                    />
                  </div>
                  {/* Scrubber Knob */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg pointer-events-none transition-transform duration-75 ${
                      isScrubbing ? 'scale-125' : 'group-hover:scale-100 scale-0'
                    }`}
                    style={{ left: `calc(${currentProgressPercent}% - 7px)` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-white/50">
                  <span>{formatTime(currentDisplayTime)}</span>
                  <span>{formatTime(playback.duration)}</span>
                </div>
              </div>

              {/* Primary Playback Controls */}
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  type="button"
                  className="text-white/40 hover:text-white transition-colors p-2 rounded-lg"
                  title="Shuffle"
                >
                  <span className="material-symbols-outlined text-xl">shuffle</span>
                </button>
                <button
                  type="button"
                  onClick={prevSong}
                  className="text-white hover:text-primary transition-colors p-2 rounded-lg active:scale-90"
                  title="Previous"
                >
                  <span className="material-symbols-outlined text-2xl">skip_previous</span>
                </button>
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 active:scale-95 transition-all shadow-xl"
                  title={playback.isPlaying ? "Pause" : "Play"}
                >
                  <span className="material-symbols-outlined text-3xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {playback.isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={nextSong}
                  className="text-white hover:text-primary transition-colors p-2 rounded-lg active:scale-90"
                  title="Next"
                >
                  <span className="material-symbols-outlined text-2xl">skip_next</span>
                </button>
                <button
                  type="button"
                  className="text-white/40 hover:text-white transition-colors p-2 rounded-lg"
                  title="Repeat"
                >
                  <span className="material-symbols-outlined text-xl">repeat</span>
                </button>
              </div>

              {/* Volume & Audio Output */}
              <div className="flex items-center justify-between pt-1 bg-white/[0.03] px-3.5 py-2.5 rounded-xl border border-white/5 select-none">
                <div className="flex items-center gap-2 text-white/70 min-w-0">
                  <span className="material-symbols-outlined text-base text-sky-400">speaker</span>
                  <span className="text-xs truncate text-white/90 font-medium">Studio Lossless Audio</span>
                </div>
                <div className="flex items-center gap-2 w-32 sm:w-36">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white/50 hover:text-white transition-colors p-1"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isMuted || volume === 0 ? 'volume_off' : volume > 50 ? 'volume_up' : 'volume_down'}
                    </span>
                  </button>
                  <div 
                    ref={volumeTrackRef}
                    onPointerDown={handleVolumePointerDown}
                    onPointerMove={handleVolumePointerMove}
                    onPointerUp={handleVolumePointerUp}
                    onPointerCancel={handleVolumePointerUp}
                    className="relative flex-1 h-6 flex items-center cursor-pointer group py-1 touch-none"
                    title={`Volume: ${isMuted ? 0 : volume}% (Click & drag)`}
                  >
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-[background-color] ${
                          isVolumeDragging ? 'bg-sky-400' : 'bg-white/70 group-hover:bg-sky-400'
                        }`}
                        style={{ width: `${isMuted ? 0 : volume}%` }} 
                      />
                    </div>
                    {/* Volume Knob */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md pointer-events-none transition-transform duration-75 ${
                        isVolumeDragging ? 'scale-125' : 'group-hover:scale-100 scale-0'
                      }`}
                      style={{ left: `calc(${isMuted ? 0 : volume}% - 5px)` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: YouTube Music UP NEXT Studio & Lyrics Engine (7 Cols) */}
          <div className="lg:col-span-7 bg-[#121316] rounded-2xl p-5 sm:p-6 flex flex-col shadow-xl min-h-[640px] border border-white/10">
            
            {/* 1. Header Navigation Tabs: UP NEXT | LYRICS | RELATED */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('upnext')}
                  className={`text-sm font-bold tracking-wider uppercase transition-colors relative pb-2 ${
                    activeTab === 'upnext'
                      ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  UP NEXT
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('lyrics')}
                  className={`text-sm font-bold tracking-wider uppercase transition-colors relative pb-2 flex items-center gap-1.5 ${
                    activeTab === 'lyrics'
                      ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">mic</span>
                  <span>LYRICS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('related')}
                  className={`text-sm font-bold tracking-wider uppercase transition-colors relative pb-2 ${
                    activeTab === 'related'
                      ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-white'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  RELATED
                </button>
              </div>

              {/* Right utility buttons depending on active tab */}
              {activeTab === 'lyrics' && (
                <button
                  type="button"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    autoScroll
                      ? 'bg-white text-black shadow-sm'
                      : 'bg-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  Auto-Scroll
                </button>
              )}
            </div>

            {/* TAB CONTENT 1: UP NEXT (YouTube Music Style) */}
            {activeTab === 'upnext' && (
              <div className="flex flex-col flex-1 min-h-0 gap-4">
                
                {/* Playing from mix & Save button */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                      Playing from
                    </span>
                    <h2 className="text-base font-bold text-white truncate" title={currentMixTitle}>
                      {currentMixTitle}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveMix}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 flex-shrink-0 ${
                      isMixSaved
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                    }`}
                    title="Save this mix to your playlists"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isMixSaved ? 'check' : 'playlist_add'}
                    </span>
                    <span>{isMixSaved ? 'Saved' : '+ Save'}</span>
                  </button>
                </div>

                {/* Autoplay Toggle Row */}
                <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Autoplay</span>
                    <span className="text-xs text-white/50">
                      Add similar content to the end of the queue
                    </span>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoplay}
                    onClick={toggleAutoplay}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                      autoplay ? 'bg-sky-500' : 'bg-white/20'
                    }`}
                    title={`Autoplay is ${autoplay ? 'ON' : 'OFF'}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        autoplay ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Currently Playing Card */}
                <div className="bg-[#1a1b1f] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
                      {playback.isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4 w-4">
                          <span className="w-1 bg-sky-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-3" />
                          <span className="w-1 bg-sky-400 rounded-full animate-[bounce_0.8s_infinite_300ms] h-4" />
                          <span className="w-1 bg-sky-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-2.5" />
                        </div>
                      ) : (
                        <span className="material-symbols-outlined text-lg">play_arrow</span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate">
                        {currentSong.title}
                      </span>
                      <span className="text-xs text-white/60 truncate">
                        {currentSong.channelTitle || currentSong.artist || 'Artist'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-white/40 flex-shrink-0">
                    {formatTime(playback.duration || currentSong.duration || 180)}
                  </span>
                </div>

                {/* Autoplay Status & Mood Filter Chips */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>{autoplay ? 'Autoplay is on' : 'Autoplay is off'}</span>
                    {isRadioLoading && (
                      <span className="text-sky-400 flex items-center gap-1 font-medium animate-pulse">
                        <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                        Finding similar vibes...
                      </span>
                    )}
                  </div>

                  {/* Horizontal Scrollable Mood Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {MOOD_FILTERS.map((mood) => {
                      const isSelected = (activeMood || 'All').toLowerCase() === mood.toLowerCase();
                      return (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => handleMoodSelect(mood)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                            isSelected
                              ? 'bg-white text-black shadow-md'
                              : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
                          }`}
                        >
                          {mood}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Up Next Tracks List */}
                <div className="flex-1 overflow-y-auto max-h-[380px] flex flex-col gap-1.5 pr-1 no-scrollbar">
                  {isRadioLoading && queue.length === 0 ? (
                    <div className="flex flex-col gap-2 py-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] animate-pulse">
                          <div className="w-11 h-11 rounded-lg bg-white/10 flex-shrink-0" />
                          <div className="flex-1 flex flex-col gap-1.5">
                            <div className="w-3/4 h-3 rounded bg-white/10" />
                            <div className="w-1/2 h-2.5 rounded bg-white/5" />
                          </div>
                          <div className="w-8 h-3 rounded bg-white/5" />
                        </div>
                      ))}
                    </div>
                  ) : queue && queue.length > 0 ? (
                    queue.map((song, idx) => (
                      <div
                        key={song.videoId || idx}
                        onClick={() => handlePlayFromQueue(song, idx)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] transition-all group cursor-pointer border border-transparent hover:border-white/5"
                        title={`Play ${song.title}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail with hover play overlay */}
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
                            <img
                              src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="material-symbols-outlined text-white text-lg">play_arrow</span>
                            </div>
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-white/90 truncate group-hover:text-sky-300 transition-colors">
                              {song.title}
                            </span>
                            <span className="text-xs text-white/50 truncate">
                              {song.channelTitle || song.artist || 'Artist'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span className="text-xs font-mono text-white/40">
                            {formatTime(song.duration || 215)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromQueue(idx);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-opacity"
                            title="Remove from Up Next"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-white/40 gap-3">
                      <span className="material-symbols-outlined text-4xl text-white/20">queue_music</span>
                      <p className="text-sm font-semibold text-white/70">No tracks in Up Next</p>
                      <p className="text-xs max-w-xs">
                        Turn on Autoplay or choose a mood filter above to generate recommendations matching this song.
                      </p>
                      <button
                        type="button"
                        onClick={() => generateRadioQueue(currentSong, activeMood)}
                        className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all mt-1"
                      >
                        Generate Up Next Mix
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: LYRICS (Synchronized Vocal Engine) */}
            {activeTab === 'lyrics' && (
              <div 
                ref={lyricsContainerRef}
                className="flex-1 overflow-y-auto max-h-[500px] flex flex-col gap-5 py-3 select-text no-scrollbar pr-2"
              >
                {lyricsState?.loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-white/40">
                    <span className="material-symbols-outlined text-4xl animate-spin text-sky-400">sync</span>
                    <span className="text-sm font-medium">Matching high-precision synchronized lyrics...</span>
                  </div>
                ) : syncedLines && syncedLines.length > 0 ? (
                  syncedLines.map((line, idx) => {
                    const isActive = idx === activeIndex;
                    const isPast = idx < activeIndex;

                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeLyricRef : null}
                        onClick={() => seekTo(line.time)}
                        className={`transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'my-1 py-3 px-4 bg-white/10 rounded-xl flex items-center justify-between shadow-lg border border-sky-400/30'
                            : isPast
                            ? 'text-white/30 hover:text-white/60 text-lg font-medium'
                            : 'text-white/70 hover:text-white text-lg font-medium'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] uppercase tracking-widest text-sky-400 font-bold">
                                Current Vocal
                              </span>
                              <p className="text-xl sm:text-2xl text-white font-bold leading-snug">
                                {line.text}
                              </p>
                            </div>
                            <span className="material-symbols-outlined text-sky-400 text-xl flex-shrink-0 ml-3 animate-pulse">
                              graphic_eq
                            </span>
                          </>
                        ) : (
                          <p className="leading-relaxed">{line.text}</p>
                        )}
                      </div>
                    );
                  })
                ) : lyricsState?.plainLyrics ? (
                  <div className="whitespace-pre-line text-lg leading-relaxed text-white/80 py-6">
                    {lyricsState.plainLyrics}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 py-24 text-white/40 text-center">
                    <span className="material-symbols-outlined text-5xl text-white/20 mb-1">music_note</span>
                    <p className="text-base text-white/80 font-semibold">Instrumental / No synced lyrics available</p>
                    <p className="text-xs text-white/40">Enjoy the studio lossless audio stream</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: RELATED */}
            {activeTab === 'related' && (
              <div className="flex-1 overflow-y-auto max-h-[500px] flex flex-col gap-5 py-3 no-scrollbar">
                
                {/* Artist Profile Card */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {(currentSong.channelTitle || currentSong.artist || 'A')[0]}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                        Artist Profile
                      </span>
                      <h3 className="text-base font-bold text-white truncate">
                        {currentSong.channelTitle || currentSong.artist}
                      </h3>
                      <p className="text-xs text-emerald-400 mt-0.5">Verified Music Artist</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (setAppActiveTab) setAppActiveTab('search');
                      if (setSearchQuery) setSearchQuery(currentSong.channelTitle || currentSong.artist || '');
                      setIsFullScreen(false);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
                  >
                    Explore Artist
                  </button>
                </div>

                {/* Vibe Clusters */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Recommended Soundtracks &amp; Vibes
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Indie Hindi Chill', 'Bollywood Melodies', 'Late Night Lo-Fi', 'Upbeat Dance Hits'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setActiveTab('upnext');
                          generateRadioQueue(currentSong, tag);
                        }}
                        className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-left border border-white/5 transition-colors group"
                      >
                        <span className="text-xs font-semibold text-white/80 group-hover:text-white block">
                          {tag}
                        </span>
                        <span className="text-[11px] text-white/40 mt-0.5 block">
                          Tap to auto-generate mix
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stream Specs */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Audio Quality Specifications
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div>
                      <span className="text-white/40 block">Codec</span>
                      <span className="text-white font-mono font-medium">Opus / AAC 256k</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Sampling</span>
                      <span className="text-white font-mono font-medium">96.0 kHz Master</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Bit Depth</span>
                      <span className="text-white font-mono font-medium">24-Bit Studio</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Panel Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>{activeTab === 'lyrics' ? 'LRCLIB Synced Engine' : 'YouTube Music Studio Engine'}</span>
              <span>100% Real-Time Vibe Matched</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
