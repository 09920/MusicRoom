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
    <div className="px-3 pb-2 select-none">
      <div
        onClick={() => setIsFullScreen(true)}
        className="w-full bg-[#13151f]/95 border border-white/[0.08] rounded-2xl p-2.5 shadow-2xl backdrop-blur-2xl cursor-pointer transition-all active:scale-[0.99] group flex flex-col justify-between"
      >
        {/* Main Content Row: [Cover] Title · Artist  [❤] [⏯] [⏭] */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Artwork + Title & Artist */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black/60 shadow border border-white/5">
              <img
                src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight group-hover:text-[#9d8df1] transition-colors font-heading">
                {currentSong.title}
              </h4>
              <p className="text-[11px] text-[#8e92a4] truncate font-medium mt-0.5">
                {currentSong.channelTitle || 'YouTube Music'}
              </p>
            </div>
          </div>

          {/* Right Actions: [❤] [⏯] [⏭] */}
          <div 
            className="flex items-center gap-1.5 shrink-0" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Heart / Like Button */}
            <button
              type="button"
              onClick={() => toggleLike(currentSong)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:text-white/80 active:scale-90 transition-all"
              title={playback.isPlaying ? "Pause" : "Play"}
              aria-label={playback.isPlaying ? "Pause" : "Play"}
            >
              {playback.isPlaying ? (
                <Pause className="w-5 h-5 fill-white text-white" />
              ) : (
                <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
              )}
            </button>

            {/* Next Song Button */}
            <button
              type="button"
              onClick={nextSong}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:text-white/80 active:scale-90 transition-all"
              title="Next song"
              aria-label="Next song"
            >
              <SkipForward className="w-4 h-4 fill-white text-white" />
            </button>
          </div>

        </div>

        {/* Bottom Progress Line (Positioned along bottom of card as in mockup) */}
        <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden mt-2.5">
          <div
            className="h-full bg-[#9d8df1] rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

      </div>
    </div>
  );
}
