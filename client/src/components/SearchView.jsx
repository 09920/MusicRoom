import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function SearchView() {
  const {
    playSong,
    currentSong,
    playback,
    togglePlayPause,
    addToQueue,
    isLiked,
    toggleLike,
    searchQuery,
    setSearchQuery
  } = usePlayer();

  const [query, setQuery] = useState(searchQuery || 'Kavinsky');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Sync external header search query with local search view query
  useEffect(() => {
    if (searchQuery && searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  const handleQueryChange = (val) => {
    setQuery(val);
    if (setSearchQuery) setSearchQuery(val);
  };

  // Curated fallback songs for Kavinsky / synthwave default view
  const defaultSongs = [
    {
      videoId: 'MV_3Dpw-BRY',
      title: 'Nightcall',
      artist: 'Kavinsky',
      album: 'OutRun',
      duration: '4:19',
      plays: '412.5M',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxOiGoWe9ZSACiIJkNb_d2-WiCKjSOra5G1yqjK36j7jGd5K5m6vPC4lvefi2-Xz5Z5rFH9q-7fnenl6PsM3YNyQwgdgiPZ8XP6cV718kQMWLyOUQ7aPjkuNrrClOaPs2Zo99VlcS9bJNeh1iPLPtGH4b8MGcqLoN3u3Wq8AghszqkN5G-Xg14S8BboXo_arVmNgccmr9DZFz0Ytq7fsHN3kFWqD73yn47jEFlPUI'
    },
    {
      videoId: '4lzfqn2FpY0',
      title: 'Pacific Coast Highway',
      artist: 'Kavinsky',
      album: 'OutRun',
      duration: '6:23',
      plays: '118.2M',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvhwi6bqrMfzSkK6VXECOnl6msg_qmUZsDndB4wVjlgBPJyMFt7rMmDWz_45tgoqjQUGsve9sjOgABfhhbEsCIVt2m3yY1-W4iDZQtQFh9Y0qevcDOnpax2ra13mLJqXHXKpN10xCCwOkd5g-Dson92B11dUqFkR-vb5czQaDQPNFM2KEIO4BNRYm6WCHo2lf5V1ayBGUKtlxYR2pzKTn8GTX-NZGswegcRImPiCA'
    },
    {
      videoId: '6B2v6hF6l24',
      title: 'Zenith',
      artist: 'Kavinsky ft. Prudence & Morgan Phalen',
      album: 'Reborn',
      duration: '3:41',
      plays: '45.1M',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClgpPIDn0xi1EmgenOuwFy1WgvDFxXNNdC7m-sUPYprP6fXxSZa3fEGCJb5d6nrjPJMukzu5GkTiavLSO54jh41QtKe7Mz-izGOK8vk1UvFlXttht0Gb5Q_BKju8qPcmW2G5fj1nLJoTJFixAXixwXFpOwtbFQYQG2VkcpyPPlpNAGQrM4YhSvsy_I8w0--ks2gDBNkai_TR4DBtgWg-0DwB2oUraPAJosnAhN3-E'
    },
    {
      videoId: 'qFp_3a7l-6g',
      title: 'Roadgame',
      artist: 'Kavinsky',
      album: 'OutRun',
      duration: '3:45',
      plays: '92.4M',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBufkkI1LCoP_D36oepmd_5jWmY0jlej44Zzk6sUoQwpPUVViyruULdEd27AuxigTBw4nZrGl-PnndyhLvc-7WzbuCUs1OyasquetUb147G1HyWyUKyxYh5mMnKrQbo_7w0MqwZHZ5HJniZo1s0jrfr473TM20l-nKoP0R-BHDsX5HQl5svzHHDmbguoFpUusIEVozzkQgTCJUs5yyt3_MUsll4tOhm19CA3E5dMdU'
    }
  ];

  // Perform search query debounced
  useEffect(() => {
    if (!query.trim() || query.toLowerCase() === 'kavinsky') {
      setSearchResults(defaultSongs);
      setIsLoading(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data.results || data.items || []);
          if (items && items.length > 0) {
            setSearchResults(
              items.map((item) => ({
                videoId: item.videoId || item.id?.videoId || item.id,
                title: item.title,
                artist: item.channelTitle || item.artist || 'Artist',
                album: 'Single / Stream',
                duration: item.durationFormatted || (item.duration ? `${Math.floor(item.duration / 60)}:${item.duration % 60 < 10 ? '0' : ''}${item.duration % 60}` : '3:45'),
                plays: 'Popular',
                thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`
              }))
            );
          } else {
            setSearchResults([]);
          }
        }
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handlePlaySong = (song) => {
    playSong({
      videoId: song.videoId,
      title: song.title,
      artist: song.artist,
      channelTitle: song.artist,
      thumbnail: song.thumbnail
    }, true, { openPlayer: true });
  };

  const GENRES_LIST = [
    { title: 'Electronic & Synth', gradient: 'from-[#6d3bd7] to-[#121317]', icon: 'graphic_eq' },
    { title: 'Cyberpunk & Darksynth', gradient: 'from-[#004e5c] to-[#121317]', icon: 'bolt' },
    { title: 'Lo-Fi Chill & Beats', gradient: 'from-[#005236] to-[#121317]', icon: 'headphones' },
    { title: 'Hindi & Bollywood Viral', gradient: 'from-[#92002a] to-[#121317]', icon: 'local_fire_department' },
    { title: 'Deep Melodic Techno', gradient: 'from-[#340080] to-[#121317]', icon: 'sensors' },
    { title: 'Indie & Alternative', gradient: 'from-[#494454] to-[#121317]', icon: 'radio' },
    { title: 'Hip-Hop & Urban', gradient: 'from-[#93000a] to-[#121317]', icon: 'mic' },
    { title: 'Ambient Neural Drone', gradient: 'from-[#1e1f28] to-[#121317]', icon: 'spa' }
  ];

  return (
    <div className="flex flex-col w-full pb-20 px-gutter select-none">
      <div className="py-space-md flex flex-col gap-space-lg max-w-7xl mx-auto w-full">

        {/* 1. Search Box Section */}
        <div className="flex flex-col gap-space-md">
          <div className="relative w-full max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline text-title-lg">search</span>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search songs, artists, albums, or podcasts..."
              className="w-full pl-12 pr-28 py-3.5 bg-surface-container rounded-xl text-on-surface font-body text-body-lg placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-colors shadow-sm border border-surface-container-high/40"
            />
            <div className="absolute inset-y-0 right-0 pr-space-md flex items-center gap-space-xs">
              {query && (
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  className="p-1 text-outline hover:text-on-surface rounded-full transition-colors"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-title-sm">close</span>
                </button>
              )}
              <div className="hidden sm:flex items-center px-2 py-0.5 rounded bg-surface-container-high text-outline font-metric-mono text-metric-mono">
                Ctrl+K
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'songs', label: 'Songs' },
              { id: 'artists', label: 'Artists' },
              { id: 'albums', label: 'Albums' },
              { id: 'playlists', label: 'Playlists' },
              { id: 'genres', label: 'Genres & Moods' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-on-surface text-surface font-bold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Recent / Quick Tags */}
          <div className="flex items-center gap-space-sm flex-wrap text-label-sm">
            <span className="text-outline font-label-sm uppercase tracking-wider flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined text-body-sm">history</span> Recent:
            </span>
            {['Kavinsky', 'Daft Punk', 'Deep Lo-Fi Focus', 'Synthwave 2088', 'Tauba Tauba', 'Die With A Smile'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQueryChange(tag)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-body-sm"
              >
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Top Result & Top Songs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start pt-space-xs">
          
          {/* Top Result Card (5 Cols on lg) */}
          <div className="lg:col-span-4 flex flex-col gap-space-sm">
            <h2 className="font-headline text-headline-sm font-bold text-on-surface">Top Result</h2>
            <div className="p-space-lg bg-surface-container rounded-xl flex flex-col justify-between gap-space-lg shadow-sm hover:bg-surface-container-high transition-all group border border-surface-container-high/40">
              <div className="flex items-center gap-space-md">
                <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-high shadow-md">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuGILQmv7auvq-Tm-32x_EqyfjQaLbTZUNxFYn5uh6Ef9U8Pwp_3b_BupC5LoaK0Q4Z-ln9CBInQeb4IyEfFJE6-BJHY8UWtVIoWJqpBn8-Pd4FN9Y-FotUje-4D-bnq7n8pLM2pOKFT-JjtLhrip8s_QnyVB7-XqYs0RTDeWpVrMLA9x-FkABli9JCugdAJMbSr4r97lFghIUST_tgvh-yagx3D4OhZXs-kRKhSI"
                    alt="Artist Profile"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    Artist
                  </span>
                  <h3 className="font-headline text-headline-md font-bold text-on-surface truncate">
                    {query.trim() || 'Kavinsky'}
                  </h3>
                  <p className="font-body text-body-md text-on-surface-variant">
                    Electronic • Hi-Fi Streaming
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-label-sm text-outline">
                    <span className="material-symbols-outlined text-title-sm text-secondary">group</span>
                    <span>2.4M monthly listeners</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-space-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (searchResults.length > 0) handlePlaySong(searchResults[0]);
                    }}
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-primary text-on-primary hover:opacity-95 shadow-sm transition-all hover:scale-105 active:scale-95"
                    title="Play Discography"
                  >
                    <span className="material-symbols-outlined text-headline-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </button>
                  <button
                    type="button"
                    className="px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-title text-title-sm font-semibold transition-colors"
                  >
                    Follow
                  </button>
                </div>
                <button
                  type="button"
                  className="p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
                  title="More options"
                >
                  <span className="material-symbols-outlined text-title-md">more_horiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Songs Table (8 Cols on lg) */}
          <div className="lg:col-span-8 flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-sm font-bold text-on-surface">Songs</h2>
              <span className="font-label-md text-label-md text-outline">
                {searchResults.length} Results
              </span>
            </div>

            <div className="flex flex-col rounded-xl overflow-hidden bg-surface-container/60 shadow-sm border border-surface-container-high/40 divide-y divide-surface-container-high">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-outline">
                  <span className="material-symbols-outlined text-title-lg animate-spin text-primary">sync</span>
                  <span className="text-body-sm font-body">Searching audio catalog...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-outline text-body-sm font-body">
                  No tracks found. Try another search.
                </div>
              ) : (
                searchResults.slice(0, 6).map((song, idx) => {
                  const isPlaying = currentSong?.videoId === song.videoId && playback.isPlaying;
                  const liked = isLiked(song.videoId);

                  return (
                    <div
                      key={song.videoId || idx}
                      onClick={() => handlePlaySong(song)}
                      className="flex items-center justify-between px-space-md py-2.5 hover:bg-surface-container-high transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-space-md min-w-0 flex-1">
                        <span className="w-5 font-metric-mono text-label-md text-outline group-hover:hidden text-center">
                          {isPlaying ? (
                            <span className="material-symbols-outlined text-title-sm text-primary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                              volume_up
                            </span>
                          ) : (
                            idx + 1
                          )}
                        </span>
                        <button
                          type="button"
                          className="w-5 hidden group-hover:flex items-center justify-center text-primary"
                          title="Play"
                        >
                          <span className="material-symbols-outlined text-title-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isPlaying ? 'pause' : 'play_arrow'}
                          </span>
                        </button>

                        <div className="w-10 h-10 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                          <img
                            src={song.thumbnail}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80';
                            }}
                          />
                        </div>

                        <div className="flex flex-col min-w-0 pr-space-md">
                          <span className={`text-body-sm font-semibold truncate ${isPlaying ? 'text-primary' : 'text-on-surface'}`}>
                            {song.title}
                          </span>
                          <span className="text-label-sm text-on-surface-variant truncate">
                            {song.artist}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-space-md flex-shrink-0">
                        <span className="hidden sm:block text-body-sm font-metric-mono text-outline">
                          {song.duration}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(song);
                          }}
                          className={`p-1 transition-colors ${
                            liked ? 'text-primary' : 'text-outline hover:text-primary opacity-0 group-hover:opacity-100'
                          }`}
                          title="Like track"
                        >
                          <span className="material-symbols-outlined text-title-sm" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                            {liked ? 'favorite' : 'favorite_border'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 3. Browse All Genres & Moods Grid */}
        <section className="flex flex-col gap-space-md pt-space-lg">
          <h2 className="font-headline text-headline-sm font-bold text-on-surface">
            Browse All Genres &amp; Moods
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-space-md">
            {GENRES_LIST.map((genre) => (
              <div
                key={genre.title}
                onClick={() => setQuery(genre.title)}
                className={`relative h-28 rounded-xl p-space-md bg-gradient-to-br ${genre.gradient} border border-surface-container-high/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer overflow-hidden shadow-sm group`}
              >
                <div className="flex flex-col justify-between h-full relative z-10">
                  <span className="font-title text-title-md font-bold text-on-surface leading-snug">
                    {genre.title}
                  </span>
                  <div className="flex items-center gap-1 text-label-sm text-outline group-hover:text-primary transition-colors">
                    <span>Explore</span>
                    <span className="material-symbols-outlined text-title-sm">arrow_forward</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-white/5 flex items-center justify-center pointer-events-none group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-display text-white/10">{genre.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
