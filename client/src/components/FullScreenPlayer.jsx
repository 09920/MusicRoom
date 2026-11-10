import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

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
    playSong,
    lyricsState,
    fetchLyrics,
    openAddToPlaylistModal
  } = usePlayer();

  const [activeTab, setActiveTab] = useState('lyrics'); // 'lyrics' | 'queue'
  const [autoScroll, setAutoScroll] = useState(true);
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
  }, [lyricsState?.syncedLines, playback.currentTime, autoScroll]);

  if (!isFullScreen || !currentSong) return null;

  const liked = isLiked(currentSong.videoId);
  const currentDisplayTime = isScrubbing && scrubProgress !== null ? scrubProgress : playback.currentTime;
  const currentProgressPercent = playback.duration > 0
    ? Math.min(100, Math.max(0, (currentDisplayTime / playback.duration) * 100))
    : 0;

  // Find active line in synced lyrics
  const syncedLines = lyricsState?.syncedLines || [];
  const currentSec = playback.currentTime || 0;
  let activeIndex = -1;
  for (let i = syncedLines.length - 1; i >= 0; i--) {
    if (currentSec >= syncedLines[i].time) {
      activeIndex = i;
      break;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface/95 backdrop-blur-2xl flex flex-col overflow-y-auto select-none p-gutter sm:p-gutter-lg animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">

        {/* 1. Top Breadcrumb & Status Ribbon */}
        <div className="flex items-center justify-between py-space-sm mb-space-md border-b border-surface-container-high/60 pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1 font-title text-title-sm"
              title="Close Player"
            >
              <span className="material-symbols-outlined text-title-md">expand_more</span>
              <span className="hidden sm:inline">Close</span>
            </button>
            <span className="text-outline text-label-sm font-label-sm">/</span>
            <span className="text-label-sm font-label-sm text-outline uppercase tracking-wider font-semibold">
              Now Playing
            </span>
            <span className="text-outline text-label-sm font-label-sm">/</span>
            <span className="text-body-sm font-body text-on-surface-variant truncate max-w-xs">
              {currentSong.title}
            </span>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-1 rounded-full border border-surface-container-high/60">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-label-sm font-metric-mono text-secondary uppercase font-semibold">
                Lossless 24-bit • 96kHz
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              title="Close"
            >
              <span className="material-symbols-outlined text-title-md">close</span>
            </button>
          </div>
        </div>

        {/* 2. Primary 2-Column Split: Player Viewport & Lyrics Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start flex-1 min-h-0">

          {/* LEFT COLUMN: Track Hero, Controls & Queue (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            
            {/* Main Track Identity Card */}
            <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md shadow-sm border border-surface-container-high/40">
              
              {/* Album Artwork Sleeve */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container shadow-md">
                <img
                  src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                  alt={currentSong.title}
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80';
                  }}
                />
                <div className="absolute top-space-md right-space-md flex gap-space-xs">
                  <span className="bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-0.5 rounded text-label-sm font-metric-mono text-on-surface">
                    Stereo
                  </span>
                  <span className="bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-0.5 rounded text-label-sm font-metric-mono text-primary font-bold">
                    Master
                  </span>
                </div>
              </div>

              {/* Metadata & Actions */}
              <div className="flex items-start justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col min-w-0">
                  <h1 className="text-headline-md font-headline text-on-surface font-bold tracking-tight truncate">
                    {currentSong.title}
                  </h1>
                  <p className="text-title-md font-title text-on-surface-variant truncate mt-0.5 font-medium">
                    {currentSong.channelTitle || currentSong.artist || 'Artist'}
                  </p>
                  <p className="text-body-sm font-body text-outline mt-1 truncate">
                    Hi-Fi Stream • Studio Master
                  </p>
                </div>

                <div className="flex items-center gap-space-xs flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleLike(currentSong)}
                    className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors"
                    title={liked ? "Saved to Liked Songs" : "Like track"}
                  >
                    <span 
                      className="material-symbols-outlined text-title-md" 
                      style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {liked ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAddToPlaylistModal(currentSong)}
                    className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Add to Playlist"
                  >
                    <span className="material-symbols-outlined text-title-md">playlist_add</span>
                  </button>
                </div>
              </div>

              {/* Scrubber & Timing */}
              <div className="flex flex-col gap-1.5 pt-space-xs select-none">
                <div 
                  ref={scrubberTrackRef}
                  onPointerDown={handleScrubPointerDown}
                  onPointerMove={handleScrubPointerMove}
                  onPointerUp={handleScrubPointerUp}
                  onPointerCancel={handleScrubPointerUp}
                  className="relative w-full h-6 flex items-center cursor-pointer group py-1 touch-none"
                  title="Click & drag to scrub"
                >
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-[background-color] ${
                        isScrubbing ? 'bg-primary-container' : 'bg-primary group-hover:bg-primary-container'
                      }`}
                      style={{ width: `${currentProgressPercent}%` }} 
                    />
                  </div>
                  {/* Scrubber Knob */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md pointer-events-none transition-transform duration-75 ${
                      isScrubbing ? 'scale-125' : 'group-hover:scale-100 scale-0'
                    }`}
                    style={{ left: `calc(${currentProgressPercent}% - 7px)` }}
                  />
                </div>
                <div className="flex justify-between items-center text-metric-mono font-metric-mono text-outline">
                  <span>{formatTime(currentDisplayTime)}</span>
                  <span>{formatTime(playback.duration)}</span>
                </div>
              </div>

              {/* Primary Playback Controls */}
              <div className="flex items-center justify-between px-space-md py-space-xs">
                <button
                  type="button"
                  className="text-outline hover:text-on-surface transition-colors p-2 rounded-lg"
                  title="Shuffle"
                >
                  <span className="material-symbols-outlined text-title-md">shuffle</span>
                </button>
                <button
                  type="button"
                  onClick={prevSong}
                  className="text-on-surface hover:text-primary transition-colors p-2 rounded-lg"
                  title="Previous"
                >
                  <span className="material-symbols-outlined text-headline-sm">skip_previous</span>
                </button>
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="w-14 h-14 rounded-full bg-on-surface text-surface flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md"
                  title={playback.isPlaying ? "Pause" : "Play"}
                >
                  <span className="material-symbols-outlined text-headline-md font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {playback.isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={nextSong}
                  className="text-on-surface hover:text-primary transition-colors p-2 rounded-lg"
                  title="Next"
                >
                  <span className="material-symbols-outlined text-headline-sm">skip_next</span>
                </button>
                <button
                  type="button"
                  className="text-outline hover:text-on-surface transition-colors p-2 rounded-lg"
                  title="Repeat"
                >
                  <span className="material-symbols-outlined text-title-md">repeat</span>
                </button>
              </div>

              {/* Volume & Audio Output */}
              <div className="flex items-center justify-between pt-space-sm bg-surface-container/50 px-space-md py-space-sm rounded-lg border border-surface-container-high/40 select-none">
                <div className="flex items-center gap-space-xs text-on-surface-variant min-w-0">
                  <span className="material-symbols-outlined text-title-sm text-secondary">speaker</span>
                  <span className="text-body-sm font-body truncate text-on-surface">Studio Lossless Audio</span>
                </div>
                <div className="flex items-center gap-space-xs w-36">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-outline hover:text-on-surface transition-colors p-1"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    <span className="material-symbols-outlined text-title-sm">
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
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-[background-color] ${
                          isVolumeDragging ? 'bg-primary' : 'bg-on-surface-variant group-hover:bg-primary'
                        }`}
                        style={{ width: `${isMuted ? 0 : volume}%` }} 
                      />
                    </div>
                    {/* Volume Knob */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md pointer-events-none transition-transform duration-75 ${
                        isVolumeDragging ? 'scale-125' : 'group-hover:scale-100 scale-0'
                      }`}
                      style={{ left: `calc(${isMuted ? 0 : volume}% - 6px)` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Up Next Mini Queue */}
            {queue && queue.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-space-lg flex flex-col gap-space-md shadow-sm border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-title-sm text-outline">queue_music</span>
                    <h2 className="text-title-sm font-title text-on-surface font-semibold">
                      Up Next in Queue ({queue.length})
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs max-h-56 overflow-y-auto pr-1">
                  {queue.slice(0, 4).map((song, idx) => (
                    <div
                      key={song.videoId || idx}
                      onClick={() => playSong(song, true)}
                      className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-space-md min-w-0">
                        <span className="text-metric-mono font-metric-mono text-outline w-4 text-center">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded bg-surface-container flex-shrink-0 overflow-hidden">
                          <img
                            src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80';
                            }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-body-sm font-body font-semibold text-on-surface truncate">
                            {song.title}
                          </span>
                          <span className="text-label-sm font-label-sm text-on-surface-variant truncate">
                            {song.channelTitle || song.artist || 'Artist'}
                          </span>
                        </div>
                      </div>
                      <span className="text-metric-mono font-metric-mono text-outline text-body-sm">
                        3:45
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Synchronized Lyrics Studio Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-space-xl flex flex-col justify-between shadow-sm min-h-[640px] border border-surface-container-high/40">
            
            {/* Lyrics Header & Mode Controls */}
            <div className="flex items-center justify-between pb-space-lg mb-space-md border-b border-surface-container-high/60">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-title-lg text-primary">mic</span>
                <h2 className="text-title-lg font-headline text-on-surface font-bold">
                  Synchronized Lyrics
                </h2>
              </div>

              <div className="flex items-center gap-space-xs bg-surface-container p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`px-space-md py-1 rounded text-label-sm font-label-sm font-semibold transition-all ${
                    autoScroll
                      ? 'bg-surface-container-high text-on-surface shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Auto-Scroll
                </button>
              </div>
            </div>

            {/* Synchronized Flow Container */}
            <div 
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto max-h-[500px] flex flex-col gap-space-lg py-space-md select-text no-scrollbar pr-2"
            >
              {lyricsState?.isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-24 text-outline">
                  <span className="material-symbols-outlined text-headline-lg animate-spin text-primary">sync</span>
                  <span className="font-body text-body-md">Matching high-precision synchronized lyrics...</span>
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
                          ? 'my-space-sm py-space-md px-space-lg bg-surface-container rounded-xl flex items-center justify-between shadow-sm border border-primary/20'
                          : isPast
                          ? 'text-on-surface-variant/40 hover:text-on-surface-variant text-title-lg font-medium'
                          : 'text-on-surface-variant/70 hover:text-on-surface text-title-lg font-medium'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <div className="flex flex-col gap-1">
                            <span className="text-label-sm font-label-sm uppercase tracking-widest text-primary font-bold">
                              Current Vocal
                            </span>
                            <p className="text-headline-md font-headline text-on-surface font-bold leading-snug">
                              {line.text}
                            </p>
                          </div>
                          <span className="material-symbols-outlined text-primary text-title-lg flex-shrink-0 ml-space-md animate-pulse">
                            graphic_eq
                          </span>
                        </>
                      ) : (
                        <p className="leading-relaxed font-headline">{line.text}</p>
                      )}
                    </div>
                  );
                })
              ) : lyricsState?.plainLyrics ? (
                <div className="whitespace-pre-line text-title-lg font-headline leading-relaxed text-on-surface-variant/80 py-8">
                  {lyricsState.plainLyrics}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-24 text-outline text-center">
                  <span className="material-symbols-outlined text-display text-outline mb-2">music_note</span>
                  <p className="font-headline text-title-md text-on-surface font-semibold">Instrumental / No synced lyrics available</p>
                  <p className="font-body text-body-sm text-outline">Enjoy the studio lossless audio stream</p>
                </div>
              )}
            </div>

            {/* Bottom Credit */}
            <div className="pt-space-md border-t border-surface-container-high/40 flex items-center justify-between text-label-sm text-outline">
              <span>LRCLIB &amp; MusicRoom Synced Engine</span>
              <span>100% Timing Accurate</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
