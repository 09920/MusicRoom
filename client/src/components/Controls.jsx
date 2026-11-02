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

  // Poll current progress for the smooth scrubber bar
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
        } catch (e) {
          // player might not be ready yet
        }
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
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
      {/* Host mode restriction notice */}
      {!canControl && (
        <div className="mb-4 flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>Single Host Mode: Only the room host can pause, skip, or change songs.</span>
        </div>
      )}

      {/* Scrubber Bar */}
      <div className="space-y-1.5 mb-4">
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
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer group-hover:h-2 transition-all accent-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-400 font-medium px-0.5">
          <span>{formatTime(currentProgress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Volume & Auto Mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
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
            className="w-16 sm:w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          {/* Auto Mode / Radio Toggle */}
          <button
            onClick={() => onToggleAutoMode && onToggleAutoMode()}
            disabled={!canControl}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${
              autoMode 
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-sm shadow-purple-500/20' 
                : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
            }`}
            title="Auto-picks continuous music matching room language"
          >
            <Radio className={`w-3.5 h-3.5 ${autoMode ? 'animate-pulse text-purple-400' : ''}`} />
            <span>Radio {autoMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Center: Play / Pause & Skip Buttons */}
        <div className="flex items-center gap-2 sm:gap-4 mx-auto sm:mx-0">
          <button
            onClick={() => handleSeekDelta(-10)}
            disabled={!canControl || !currentSong}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayPause}
            disabled={!canControl || !currentSong}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all shadow-lg shadow-purple-600/30 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            title={playback?.isPlaying ? "Pause for everyone" : "Play for everyone"}
          >
            {playback?.isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => handleSeekDelta(10)}
            disabled={!canControl || !currentSong}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={onSkip}
            disabled={!canControl || !currentSong}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Skip to next song"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}

