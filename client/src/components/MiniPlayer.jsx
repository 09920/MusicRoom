import React from 'react';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
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
    <div
      onClick={() => setIsFullScreen(true)}
      className="relative w-full liquid-glass-strong border-t border-white/10 px-3.5 py-2.5 flex items-center justify-between cursor-pointer select-none transition-all active:bg-white/5 group shadow-2xl"
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)'
      }}
    >
      {/* Ultra-thin Synchronized Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-pink-500 transition-all duration-300 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Thumbnail & Song Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-lg bg-black/40 border border-white/10">
          <img
            src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
            alt={currentSong.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              playback.isPlaying ? 'scale-105' : 'scale-100 opacity-90'
            }`}
          />
          {playback.isPlaying && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white/90 animate-ping" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white truncate font-body leading-tight group-hover:text-purple-300 transition-colors">
            {currentSong.title}
          </h4>
          <p className="text-[11px] text-white/50 truncate font-body mt-0.5 font-light">
            {currentSong.channelTitle || 'YouTube Music'}
          </p>
        </div>
      </div>

      {/* Right: Actions ([❤] [⏯] [⏭]) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Heart / Like Button */}
        <button
          type="button"
          onClick={() => toggleLike(currentSong)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
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
          className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          title={playback.isPlaying ? "Pause" : "Play"}
          aria-label={playback.isPlaying ? "Pause" : "Play"}
        >
          {playback.isPlaying ? (
            <Pause className="w-4 h-4 fill-black" />
          ) : (
            <Play className="w-4 h-4 fill-black translate-x-0.5" />
          )}
        </button>

        {/* Next Song Button */}
        <button
          type="button"
          onClick={nextSong}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
          title="Next song"
          aria-label="Next song"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
