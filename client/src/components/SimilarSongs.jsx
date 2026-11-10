import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Play, RefreshCw, Music2, Check, Radio } from 'lucide-react';

const MOODS = [
  { id: 'all', label: 'All Vibe' },
  { id: 'chill', label: 'Chill 🌙' },
  { id: 'upbeat', label: 'Upbeat 🔥' },
  { id: 'romance', label: 'Romance ❤️' },
  { id: 'discover', label: 'Discover 🚀' }
];

export default function SimilarSongs({
  currentSong,
  roomId,
  canControl = false,
  onAddSong,
  onPlayNow
}) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMood, setActiveMood] = useState('all');
  const [addedIds, setAddedIds] = useState(new Set());

  const videoId = currentSong?.videoId;
  const title = currentSong?.title;
  const channelTitle = currentSong?.channelTitle;

  const fetchSimilar = (mood = activeMood) => {
    if (!videoId && !title) return;
    setLoading(true);

    const query = new URLSearchParams({
      videoId: videoId || '',
      title: title || '',
      artist: channelTitle || '',
      mood: mood
    });

    fetch(`/api/radio?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.tracks)) {
          setTracks(data.tracks);
        } else {
          setTracks([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('[SimilarSongs] Failed to fetch:', err);
        setTracks([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSimilar(activeMood);
  }, [videoId, title, channelTitle, activeMood]);

  const handleAdd = (track) => {
    if (!onAddSong) return;
    onAddSong({
      videoId: track.videoId,
      title: track.title,
      channelTitle: track.channelTitle || track.artist || 'Artist',
      thumbnail: track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`,
      durationSec: track.duration || 215
    });

    setAddedIds((prev) => new Set([...prev, track.videoId]));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(track.videoId);
        return next;
      });
    }, 2000);
  };

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-surface-container-low border border-white/5 min-h-[300px]">
        <Sparkles className="w-8 h-8 text-outline mb-2 opacity-40" />
        <p className="text-xs text-on-surface-variant font-medium">Play a song to see similar recommendations</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl bg-surface-container-low border border-white/5 overflow-hidden shadow-2xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/5 bg-surface-container/60 shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-title-md text-sm font-bold text-on-surface">
            Similar Tracks &amp; Vibe Match
          </h3>
        </div>

        <button
          onClick={() => fetchSimilar(activeMood)}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface p-1.5 rounded-full bg-surface-container-high transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-secondary ${loading ? 'animate-spin' : ''}`} />
          <span className="text-[11px] font-medium pr-1">Refresh</span>
        </button>
      </div>

      {/* Mood Selector Pills */}
      <div className="flex items-center gap-1.5 px-3.5 overflow-x-auto no-scrollbar">
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMood(m.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeMood === m.id
                ? 'bg-primary-container text-on-primary-container border-primary/30 shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant border-white/5 hover:text-on-surface'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Tracks List */}
      <div className="flex-1 overflow-y-auto max-h-[460px] px-3.5 pb-3.5 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center min-h-[260px] space-y-2">
            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
            <p className="text-xs text-on-surface font-semibold">Finding similar songs...</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-on-surface-variant min-h-[220px]">
            <Radio className="w-8 h-8 text-outline mb-2 opacity-50" />
            <p className="text-xs font-semibold text-on-surface">No similar tracks found for this mood</p>
            <p className="text-[11px] text-outline mt-0.5">Try selecting another vibe above or refresh</p>
          </div>
        ) : (
          tracks.map((track) => {
            const isAdded = addedIds.has(track.videoId);

            return (
              <div
                key={track.videoId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high/60 hover:bg-surface-container-high transition-all border border-white/5 group"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest border border-white/10">
                    <img
                      src={track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&q=80';
                      }}
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {track.title}
                    </span>
                    <span className="text-[11px] text-on-surface-variant truncate mt-0.5">
                      {track.artist || track.channelTitle || 'Artist'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 ml-2">
                  {canControl && onPlayNow && (
                    <button
                      onClick={() => onPlayNow(track)}
                      className="p-1.5 rounded-full bg-surface-container hover:bg-surface-bright text-on-surface transition-colors"
                      title="Play Immediately"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}

                  <button
                    onClick={() => handleAdd(track)}
                    disabled={isAdded}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
                      isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary'
                    }`}
                    title="Add to Room Queue"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Queue</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
