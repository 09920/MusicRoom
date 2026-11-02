import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Plus, X, Loader2, Music, Check } from 'lucide-react';
import { socket } from '../socket';

export default function SongSearch({ canControl, onSongPicked }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedIds, setAddedIds] = useState({});
  const debounceTimeoutRef = useRef(null);

  // Auto-search after typing (debounced by 450ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query.trim());
    }, 450);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [query]);

  const performSearch = (searchQuery) => {
    if (!searchQuery) return;
    setLoading(true);
    setHasSearched(true);

    socket.emit('song:search', { query: searchQuery }, (res) => {
      setLoading(false);
      if (res?.success && res.results) {
        setResults(res.results);
      } else {
        setResults([]);
      }
    });
  };

  const handlePick = (song, playNow) => {
    if (!canControl) return;

    socket.emit('song:pick', { song, playNow });

    if (!playNow) {
      // Mark as added for visual feedback
      setAddedIds((prev) => ({ ...prev, [song.videoId]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [song.videoId]: false }));
      }, 2000);
    } else {
      // If played now, clear search to focus on the player
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }

    onSongPicked?.(song, playNow);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl transition-all">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search any song or artist (e.g. Arijit Singh, Diljit, The Weeknd)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-all shadow-inner"
        />

        {loading ? (
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin absolute right-3.5" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="p-1 rounded-full text-zinc-500 hover:text-white transition-colors absolute right-3"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Search Results Dropdown / Container */}
      {hasSearched && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-semibold text-zinc-400">
              {loading ? 'Searching...' : `Found ${results.length} results`}
            </span>
            <button
              onClick={handleClear}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Close
            </button>
          </div>

          {results.length === 0 && !loading ? (
            <div className="py-6 text-center text-zinc-500 text-xs">
              No matching songs found. Try a different title or artist name.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
              {results.map((song) => {
                const isAdded = addedIds[song.videoId];

                return (
                  <div
                    key={song.videoId}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black relative">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-white truncate group-hover:text-purple-300 transition-colors">
                          {song.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {song.channelTitle}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handlePick(song, true)}
                        disabled={!canControl}
                        className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-all active:scale-95 disabled:opacity-40"
                        title="Play Now for everyone"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => handlePick(song, false)}
                        disabled={!canControl || isAdded}
                        className={`p-2 rounded-xl transition-all active:scale-95 disabled:opacity-40 ${
                          isAdded
                            ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                        }`}
                        title="Add to Up Next Queue"
                      >
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

