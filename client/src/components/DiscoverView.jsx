import React, { useState, useEffect } from 'react';
import { Play, MoreVertical, Heart, Sparkles, Music2, Disc3, Trophy, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';
import BannerHero from './BannerHero';
import { isCompilationOrMix } from '../data/topHitsData';

const MOODS = [
  { id: 'Trending', label: '🔥 Trending' },
  { id: 'Hindi Hits', label: '🎧 Hindi Hits' },
  { id: 'Chill Lo-Fi', label: '☕ Chill Lo-Fi' },
  { id: 'Punjabi', label: '⚡ Punjabi' },
  { id: 'Romantic', label: '🌹 Romantic' },
  { id: 'English Pop', label: '✨ English Pop' },
  { id: 'Workout', label: '💪 Workout' }
];

function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Late night vibes';
}

const STARTER_VIBES = [
  { videoId: 'hBCrkxP6L4A', title: 'Midnight Drive', channelTitle: 'Nova Lane', thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80', gradient: 'from-purple-500 via-indigo-500 to-pink-500' },
  { videoId: 'k70n_2Z2w-g', title: 'Slow Monsoon', channelTitle: 'Kabir and Co', thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', gradient: 'from-cyan-500 via-blue-500 to-indigo-600' },
  { videoId: 'LK7-_dgAVQE', title: 'Neon Sunset', channelTitle: 'Aura Collective', thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', gradient: 'from-orange-500 via-rose-500 to-pink-600' },
  { videoId: 'ElZfdU54Cp8', title: 'Golden Hour', channelTitle: 'Samir Beats', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', gradient: 'from-amber-500 via-yellow-500 to-orange-500' }
];

export default function DiscoverView({ onOpenAiTheme }) {
  const {
    selectedMood,
    setSelectedMood,
    playSong,
    currentSong,
    playback,
    history,
    openSongMenu,
    isLiked,
    toggleLike,
    addToQueue,
    playFromCollection,
    openPlaylist
  } = usePlayer();

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loading, setLoading] = useState(false);

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
  const continueList = (history && history.length > 0) ? history.slice(0, 8) : STARTER_VIBES;

  return (
    <div className="space-y-6 pb-28 select-none">

      {/* 1. High-Impact Interactive Hero Banner (banner-design + generative_ui) */}
      <BannerHero onOpenAiTheme={onOpenAiTheme} />

      {/* 2. Header & Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <span>{greeting}</span>
            <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-ping" />
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Discover trending tracks curated for real-time group sessions
          </p>
        </div>
      </div>

      {/* 3. Mood Pills (Horizontally Scrollable, Glassmorphic Pills) */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => setSelectedMood(mood.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 shrink-0 border ${isSelected
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-violet-400/50 shadow-lg shadow-violet-500/25 scale-102'
                  : 'bg-[#141624]/90 text-white/80 hover:text-white border-white/[0.08] hover:bg-[#1c1f32]'
                }`}
            >
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* 4. Continue Listening Shelf */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white font-heading tracking-wide flex items-center gap-2">
            <Music2 className="w-4 h-4 text-violet-400" />
            <span>Continue Listening</span>
          </h3>
          <span className="text-[11px] text-white/40">Recent Tracks</span>
        </div>

        <div
          className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {continueList.map((song, idx) => {
            const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
            const isMix = isCompilationOrMix(song.title);

            const handleContinueClick = () => {
              if (isMix) {
                openPlaylist(song);
              } else {
                playFromCollection(continueList, idx, 'Recent History');
              }
            };

            return (
              <div
                key={`continue-${song.videoId || idx}`}
                onClick={handleContinueClick}
                className="group relative w-28 sm:w-32 shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-lg active:scale-95 transition-all bg-[#121422] border border-white/[0.08] hover:border-violet-500/40 p-2 flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-black/60 shadow">
                  {song.thumbnail ? (
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-tr ${song.gradient || 'from-purple-600 to-indigo-600'}`} />
                  )}

                  {isMix && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-black text-[8px] font-bold uppercase tracking-wider shadow">
                      Top 100
                    </span>
                  )}

                  {/* Hover Play Button */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-xl group-hover:scale-105">
                      {isMix ? (
                        <ListMusic className="w-4 h-4 text-black" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                      )}
                    </div>
                  </div>

                  {isPlayingThis && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-violet-400/40">
                      <span className="w-1 h-3 bg-violet-400 rounded-full animate-eq-1" />
                      <span className="w-1 h-2 bg-violet-400 rounded-full animate-eq-2" />
                      <span className="w-1 h-3 bg-violet-400 rounded-full animate-eq-3" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                    {song.title}
                  </h4>
                  <p className="text-[10px] text-white/50 truncate mt-0.5">
                    {song.channelTitle || 'Artist'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Trending Now Grid (Responsive 2/3/4 Column Grid with Glass Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white font-heading tracking-wide">
            Trending Now in {selectedMood}
          </h3>
          <span className="text-[11px] text-white/40">Real-Time Sync Ready</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="rounded-2xl bg-[#121422] border border-white/5 p-3 h-52 animate-pulse flex flex-col justify-between">
                <div className="w-full aspect-square bg-white/5 rounded-xl mb-2" />
                <div className="w-3/4 h-3 bg-white/10 rounded mb-1.5" />
                <div className="w-1/2 h-2.5 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
            {trendingSongs.map((song) => {
              const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
              const liked = isLiked(song.videoId);
              const isMix = isCompilationOrMix(song.title);

              const handleSongClick = () => {
                if (isMix) {
                  openPlaylist(song);
                } else {
                  playFromCollection(trendingSongs, trendingSongs.indexOf(song), `${selectedMood} Trending`);
                }
              };

              return (
                <div
                  key={`trending-${song.videoId}`}
                  className="glass-card group relative rounded-2xl p-3 flex flex-col justify-between"
                >
                  {/* Artwork & Play Overlay */}
                  <div
                    onClick={handleSongClick}
                    className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-black/60 shadow cursor-pointer"
                  >
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      loading="lazy"
                    />

                    {isMix && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[9px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 z-10">
                        <ListMusic className="w-2.5 h-2.5" />
                        <span>Playlist Tracks</span>
                      </div>
                    )}

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px] gap-1.5">
                      {isMix ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                            <ListMusic className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded-full">
                            View Playlist Songs
                          </span>
                        </>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                          <Play className="w-4 h-4 fill-black translate-x-0.5" />
                        </div>
                      )}
                    </div>

                    {isPlayingThis && (
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-violet-500/90 backdrop-blur-md text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5 border border-white/20 z-10">
                        <span className="flex items-center gap-0.5">
                          <span className="w-1 h-2.5 bg-white rounded-full animate-eq-1" />
                          <span className="w-1 h-3.5 bg-white rounded-full animate-eq-2" />
                          <span className="w-1 h-2 bg-white rounded-full animate-eq-3" />
                        </span>
                        <span>Playing</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1 mb-1.5">
                    <h4
                      onClick={handleSongClick}
                      className="text-xs sm:text-sm font-bold text-white truncate leading-tight group-hover:text-violet-300 cursor-pointer transition-colors font-heading"
                      title={song.title}
                    >
                      {song.title}
                    </h4>
                    <p className="text-[11px] text-white/50 font-medium truncate mt-0.5">
                      {song.channelTitle || 'YouTube Music'}
                    </p>
                  </div>

                  {/* Card Bottom Row: Heart, Play Mix direct & 3-Dot Menu */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] mt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleLike(song)}
                      className="text-white/40 hover:text-rose-400 transition-colors active:scale-90 p-1"
                      title={liked ? "Liked" : "Like"}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${liked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                          }`}
                      />
                    </button>

                    <div className="flex items-center gap-1">
                      {isMix && (
                        <button
                          type="button"
                          onClick={() => openPlaylist(song)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                          title="Open playlist page"
                        >
                          View Songs
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openSongMenu(song)}
                        className="text-white/40 hover:text-white p-1 rounded-full transition-colors active:scale-90"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
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
