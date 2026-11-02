import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Plus, X, Loader2, Check } from 'lucide-react';
import { socket } from '../socket';

export default function SongSearch({ canControl, onSongPicked }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedIds, setAddedIds] = useState({});
  const debounceTimeoutRef = useRef(null);

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
      setAddedIds((prev) => ({ ...prev, [song.videoId]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [song.videoId]: false }));
      }, 2000);
    } else {
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
    <div className="liquid-glass rounded-3xl p-4 sm:p-5 shadow-2xl">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-white/50 absolute left-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Search any song or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 rounded-full liquid-glass text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all font-body"
        />

        {loading ? (
          <Loader2 className="w-4 h-4 text-white/60 animate-spin absolute right-4" />
        ) : query ? (
          <button
            onClick={handleClear}
            className="w-6 h-6 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-colors absolute right-3"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Search Results Dropdown */}
      {hasSearched && (
        <div className="mt-4 pt-3 border-t border-white/10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] font-medium text-white/60 font-body">
              {loading ? 'Searching...' : `Found ${results.length} songs`}
            </span>
            <button
              onClick={handleClear}
              className="text-[11px] text-white/40 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>

          {results.length === 0 && !loading ? (
            <div className="py-6 text-center text-white/40 text-xs font-body">
              No matching songs found. Try a different title or artist name.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
              {results.map((song) => {
                const isAdded = addedIds[song.videoId];

                return (
                  <div
                    key={song.videoId}
                    className="flex items-center justify-between p-2 rounded-2xl liquid-glass hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black relative">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-white truncate group-hover:text-white/90 transition-colors">
                          {song.title}
                        </p>
                        <p className="text-[11px] text-white/50 truncate mt-0.5 font-body">
                          {song.channelTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handlePick(song, true)}
                        disabled={!canControl}
                        className="w-7 h-7 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center transition-all active:scale-90 disabled:opacity-40"
                        title="Play Now for everyone"
                      >
                        <Play className="w-3 h-3 fill-black translate-x-0.5" />
                      </button>

                      <button
                        onClick={() => handlePick(song, false)}
                        disabled={!canControl || isAdded}
                        className={`w-7 h-7 rounded-full liquid-glass flex items-center justify-center transition-all active:scale-90 disabled:opacity-40 ${
                          isAdded
                            ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                            : 'text-white/80 hover:text-white'
                        }`}
                        title="Add to Up Next Queue"
                      >
                        {isAdded ? (
                          <Check className="w-3 h-3 text-emerald-400" />
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
