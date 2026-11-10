import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Lock,
  Heart,
  Share2
} from 'lucide-react';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function Controls({
  playback,
  currentSong,
  canControl,
  hostMode,
  isHost,
  onPlayPause,
  onSeek,
  onSkip,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  autoMode,
  onToggleAutoMode,
  playerRef
}) {
  const [currentProgress, setCurrentProgress] = useState(playback?.currentTime || 0);
  const [duration, setDuration] = useState(currentSong?.duration || 200);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isPlayingState, setIsPlayingState] = useState(Boolean(playback?.isPlaying));
  const [likeCount, setLikeCount] = useState(328);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    setIsPlayingState(Boolean(playback?.isPlaying));
  }, [playback?.isPlaying]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (playerRef?.current && !isScrubbing) {
        try {
          if (typeof playerRef.current.getCurrentTime === 'function') {
            const time = playerRef.current.getCurrentTime();
            setCurrentProgress(time || 0);
          }
          if (typeof playerRef.current.getDuration === 'function') {
            const dur = playerRef.current.getDuration();
            if (dur > 0) setDuration(dur);
          }
        } catch (e) {}
      }
    }, 200);
    return () => clearInterval(timer);
  }, [playerRef, isScrubbing]);

  const handleScrubberChange = (e) => {
    setIsScrubbing(true);
    setCurrentProgress(parseFloat(e.target.value));
  };

  const handleScrubberCommit = (e) => {
    const newTime = parseFloat(e.target.value);
    setIsScrubbing(false);
    if (canControl) {
      onSeek(newTime);
    }
  };

  const handleToggleLike = () => {
    setHasLiked(prev => !prev);
    setLikeCount(prev => hasLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentProgress / duration) * 100)) : 0;

  return (
    <div className="flex flex-col space-y-3 w-full">
      
      {/* Strict DJ Mode Warning */}
      {!canControl && (
        <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-surface-container-high/80 text-on-surface-variant text-xs border border-outline-variant/20">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>Host-Only DJ Mode active. Only host can alter playback.</span>
        </div>
      )}

      {/* Track Meta, DJ Attribution & Reaction Section (Stitch 2_player.html) */}
      <div className="flex items-start justify-between gap-space-sm bg-surface-container/60 backdrop-blur-xl p-space-md rounded-2xl shadow-md border border-outline-variant/15">
        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface truncate tracking-tight">
              {currentSong?.title || "No Song Selected"}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-label-sm text-[10px] font-bold border border-primary/25 shrink-0">
              1080p
            </span>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant truncate">
            {currentSong?.channelTitle || currentSong?.artist || "Import a playlist to begin"}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-0.5 rounded-full border border-outline-variant/20">
              <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
              <span className="font-label-sm text-label-sm text-on-surface font-medium">
                Added by <strong className="text-secondary font-semibold">@{currentSong?.addedBy || 'DJ'}</strong>
              </span>
              <span className="px-1 py-0.2 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[9px] uppercase tracking-wider font-extrabold ml-1">
                DJ
              </span>
            </div>
          </div>
        </div>

        {/* Social Reaction Buttons */}
        <div className="flex items-center gap-2 shrink-0 pt-1">
          <button
            onClick={handleToggleLike}
            className={`flex flex-col items-center justify-center w-11 h-11 rounded-full border transition-all active:scale-90 shadow-md ${
              hasLiked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-surface-container-high/90 text-on-surface hover:text-rose-400 border-outline-variant/20'
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform duration-200 ${hasLiked ? 'fill-rose-400 scale-110' : ''}`} />
            <span className="font-label-sm text-[10px] font-bold leading-none mt-0.5">
              {likeCount}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-surface-container-high/90 text-on-surface-variant hover:text-primary active:scale-90 flex items-center justify-center transition-all shadow-md border border-outline-variant/20"
            title="Share Room Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Synchronized Audio Scrubber & Progress (Stitch 2_player.html) */}
      <div className="bg-surface-container/70 backdrop-blur-xl p-space-md rounded-2xl shadow-md flex flex-col space-y-2 border border-outline-variant/15">
        <div className="relative w-full flex items-center py-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentProgress}
            onChange={handleScrubberChange}
            onMouseUp={handleScrubberCommit}
            onTouchEnd={handleScrubberCommit}
            disabled={!canControl || !currentSong}
            className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-40"
            style={{
              background: `linear-gradient(to right, #d0bcff 0%, #4cd7f6 ${progressPercent}%, #343439 ${progressPercent}%, #343439 100%)`
            }}
          />
        </div>

        {/* Timestamp Row */}
        <div className="flex items-center justify-between font-label-md text-label-md text-on-surface-variant">
          <span className="font-semibold text-secondary">
            {formatTime(currentProgress)}
          </span>

          <div className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary">
            <span className="material-symbols-outlined text-[13px]">sync_saved_locally</span>
            <span>Clock locked</span>
          </div>

          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Control Cockpit (Stitch 2_player.html) */}
      <div className="bg-surface-container-high/80 backdrop-blur-2xl p-space-md rounded-2xl shadow-xl flex flex-col space-y-space-md border border-outline-variant/15">
        
        {/* Main Transport Row */}
        <div className="flex items-center justify-between px-space-xs">
          
          {/* Quick Rewind */}
          <button
            onClick={() => {
              if (canControl && onSeek) onSeek(Math.max(0, currentProgress - 10));
            }}
            disabled={!canControl || !currentSong}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors active:scale-90 disabled:opacity-30"
            title="Rewind 10s"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={() => {
              if (canControl && onSeek) onSeek(0);
            }}
            disabled={!canControl || !currentSong}
            className="w-11 h-11 rounded-full bg-surface-container/80 flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-90 shadow-sm border border-outline-variant/20 disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[24px]">skip_previous</span>
          </button>

          {/* Dominant Glowing Violet Play/Pause Button with Pulsing Ripple Aura */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-2 rounded-full bg-primary/20 blur-md animate-pulse" />
            <button
              onClick={onPlayPause}
              disabled={!canControl || !currentSong}
              className="relative w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_28px_rgba(160,120,255,0.65)] hover:shadow-[0_0_36px_rgba(160,120,255,0.85)] active:scale-95 transition-all transform disabled:opacity-30"
              title={isPlayingState ? "Pause Stream" : "Play Stream"}
            >
              {isPlayingState ? (
                <Pause className="w-8 h-8 fill-on-primary-container" />
              ) : (
                <Play className="w-8 h-8 fill-on-primary-container ml-1" />
              )}
            </button>
          </div>

          {/* Next */}
          <button
            onClick={onSkip}
            disabled={!canControl || !currentSong}
            className="w-11 h-11 rounded-full bg-surface-container/80 flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-90 shadow-sm border border-outline-variant/20 disabled:opacity-30"
            title="Skip to Next Track"
          >
            <span className="material-symbols-outlined text-[24px]">skip_next</span>
          </button>

          {/* Auto-Play Radio Mode Active Indicator */}
          <button
            onClick={() => onToggleAutoMode?.()}
            disabled={!canControl}
            className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-colors active:scale-90 ${
              autoMode ? 'text-secondary shadow-[0_0_8px_rgba(76,215,246,0.3)]' : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title={autoMode ? "YouTube Infinite Radio ON" : "Turn Infinite Radio ON"}
          >
            <span className="material-symbols-outlined text-[22px]">all_inclusive</span>
            {autoMode && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_#4cd7f6] animate-pulse" />
            )}
          </button>

        </div>

        {/* Volume & Equalizer Slider Bar */}
        <div className="flex items-center gap-space-sm pt-1 px-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-on-surface-variant hover:text-on-surface active:scale-90 transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-error" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseInt(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
          />

          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold w-9 text-right font-mono">
            {isMuted ? '0%' : `${volume}%`}
          </span>
        </div>

      </div>

    </div>
  );
}
