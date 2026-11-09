import React, { useState } from 'react';
import { 
  ChevronDown, 
  ListMusic, 
  Heart, 
  Plus, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Radio, 
  Video, 
  Headphones, 
  Trash2, 
  GripVertical,
  Music2
} from 'lucide-react';
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
    isQueueOpen,
    setIsQueueOpen,
    togglePlayPause,
    seekTo,
    nextSong,
    prevSong,
    isLiked,
    toggleLike,
    openAddToPlaylistModal,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    isAudioOnly,
    toggleAudioOnly,
    radioMode,
    toggleRadio,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    queue,
    removeFromQueue,
    clearQueue,
    playSong
  } = usePlayer();

  const [draggedIdx, setDraggedIdx] = useState(null);

  if (!isFullScreen || !currentSong) return null;

  const liked = isLiked(currentSong.videoId);

  const handleSeekChange = (e) => {
    const newTime = Number(e.target.value);
    seekTo(newTime);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between overflow-hidden text-white font-body animate-in slide-in-from-bottom duration-300">
      
      {/* Ambient Blurred Artwork Glow Backdrop */}
      {currentSong.thumbnail && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
          <img
            src={currentSong.thumbnail}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-150 transform transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95" />
        </div>
      )}

      {/* Top Header Bar (Collapse ⌄ & Queue ☰) */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsFullScreen(false)}
          className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-90"
          title="Collapse player"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center min-w-0 px-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">
            {isAudioOnly ? 'Audio Only Mode' : 'Now Playing'}
          </span>
          <span className="text-xs font-medium text-white/70 truncate max-w-[200px] block">
            {currentSong.channelTitle || 'MusicRoom'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsQueueOpen((prev) => !prev)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            isQueueOpen
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'liquid-glass text-white/80 hover:text-white'
          }`}
          title="Toggle Queue"
          aria-label="Toggle Queue"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* Middle Stage: Spinning Vinyl / Visualizer */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-2 min-h-0">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 max-w-[70vw] max-h-[70vw] aspect-square rounded-full shadow-2xl p-2.5 liquid-glass flex items-center justify-center">
          
          {/* Spinning Vinyl Texture & Center Artwork */}
          <div
            className={`relative w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white/10 ${
              playback.isPlaying ? 'animate-[spin_16s_linear_infinite]' : ''
            }`}
          >
            <img
              src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
              alt={currentSong.title}
              className="w-full h-full object-cover scale-105"
            />
            {/* Vinyl Record Grooves Overlay */}
            <div className="absolute inset-0 rounded-full border-[10px] border-black/40 pointer-events-none" />
            <div className="absolute inset-0 rounded-full border-[22px] border-black/20 pointer-events-none" />
            
            {/* Center Vinyl Hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/95 border-2 border-white/20 flex items-center justify-center shadow-inner">
                <div className="w-4 h-4 rounded-full bg-white/80 shadow" />
              </div>
            </div>
          </div>

          {/* Equalizer Wave Bars on Audio Mode */}
          {playback.isPlaying && (
            <div className="absolute -bottom-3 px-3 py-1 rounded-full liquid-glass-strong border border-white/10 flex items-end gap-1 shadow-lg">
              <span className="w-1 bg-purple-400 h-3 rounded-full animate-[bounce_0.8s_infinite_100ms]" />
              <span className="w-1 bg-indigo-400 h-4 rounded-full animate-[bounce_0.8s_infinite_300ms]" />
              <span className="w-1 bg-pink-400 h-2.5 rounded-full animate-[bounce_0.8s_infinite_200ms]" />
              <span className="w-1 bg-purple-400 h-4 rounded-full animate-[bounce_0.8s_infinite_400ms]" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Section */}
      <div className="relative z-10 px-6 pb-6 pt-2 shrink-0 max-w-xl mx-auto w-full space-y-4">
        
        {/* Track Title, Artist & Action Buttons ([❤] [＋ playlist]) */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-white truncate leading-tight">
              {currentSong.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#8e92a4] truncate font-medium mt-0.5">
              {currentSong.channelTitle || 'YouTube Music'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => toggleLike(currentSong)}
              className="w-10 h-10 rounded-full bg-[#181a24] border border-white/10 flex items-center justify-center transition-all active:scale-90"
              title={liked ? "Unlike" : "Like"}
              aria-label="Like song"
            >
              <Heart
                className={`w-5 h-5 transition-all ${
                  liked
                    ? 'fill-rose-500 text-rose-500 scale-110'
                    : 'text-white/60 hover:text-white'
                }`}
              />
            </button>

            {/* Add to Playlist Button */}
            <button
              type="button"
              onClick={() => openAddToPlaylistModal(currentSong)}
              className="w-10 h-10 rounded-full bg-[#181a24] border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
              title="Add to playlist"
              aria-label="Add to playlist"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrubber / Progress Bar & Timestamps */}
        <div className="space-y-1.5">
          <input
            type="range"
            min="0"
            max={playback.duration || 100}
            value={playback.currentTime || 0}
            onChange={handleSeekChange}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#9d8df1] transition-all hover:h-2"
          />
          <div className="flex justify-between text-[11px] font-mono text-white/40">
            <span>{formatTime(playback.currentTime)}</span>
            <span>{formatTime(playback.duration)}</span>
          </div>
        </div>

        {/* Primary Playback Controls: [🔀] [⏮] [ ⏯ ] [⏭] [🔁] */}
        <div className="flex items-center justify-between px-2">
          {/* Shuffle Toggle */}
          <button
            type="button"
            onClick={toggleShuffle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              isShuffled ? 'text-purple-400' : 'text-white/40 hover:text-white'
            }`}
            title={isShuffled ? "Shuffle On" : "Shuffle Off"}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            type="button"
            onClick={prevSong}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-90"
            title="Previous"
          >
            <SkipBack className="w-6 h-6 fill-white/80" />
          </button>

          {/* Play / Pause Giant Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-white text-black hover:bg-white/95 flex items-center justify-center shadow-2xl active:scale-95 transition-all"
            title={playback.isPlaying ? "Pause" : "Play"}
          >
            {playback.isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            type="button"
            onClick={nextSong}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-90"
            title="Next"
          >
            <SkipForward className="w-6 h-6 fill-white/80" />
          </button>

          {/* Repeat Cycle */}
          <button
            type="button"
            onClick={cycleRepeat}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
              repeatMode !== 'off' ? 'text-purple-400' : 'text-white/40 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Utility Row: [Audio | Video] [📻 Radio] [🔊 Volume] */}
        <div className="flex items-center justify-between pt-1 text-xs">
          {/* Audio / Video Toggle */}
          <button
            type="button"
            onClick={toggleAudioOnly}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border active:scale-95 ${
              isAudioOnly
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/40'
                : 'liquid-glass text-white/80 border-white/10 hover:text-white'
            }`}
            title="Toggle Audio / Video"
          >
            {isAudioOnly ? (
              <>
                <Headphones className="w-3.5 h-3.5 text-purple-300" />
                <span>Audio (144p)</span>
              </>
            ) : (
              <>
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>Video Mode</span>
              </>
            )}
          </button>

          {/* Radio / Auto-Mode Toggle */}
          <button
            type="button"
            onClick={toggleRadio}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border active:scale-95 ${
              radioMode
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                : 'liquid-glass text-white/40 border-white/10'
            }`}
            title="Endless Auto-DJ Recommendations"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radio {radioMode ? 'ON' : 'OFF'}</span>
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="text-white/60 hover:text-white active:scale-90 transition-all"
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
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>

      </div>

      {/* Slide-Up Queue Panel Overlay */}
      {isQueueOpen && (
        <div className="absolute inset-x-0 bottom-0 top-16 z-30 liquid-glass-strong border-t border-white/10 rounded-t-3xl flex flex-col p-5 shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom duration-300">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div>
              <h4 className="font-heading italic text-lg text-white">Playing Queue</h4>
              <p className="text-[11px] text-white/50 font-body">
                {queue.length} upcoming {queue.length === 1 ? 'song' : 'songs'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={clearQueue}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-1 transition-all active:scale-95 border border-white/5"
                  title="Clear Queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsQueueOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Now Playing Row */}
          <div className="py-3 border-b border-white/5 shrink-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 block mb-1">
              ▶ Now Playing
            </span>
            <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/5">
              <img
                src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt={currentSong.title}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{currentSong.title}</p>
                <p className="text-[10px] text-white/50 truncate">{currentSong.channelTitle || 'YouTube'}</p>
              </div>
            </div>
          </div>

          {/* Up Next List */}
          <div className="flex-1 overflow-y-auto py-2 space-y-1.5 pr-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block mb-1">
              Up Next
            </span>

            {queue.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center text-white/40">
                <Music2 className="w-8 h-8 text-white/20 mb-2" />
                <p className="text-xs font-medium text-white/60">Queue is empty</p>
                <p className="text-[11px] text-white/30 font-light mt-0.5">
                  {radioMode ? 'Endless Radio will pick the next song' : 'Add songs from Search or Discover'}
                </p>
              </div>
            ) : (
              queue.map((song, idx) => (
                <div
                  key={`${song.videoId}-${idx}`}
                  className="flex items-center justify-between p-2 rounded-xl liquid-glass hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono text-white/30 w-4 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{song.title}</p>
                      <p className="text-[10px] text-white/50 truncate">{song.channelTitle || 'YouTube'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playSong(song, true);
                        removeFromQueue(idx);
                      }}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all active:scale-90"
                      title="Play Now"
                    >
                      <Play className="w-3 h-3 fill-current translate-x-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromQueue(idx)}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 flex items-center justify-center transition-all active:scale-90"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}

