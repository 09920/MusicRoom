import React from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function MiniPlayer() {
  const {
    currentSong,
    playback,
    togglePlayPause,
    nextSong,
    isLiked,
    toggleLike,
    isAudioOnly,
    toggleAudioOnly,
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
        className="w-full rounded-2xl p-2.5 shadow-lg cursor-pointer transition-all active:scale-[0.99] group flex flex-col justify-between bg-surface-container-low/95 backdrop-blur-2xl border border-surface-container-high hover:border-primary/40"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Artwork + Title & Artist */}
          <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
            <div className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-surface-container shadow-sm border border-white/5 ${playback.isPlaying ? 'ring-2 ring-primary/50' : ''}`}>
              <img
                src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-headline font-semibold text-on-surface truncate leading-tight group-hover:text-primary transition-colors">
                {currentSong.title}
              </h4>
              <p className="text-[11px] font-body text-on-surface-variant truncate font-normal mt-0.5">
                {currentSong.channelTitle || currentSong.artist || 'Artist'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={toggleAudioOnly}
              className={`p-2 transition-colors active:scale-90 ${
                !isAudioOnly ? 'text-sky-400' : 'text-outline hover:text-on-surface'
              }`}
              title={isAudioOnly ? "Switch to Video" : "Switch to Audio"}
            >
              <span className="material-symbols-outlined text-title-md">
                {!isAudioOnly ? 'smart_display' : 'videocam'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleLike(currentSong)}
              className="p-2 text-outline hover:text-primary transition-colors active:scale-90"
              title="Like"
            >
              <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                {liked ? 'favorite' : 'favorite_border'}
              </span>
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
              title={playback.isPlaying ? "Pause" : "Play"}
            >
              <span className="material-symbols-outlined text-title-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {playback.isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button
              type="button"
              onClick={nextSong}
              className="p-2 text-outline hover:text-on-surface transition-colors active:scale-90"
              title="Next"
            >
              <span className="material-symbols-outlined text-title-md">skip_next</span>
            </button>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary transition-all duration-150 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
