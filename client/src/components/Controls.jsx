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
  const [showRemaining, setShowRemaining] = useState(false);
  const [isPlayingState, setIsPlayingState] = useState(Boolean(playback?.isPlaying));

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

  const handleSeekDelta = (delta) => {
    if (!canControl) return;
    const newTime = Math.max(0, Math.min(duration, currentProgress + delta));
    onSeek(newTime);
  };

  return (
    <div className="liquid-glass-strong rounded-3xl p-4 sm:p-6 shadow-2xl">
      {!canControl && (
        <div className="mb-4 flex items-center justify-center gap-2 py-1 px-3 rounded-full liquid-glass text-white/70 text-xs font-body">
          <Lock className="w-3.5 h-3.5 text-white/50" />
          <span>Only host can control playback in Single Host mode.</span>
        </div>
      )}

      <div className="space-y-1.5 mb-5">
        <div className="relative group py-1">
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
            className="w-full h-1.5 sm:h-1 bg-white/20 rounded-full appearance-none cursor-pointer group-hover:h-2 transition-all accent-white disabled:opacity-40"
          />
        </div>
        <div 
          className="flex justify-between text-[11px] text-white/50 font-mono px-1 cursor-pointer hover:text-white transition-colors"
          onClick={() => setShowRemaining(!showRemaining)}
        >
          <span>{formatTime(currentProgress)}</span>
          <span>{showRemaining ? `-${formatTime(duration - currentProgress)}` : formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex flex-col-reverse xs:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 w-full xs:w-auto justify-between xs:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0" max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setVolume(parseInt(e.target.value)); if (isMuted) setIsMuted(false); }}
              className="w-16 sm:w-20 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>
          <button
            onClick={() => onToggleAutoMode?.()}
            disabled={!canControl}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              autoMode ? 'bg-white text-black font-semibold' : 'liquid-glass text-white/60'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoMode ? 'animate-pulse' : ''}`} />
            <span>Radio</span>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 justify-center">
          <button onClick={() => handleSeekDelta(-10)} disabled={!canControl || !currentSong} className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white active:scale-95 disabled:opacity-30">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onPlayPause}
            disabled={!canControl || !currentSong}
            className="w-14 h-14 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow-xl active:scale-90 disabled:opacity-30"
          >
            {isPlayingState ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
          </button>
          <button onClick={() => handleSeekDelta(10)} disabled={!canControl || !currentSong} className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white active:scale-95 disabled:opacity-30">
            <RotateCw className="w-4 h-4" />
          </button>
          <button onClick={onSkip} disabled={!canControl || !currentSong} className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white active:scale-95 disabled:opacity-30">
            <SkipForward className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
