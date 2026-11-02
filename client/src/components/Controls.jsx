import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Radio, 
  Lock 
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
    }, 500);

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

  const handleSeekDelta = (delta) => {
    if (!canControl) return;
    const newTime = Math.max(0, Math.min(duration, currentProgress + delta));
    onSeek(newTime);
  };

  return (
    <div className="liquid-glass-strong rounded-3xl p-5 sm:p-6 shadow-2xl">
      {/* Single Host notice */}
      {!canControl && (
        <div className="mb-4 flex items-center justify-center gap-2 py-1 px-3 rounded-full liquid-glass text-white/70 text-xs font-body">
          <Lock className="w-3.5 h-3.5 text-white/50" />
          <span>Single Host Mode: Only the room host can pause, seek, or skip songs.</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="relative group">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.5"
            value={currentProgress}
            onChange={handleScrubberChange}
            onMouseUp={handleScrubberCommit}
            onTouchEnd={handleScrubberCommit}
            disabled={!canControl || !currentSong}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer group-hover:h-1.5 transition-all accent-white disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex justify-between text-[11px] text-white/50 font-body px-1">
          <span>{formatTime(currentProgress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Volume & Auto Mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-full liquid-glass text-white/70 hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
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
            className="w-16 sm:w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
          />

          {/* Radio Pill */}
          <button
            onClick={() => onToggleAutoMode && onToggleAutoMode()}
            disabled={!canControl}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all disabled:opacity-50 ${
              autoMode 
                ? 'bg-white text-black font-semibold shadow-sm shadow-white/20' 
                : 'liquid-glass text-white/60 hover:text-white'
            }`}
            title="Auto-picks continuous music"
          >
            <Radio className={`w-3 h-3 ${autoMode ? 'animate-pulse' : ''}`} />
            <span>Radio {autoMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Center: Play / Pause / Seek / Skip */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto sm:mx-0">
          <button
            onClick={() => handleSeekDelta(-10)}
            disabled={!canControl || !currentSong}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Rewind 10s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause Primary Pill */}
          <button
            onClick={onPlayPause}
            disabled={!canControl || !currentSong}
            className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center transition-all shadow-xl shadow-white/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title={playback?.isPlaying ? "Pause for everyone" : "Play for everyone"}
          >
            {playback?.isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => handleSeekDelta(10)}
            disabled={!canControl || !currentSong}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Forward 10s"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onSkip}
            disabled={!canControl || !currentSong}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Skip to next song"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
