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
        className="w-full rounded-2xl p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.7)] cursor-pointer transition-all active:scale-[0.99] group flex flex-col justify-between bg-[#12131c]/95 backdrop-blur-2xl border border-white/[0.08] hover:border-[#a078ff]/30"
      >
        {/* Main Content Row: [Cover] Title · Artist  [❤] [⏯] [⏭] */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Artwork + Title & Artist */}
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
            <div className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#0d0e16] shadow-md border border-white/10 ${playback.isPlaying ? 'ring-2 ring-[#a078ff]/50 shadow-[0_0_16px_rgba(160,120,255,0.3)]' : ''}`}>
              <img
                src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              {playback.isPlaying && (
                <div className="absolute inset-0 bg-[#a078ff]/10 mix-blend-overlay" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-headline font-semibold text-white truncate leading-tight group-hover:text-[#d0bcff] transition-colors">
                  {currentSong.title}
                </h4>
                {playback.isPlaying && (
                  <span className="flex items-center gap-0.5 shrink-0 px-1 py-0.5 rounded bg-[#4cd7f6]/15 border border-[#4cd7f6]/30">
                    <span className="w-0.5 h-2 bg-[#4cd7f6] rounded-full animate-eq-1" />
                    <span className="w-0.5 h-3 bg-[#4cd7f6] rounded-full animate-eq-2" />
                    <span className="w-0.5 h-1.5 bg-[#4cd7f6] rounded-full animate-eq-3" />
                  </span>
                )}
              </div>
              <p className="text-[11px] font-body text-[#cbc3d7]/60 truncate font-normal mt-0.5">
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
                    ? 'fill-[#ff516a] text-[#ff516a] scale-110'
                    : 'text-white/60 hover:text-white'
                }`}
              />
            </button>

            {/* Play / Pause Button */}
            <button
              type="button"
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#a078ff] text-[#340080] hover:scale-105 active:scale-95 transition-all shadow-[0_0_12px_rgba(160,120,255,0.4)]"
              title={playback.isPlaying ? "Pause" : "Play"}
              aria-label={playback.isPlaying ? "Pause" : "Play"}
            >
              {playback.isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Next Song Button */}
            <button
              type="button"
              onClick={nextSong}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#cbc3d7] hover:text-white hover:bg-white/10 active:scale-90 transition-all"
              title="Next song"
              aria-label="Next song"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Ultra-Slim Progress Line */}
        <div className="w-full bg-white/10 h-0.5 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-[#a078ff] to-[#4cd7f6] rounded-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
