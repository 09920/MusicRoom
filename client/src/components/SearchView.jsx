import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, MoreVertical, Clock, Sparkles, Loader2, Heart, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

function formatDuration(sec) {
  if (!sec) return '3:30';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function SearchView() {
  const {
    playSong,
    playFromCollection,
    currentSong,
    playback,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    openSongMenu,
    isLiked,
    toggleLike
  } = usePlayer();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(query.trim());
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const executeSearch = (searchTerm) => {
    if (!searchTerm) return;
    setLoading(true);
    setHasSearched(true);
    addRecentSearch(searchTerm);

    socket.emit('song:search', { query: searchTerm }, (res) => {
      setLoading(false);
      if (res?.success && res.results) {
        setResults(res.results);
      } else {
        setResults([]);
      }
    });
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-5 pb-24 sm:pb-28">

      {/* Search Input Bar [🔍 Search songs, artists… ✕] */}
      <div className="relative flex items-center pt-2">
        <Search className="w-4 h-4 text-white/40 absolute left-4 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums…"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          className="w-full pl-11 pr-11 py-3.5 rounded-2xl liquid-glass text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-body shadow-xl border border-white/10"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin absolute right-4" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90 absolute right-3"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* When Search Box is Empty: Recent Searches & Trending Suggestions */}
      {!query.trim() && (
        <div className="space-y-6 pt-1">

          {/* Recent Searches Chips */}
          {recentSearches && recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-white/50" />
                  <h3 className="font-heading font-bold text-base text-white">Recent Searches</h3>
                </div>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-[11px] text-white/40 hover:text-rose-400 font-mono transition-colors"
                >
                  Clear History
                </button>
              </div>

              <div className="flex flex-wrap gap-2 px-1">
                {recentSearches.map((term, idx) => (
                  <button
                    key={`${term}-${idx}`}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      executeSearch(term);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#161822] text-xs font-medium text-white/90 hover:text-white hover:bg-[#1f2230] border border-white/[0.08] transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Discover Searches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="w-3.5 h-3.5 text-[#9d8df1]" />
              <h3 className="font-heading font-bold text-base text-white">Popular Searches</h3>
            </div>

            <div className="flex flex-wrap gap-2 px-1">
              {[
                'Arijit Singh Hits',
                'Karan Aujla Top',
                'AP Dhillon Vibes',
                'Taylor Swift Era',
                'The Weeknd Starboy',
                'Anuv Jain Chill',
                'Coldplay Magic',
                'Shreya Ghoshal Melodies'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    executeSearch(suggestion);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#181a26] text-xs font-medium text-[#9d8df1] hover:text-white hover:bg-[#202336] border border-[#9d8df1]/20 transition-all active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Search Results List: [thumb] Title · Artist · 3:45   [▶] [⋯] */}
      {query.trim() && (
        <div className="space-y-2 pt-1">
          {hasSearched && !loading && results.length === 0 ? (
            <div className="py-16 text-center text-white/40 flex flex-col items-center">
              <Music className="w-10 h-10 text-white/20 mb-2" />
              <p className="text-sm font-medium text-white/60">No songs found</p>
              <p className="text-xs text-white/30 mt-0.5">Try searching with a different artist or song name</p>
            </div>
          ) : (
            results.map((song) => {
              const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
              const liked = isLiked(song.videoId);

              return (
                <div
                  key={`search-${song.videoId}`}
                  className="glass-card flex items-center justify-between p-2.5 rounded-2xl group transition-all"
                >
                  {/* Thumbnail & Title/Artist */}
                  <div
                    onClick={() => playFromCollection(results, results.indexOf(song), `Search: "${query}"`)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/60 shadow-md border border-white/10">
                      <img
                        src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {isPlayingThis && (
                        <div className="absolute inset-0 bg-violet-950/75 backdrop-blur-sm flex items-center justify-center gap-0.5">
                          <span className="w-0.5 h-3 bg-violet-300 rounded-full animate-eq-1" />
                          <span className="w-0.5 h-4 bg-violet-300 rounded-full animate-eq-2" />
                          <span className="w-0.5 h-2 bg-violet-300 rounded-full animate-eq-3" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight group-hover:text-violet-300 transition-colors font-heading">
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-white/50 truncate font-medium mt-0.5">
                        {song.channelTitle || 'YouTube Music'}
                      </p>
                    </div>
                  </div>

                  {/* Actions: [❤] [▶] [⋯] */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleLike(song)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-rose-400 transition-colors active:scale-90"
                      title={liked ? "Unlike" : "Like"}
                    >
                      <Heart
                        className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => playFromCollection(results, results.indexOf(song), `Search: "${query}"`)}
                      className="w-8 h-8 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow transition-all active:scale-90"
                      title="Play Now"
                    >
                      <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openSongMenu(song)}
                      className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}

