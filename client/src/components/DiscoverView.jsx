import React, { useState, useEffect } from 'react';
import { Play, MoreVertical, Sparkles, Flame, Heart, Disc3, Clock } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

const MOODS = [
  { id: 'Trending', label: '🔥 Trending' },
  { id: 'Hindi Hits', label: '🇮🇳 Hindi Hits' },
  { id: 'Chill Lo-Fi', label: '☕ Chill Lo-Fi' },
  { id: 'Punjabi', label: '⚡ Punjabi' },
  { id: 'Romantic', label: '❤️ Romantic' },
  { id: 'English Pop', label: '🌐 English Pop' },
  { id: 'Workout', label: '💪 Workout' }
];

function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Late night vibe';
}

export default function DiscoverView() {
  const {
    selectedMood,
    setSelectedMood,
    playSong,
    currentSong,
    playback,
    history,
    openSongMenu,
    isLiked,
    toggleLike
  } = usePlayer();

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch trending songs for the selected mood
  useEffect(() => {
    setLoading(true);
    socket.emit('song:trending', { mood: selectedMood }, (res) => {
      setLoading(false);
      if (res?.success && res.songs) {
        setTrendingSongs(res.songs);
      }
    });
  }, [selectedMood]);

  const greeting = getDynamicGreeting();

  return (
    <div className="space-y-6 pb-24 sm:pb-28">
      
      {/* Dynamic Greeting Header */}
      <div className="pt-2 px-1">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs uppercase tracking-widest text-purple-300 font-mono">Curated For You</span>
        </div>
        <h2 className="font-heading italic text-2xl sm:text-3xl text-white tracking-tight">
          {greeting}
        </h2>
      </div>

      {/* Mood Pills (Horizontally Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1 -mx-1">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMood(mood.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 shrink-0 border ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-500/80 shadow-lg shadow-purple-600/30'
                  : 'liquid-glass text-white/70 hover:text-white border-white/10 hover:bg-white/10'
              }`}
            >
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* Continue Listening Shelf (Hidden if empty) */}
      {history && history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <h3 className="font-heading italic text-lg text-white">Continue Listening</h3>
            </div>
            <span className="text-[11px] text-white/40 font-mono">{history.length} recent</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 px-1 -mx-1">
            {history.slice(0, 10).map((song) => {
              const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
              return (
                <div
                  key={`history-${song.videoId}`}
                  onClick={() => playSong(song, true)}
                  className="group relative w-32 sm:w-36 shrink-0 rounded-2xl liquid-glass p-2.5 cursor-pointer hover:bg-white/10 transition-all border border-white/5 shadow-lg active:scale-95"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-black/60 shadow">
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                      </div>
                    </div>
                    {isPlayingThis && (
                      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-purple-600 text-[9px] font-semibold text-white shadow">
                        Playing
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-white truncate group-hover:text-purple-300">
                    {song.title}
                  </p>
                  <p className="text-[10px] text-white/40 truncate font-light mt-0.5">
                    {song.channelTitle || 'YouTube'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Now Grid (2-Column on Mobile, 3/4 Column on Tablet/Desktop) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="font-heading italic text-lg sm:text-xl text-white">
              Trending in {selectedMood}
            </h3>
          </div>
          <span className="text-[11px] text-white/40 font-mono">
            {trendingSongs.length} tracks
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl liquid-glass p-3 h-44 animate-pulse flex flex-col justify-end">
                <div className="w-full h-28 bg-white/5 rounded-xl mb-2" />
                <div className="w-3/4 h-3 bg-white/10 rounded mb-1" />
                <div className="w-1/2 h-2.5 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
            {trendingSongs.map((song) => {
              const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
              const liked = isLiked(song.videoId);

              return (
                <div
                  key={`trending-${song.videoId}`}
                  className="group relative rounded-2xl liquid-glass p-3 transition-all hover:bg-white/10 border border-white/5 shadow-xl flex flex-col justify-between"
                >
                  {/* Artwork & Play Overlay */}
                  <div
                    onClick={() => playSong(song, true)}
                    className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-black/60 shadow cursor-pointer"
                  >
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Hover / Active Play Button */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                        <Play className="w-4 h-4 fill-black translate-x-0.5" />
                      </div>
                    </div>

                    {isPlayingThis && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-600/90 backdrop-blur-md text-[9px] font-semibold text-white shadow flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>Playing</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1 mb-1">
                    <h4
                      onClick={() => playSong(song, true)}
                      className="text-xs sm:text-sm font-semibold text-white truncate leading-tight group-hover:text-purple-300 cursor-pointer transition-colors"
                      title={song.title}
                    >
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-white/50 truncate font-light mt-0.5 font-body">
                      {song.channelTitle || 'YouTube Music'}
                    </p>
                  </div>

                  {/* Bottom Row: Heart & 3-Dot Menu */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-1">
                    <button
                      type="button"
                      onClick={() => toggleLike(song)}
                      className="text-white/40 hover:text-rose-400 transition-colors active:scale-90"
                      title={liked ? "Liked" : "Like"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          liked ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => openSongMenu(song)}
                      className="text-white/40 hover:text-white p-1 rounded-full transition-colors active:scale-90"
                      title="More options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
