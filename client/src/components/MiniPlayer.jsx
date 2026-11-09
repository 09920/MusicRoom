import React from 'react';
import { Play, Pause, SkipForward, Heart, Music2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const {
    currentSong,
    playback,
    togglePlayPause,
    nextSong,
    isLiked,
    toggleLike,
    setIsFullScreen
  } = usePlayer();

  if (!currentSong) return null;

  const progressPercent = playback.duration > 0
    ? Math.min(100, Math.max(0, (playback.currentTime / playback.duration) * 100))
    : 0;

  const liked = isLiked(currentSong.videoId);

  return (
    <div className="px-3 pb-2 select-none">
      <div
        onClick={() => setIsFullScreen(true)}
        className="w-full liquid-glass-strong rounded-2xl p-2.5 shadow-2xl cursor-pointer transition-all active:scale-[0.99] group flex flex-col justify-between border border-white/10 hover:border-violet-500/30"
      >
        {/* Main Content Row: [Cover] Title · Artist  [❤] [⏯] [⏭] */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Artwork + Title & Artist */}
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
            <div className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black/60 shadow-md border border-white/10 ${playback.isPlaying ? 'ring-2 ring-violet-500/40 shadow-glow-purple' : ''}`}>
              <img
                src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              {playback.isPlaying && (
                <div className="absolute inset-0 bg-violet-950/20 mix-blend-overlay" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight group-hover:text-violet-300 transition-colors font-heading">
                  {currentSong.title}
                </h4>
                {playback.isPlaying && (
                  <span className="flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded bg-violet-500/20 border border-violet-500/30">
                    <span className="w-0.5 h-2 bg-violet-400 rounded-full animate-eq-1" />
                    <span className="w-0.5 h-3 bg-violet-400 rounded-full animate-eq-2" />
                    <span className="w-0.5 h-1.5 bg-violet-400 rounded-full animate-eq-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50 truncate font-medium mt-0.5">
                {currentSong.channelTitle || 'YouTube Music'}
              </p>
            </div>
          </div>

          {/* Right Actions: [❤] [⏯] [⏭] */}
          <div 
            className="flex items-center gap-1 shrink-0" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Heart / Like Button */}
            <button
              type="button"
              onClick={() => toggleLike(currentSong)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-white/10"
              title={liked ? "Unlike" : "Like"}
              aria-label="Like song"
            >
              <Heart
                className={`w-4 h-4 transition-all ${
                  liked
                    ? 'fill-rose-500 text-rose-500 scale-110'
                    : 'text-white/60 hover:text-white'
                }`}
              />
            </button>

            {/* Play / Pause Button */}
            <button
              type="button"
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white text-black hover:bg-white/90 active:scale-90 transition-all shadow-md"
              title={playback.isPlaying ? "Pause" : "Play"}
              aria-label={playback.isPlaying ? "Pause" : "Play"}
            >
              {playback.isPlaying ? (
                <Pause className="w-4 h-4 fill-black text-black" />
              ) : (
                <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />
              )}
            </button>

            {/* Next Song Button */}
            <button
              type="button"
              onClick={nextSong}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Next song"
              aria-label="Next song"
            >
              <SkipForward className="w-4 h-4 fill-white text-white" />
            </button>
          </div>

        </div>

        {/* Bottom Progress Line */}
        <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden mt-2.5 relative">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 rounded-full transition-all duration-300 ease-linear shadow-glow-purple"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

      </div>
    </div>
  );
}
