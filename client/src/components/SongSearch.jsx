import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Plus, X, Loader2, Check } from 'lucide-react';
import { socket } from '../socket';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '3:45';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function SongSearch({ roomId, canControl, onSongPicked }) {
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
    }, 400);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [query]);

  const performSearch = (searchQuery) => {
    if (!searchQuery) return;
    setLoading(true);
    setHasSearched(true);

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    socket.emit('song:search', { query: searchQuery }, (res) => {
      clearTimeout(safetyTimer);
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

    // Direct synchronous user gesture to load & play immediately
    if (playNow && typeof window !== 'undefined' && window.musicroom_player) {
      try {
        window.musicroom_player.unMute();
        if (typeof window.musicroom_player.loadVideoById === 'function') {
          window.musicroom_player.loadVideoById({
            videoId: song.videoId,
            startSeconds: 0
          });
        }
        window.musicroom_player.playVideo();
      } catch (_) {}
    }

    socket.emit('song:pick', { roomId, song, playNow });

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
    <div className="bg-surface-container/70 backdrop-blur-xl p-space-md rounded-2xl shadow-md flex flex-col space-y-space-sm border border-outline-variant/15 w-full">
      
      {/* Header (Stitch 2_player.html) */}
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[16px] text-error">smart_display</span>
          YouTube Fast Queue
        </span>
        <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
          Room Synced API
        </span>
      </div>

      {/* Search Input Pill */}
      <div className="relative flex items-center w-full">
        <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-on-surface-variant">search</span>
        <input
          type="text"
          placeholder="Search any song or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-md text-body-md pl-10 pr-9 py-2.5 rounded-full focus:outline-none border border-outline-variant/25 focus:border-secondary transition-colors"
        />

        {loading ? (
          <Loader2 className="w-4 h-4 text-secondary animate-spin absolute right-3.5" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-on-surface-variant hover:text-on-surface transition-colors"
            title="Clear search"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        ) : null}
      </div>

      {/* Search Results Preview Grid */}
      {hasSearched && (
        <div className="mt-2 pt-2 border-t border-outline-variant/15 flex flex-col space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              {loading ? 'Searching YouTube...' : `Found ${results.length} songs`}
            </span>
            <button
              onClick={handleClear}
              className="font-label-sm text-label-sm text-outline hover:text-on-surface transition-colors"
            >
              Dismiss
            </button>
          </div>

          {results.length === 0 && !loading ? (
            <div className="py-6 text-center text-on-surface-variant text-xs">
              No matching songs found. Try a different title or artist name.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {results.map((song) => {
                const isAdded = addedIds[song.videoId];

                return (
                  <div
                    key={song.videoId}
                    className="bg-surface-container-high/90 p-2.5 rounded-xl shadow-lg flex flex-col space-y-2 border border-outline-variant/15 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-space-sm min-w-0">
                      {/* Thumbnail with Duration Stamp */}
                      <div className="relative w-20 h-12 rounded-md overflow-hidden bg-black shrink-0">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-on-surface font-label-sm text-[9px] font-bold">
                          {formatDuration(song.duration)}
                        </span>
                      </div>

                      {/* Meta Details */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <h4 className="font-title-md text-[13px] leading-tight font-bold text-on-surface truncate">
                          {song.title}
                        </h4>
                        <p className="font-body-md text-[11px] text-on-surface-variant truncate mt-0.5">
                          {song.channelTitle || 'YouTube'}
                        </p>
                        <div className="flex items-center gap-1 text-tertiary font-label-sm text-[10px] mt-0.5">
                          <span className="material-symbols-outlined text-[12px]">hd</span>
                          <span>Low Latency Sync</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handlePick(song, true)}
                        disabled={!canControl}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold hover:shadow-[0_0_16px_rgba(208,188,255,0.4)] active:scale-95 transition-all disabled:opacity-40"
                        title="Play Now for all listeners"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_arrow
                        </span>
                        <span>Play Now</span>
                      </button>

                      <button
                        onClick={() => handlePick(song, false)}
                        disabled={!canControl || isAdded}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full font-label-md text-label-md font-semibold active:scale-95 transition-all disabled:opacity-40 ${
                          isAdded
                            ? 'bg-tertiary-container/30 text-tertiary border border-tertiary/40'
                            : 'bg-surface-container-highest text-on-surface hover:bg-surface-bright'
                        }`}
                        title="Add to Up Next Queue"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-tertiary" />
                            <span>Queued</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">add_to_photos</span>
                            <span>Add Queue</span>
                          </>
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
