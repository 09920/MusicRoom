import React, { useState, useEffect } from 'react';
import { Play, MoreVertical, Heart, Disc3 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

const MOODS = [
  { id: 'Trending', label: 'Trending' },
  { id: 'Hindi Hits', label: 'Hindi Hits' },
  { id: 'Chill Lo-Fi', label: 'Chill Lo-Fi' },
  { id: 'Punjabi', label: 'Punjabi' },
  { id: 'Romantic', label: 'Romantic' },
  { id: 'English Pop', label: 'English Pop' },
  { id: 'Workout', label: 'Workout' }
];

function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good evening';
}

// Starter fallback vibes for "Continue listening" if local history is fresh
const STARTER_VIBES = [
  { videoId: 'hBCrkxP6L4A', title: 'Midnight Drive', channelTitle: 'Nova Lane', thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80', gradient: 'from-purple-500 via-indigo-500 to-pink-500' },
  { videoId: 'k70n_2Z2w-g', title: 'Slow Monsoon', channelTitle: 'Kabir and Co', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', gradient: 'from-cyan-500 via-blue-500 to-indigo-600' },
  { videoId: 'LK7-_dgAVQE', title: 'Neon Sunset', channelTitle: 'Aura Collective', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', gradient: 'from-orange-500 via-rose-500 to-pink-600' },
  { videoId: 'ElZfdU54Cp8', title: 'Golden Hour', channelTitle: 'Samir Beats', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', gradient: 'from-amber-500 via-yellow-500 to-orange-500' }
];

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

  // Combine real history with starter tiles
  const continueList = (history && history.length > 0) ? history.slice(0, 8) : STARTER_VIBES;

  return (
    <div className="space-y-6 pb-28">
      
      {/* 1. Header: "Good evening" */}
      <div className="pt-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
          {greeting}
        </h2>
      </div>

      {/* 2. Mood Pills (Horizontally Scrollable, pastel active pill) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMood(mood.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-[#9d8df1] text-[#0d0e14] shadow-md'
                  : 'bg-[#161822] text-white/90 hover:text-white border border-white/[0.08] hover:bg-[#1f2230]'
              }`}
            >
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* 3. Continue listening Shelf */}
      <div className="space-y-2.5">
        <h3 className="text-base font-bold text-white font-heading">
          Continue listening
        </h3>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {continueList.map((song, idx) => {
            const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
            return (
              <div
                key={`continue-${song.videoId || idx}`}
                onClick={() => playSong(song, true)}
                className="group relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-lg active:scale-95 transition-all bg-[#12141d] border border-white/[0.06]"
              >
                {song.thumbnail ? (
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-tr ${song.gradient || 'from-purple-600 to-indigo-600'}`} />
                )}

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                    <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                  </div>
                </div>

                {isPlayingThis && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#9d8df1] animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Trending now Section (2-Column Grid on Mobile) */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white font-heading">
          Trending now
        </h3>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-[#12141d] p-3 h-48 animate-pulse flex flex-col justify-between">
                <div className="w-full aspect-square bg-white/5 rounded-xl mb-2" />
                <div className="w-3/4 h-3 bg-white/10 rounded mb-1" />
                <div className="w-1/2 h-2.5 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {trendingSongs.map((song) => {
              const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
              const liked = isLiked(song.videoId);

              return (
                <div
                  key={`trending-${song.videoId}`}
                  className="group relative rounded-2xl bg-[#12141d] border border-white/[0.06] p-3 transition-all hover:bg-[#181a24] shadow-xl flex flex-col justify-between"
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

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-90 transition-transform">
                        <Play className="w-4 h-4 fill-black translate-x-0.5" />
                      </div>
                    </div>

                    {isPlayingThis && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#9d8df1] text-[9px] font-bold text-[#0d0e14] shadow flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0d0e14] animate-ping" />
                        <span>Playing</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1 mb-1">
                    <h4
                      onClick={() => playSong(song, true)}
                      className="text-sm font-bold text-white truncate leading-tight group-hover:text-[#9d8df1] cursor-pointer transition-colors font-heading"
                      title={song.title}
                    >
                      {song.title}
                    </h4>
                    <p className="text-xs text-[#8e92a4] font-medium truncate mt-0.5">
                      {song.channelTitle || 'YouTube Music'}
                    </p>
                  </div>

                  {/* Card Bottom Row: Heart & 3-Dot Menu */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] mt-1">
                    <button
                      type="button"
                      onClick={() => toggleLike(song)}
                      className="text-white/40 hover:text-rose-400 transition-colors active:scale-90 p-0.5"
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
                      className="text-white/40 hover:text-white p-0.5 rounded-full transition-colors active:scale-90"
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
