import React, { useState, useMemo } from 'react';
import { X, Play, Plus, Search, Trophy, Disc3, Sparkles, Music2, Check, Shuffle, BookmarkPlus } from 'lucide-react';
import { getTracksForCompilation } from '../data/topHitsData';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
  if (isNaN(sec) || !sec) return '3:20';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function TracklistModal({
  isOpen,
  onClose,
  compilation,
  onPlaySong,
  onQueueSong,
  onPlayFromCollection,
  currentSong,
  playback
}) {
  const { createPlaylist, addSongToPlaylist, setIsQueueOpen } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [queuedIds, setQueuedIds] = useState(new Set());
  const [isSaved, setIsSaved] = useState(false);

  // Dynamically resolve tracks for this specific playlist/compilation
  const playlistTracks = useMemo(() => {
    return getTracksForCompilation(compilation);
  }, [compilation]);

  const filteredHits = useMemo(() => {
    if (!searchQuery.trim()) return playlistTracks;
    const q = searchQuery.toLowerCase().trim();
    return playlistTracks.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        String(s.rank || '').includes(q)
    );
  }, [searchQuery, playlistTracks]);

  if (!isOpen) return null;

  const collectionName = compilation?.title || 'Featured Playlist';

  const handlePlayIndividual = (hit, idx) => {
    const songIndex = playlistTracks.findIndex((s) => s.videoId === hit.videoId);
    const targetIdx = songIndex >= 0 ? songIndex : idx;

    if (onPlayFromCollection) {
      onPlayFromCollection(
        playlistTracks.map((h) => ({
          videoId: h.videoId,
          title: h.title,
          channelTitle: h.artist || h.channelTitle,
          thumbnail: h.thumbnail,
          duration: h.duration
        })),
        targetIdx,
        collectionName
      );
    } else if (onPlaySong) {
      onPlaySong({
        videoId: hit.videoId,
        title: hit.title,
        channelTitle: hit.artist || hit.channelTitle,
        thumbnail: hit.thumbnail,
        duration: hit.duration
      }, true);
    }

    if (setIsQueueOpen) {
      setIsQueueOpen(true);
    }
  };

  const handleQueueIndividual = (hit) => {
    if (onQueueSong) {
      onQueueSong({
        videoId: hit.videoId,
        title: hit.title,
        channelTitle: hit.artist || hit.channelTitle,
        thumbnail: hit.thumbnail,
        duration: hit.duration
      });
    }
    setQueuedIds((prev) => new Set([...prev, hit.videoId]));
    setTimeout(() => {
      setQueuedIds((prev) => {
        const next = new Set(prev);
        next.delete(hit.videoId);
        return next;
      });
    }, 1800);
  };

  const handlePlayAll = () => {
    if (playlistTracks.length === 0) return;
    if (onPlayFromCollection) {
      onPlayFromCollection(
        playlistTracks.map((h) => ({
          videoId: h.videoId,
          title: h.title,
          channelTitle: h.artist || h.channelTitle,
          thumbnail: h.thumbnail,
          duration: h.duration
        })),
        0,
        collectionName
      );
    }
    if (setIsQueueOpen) setIsQueueOpen(true);
    onClose();
  };

  const handleShufflePlay = () => {
    if (playlistTracks.length === 0) return;
    const shuffled = [...playlistTracks].sort(() => Math.random() - 0.5);
    if (onPlayFromCollection) {
      onPlayFromCollection(
        shuffled.map((h) => ({
          videoId: h.videoId,
          title: h.title,
          channelTitle: h.artist || h.channelTitle,
          thumbnail: h.thumbnail,
          duration: h.duration
        })),
        0,
        `${collectionName} (Shuffled)`
      );
    }
    if (setIsQueueOpen) setIsQueueOpen(true);
    onClose();
  };

  const handleSaveToLibrary = () => {
    if (!createPlaylist || !addSongToPlaylist) return;
    const newPl = createPlaylist(collectionName);
    if (newPl) {
      playlistTracks.forEach((t) => {
        addSongToPlaylist(newPl.id, {
          videoId: t.videoId,
          title: t.title,
          channelTitle: t.artist || t.channelTitle,
          thumbnail: t.thumbnail,
          duration: t.duration
        });
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handlePlayFullMix = () => {
    if (compilation && onPlaySong) {
      onPlaySong(compilation, true);
    }
    onClose();
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[65] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[#0d0e19] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-gradient-to-b from-white/[0.04] to-transparent">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-xl shrink-0 border border-white/15 bg-black">
              <img
                src={compilation?.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider mb-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Curated Playlist</span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white font-heading truncate leading-tight">
                {collectionName}
              </h3>
              <p className="text-xs text-white/50 mt-0.5 truncate">
                {compilation?.channelTitle || 'MusicRoom'} · {playlistTracks.length} Songs · Complete Tracklist
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search Filter Bar */}
        <div className="px-5 py-3 border-b border-white/[0.08] bg-black/30 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePlayAll}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Play All</span>
            </button>

            <button
              type="button"
              onClick={handleShufflePlay}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 text-violet-300" />
              <span>Shuffle</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToLibrary}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 active:scale-95 transition-all ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved to Library</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-violet-300" />
                  <span>Save Playlist</span>
                </>
              )}
            </button>

            {compilation && (
              <button
                type="button"
                onClick={handlePlayFullMix}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 border border-white/5 flex items-center gap-1.5 active:scale-95 transition-all"
                title="Play the single long YouTube compilation video"
              >
                <Disc3 className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden sm:inline">Play Mix</span>
              </button>
            )}
          </div>

          {/* Search in Tracklist */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in playlist..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Ranked Songs List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-1.5 no-scrollbar">
          {filteredHits.length === 0 ? (
            <div className="py-12 text-center text-white/40">
              <Music2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No songs matched "{searchQuery}"</p>
            </div>
          ) : (
            filteredHits.map((hit, idx) => {
              const isPlayingThis = currentSong?.videoId === hit.videoId && playback?.isPlaying;
              const isQueued = queuedIds.has(hit.videoId);

              return (
                <div
                  key={`top-hit-${hit.rank || idx}-${hit.videoId}`}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all group ${
                    isPlayingThis
                      ? 'bg-violet-600/20 border-violet-500/40 shadow-glow-purple'
                      : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                >
                  {/* Left: Rank + Thumbnail + Title/Artist */}
                  <div
                    onClick={() => handlePlayIndividual(hit, idx)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                  >
                    {/* Rank Badge */}
                    <div className="w-6 text-center shrink-0">
                      <span
                        className={`text-xs font-mono font-bold ${
                          hit.rank === 1
                            ? 'text-amber-400'
                            : hit.rank === 2
                            ? 'text-slate-300'
                            : hit.rank === 3
                            ? 'text-amber-600'
                            : 'text-white/40'
                        }`}
                      >
                        #{hit.rank || idx + 1}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 bg-black/60 shadow border border-white/5">
                      <img
                        src={hit.thumbnail}
                        alt={hit.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      {isPlayingThis && (
                        <div className="absolute inset-0 bg-violet-950/70 backdrop-blur-sm flex items-center justify-center gap-0.5">
                          <span className="w-0.5 h-2.5 bg-violet-300 rounded-full animate-eq-1" />
                          <span className="w-0.5 h-3.5 bg-violet-300 rounded-full animate-eq-2" />
                          <span className="w-0.5 h-2 bg-violet-300 rounded-full animate-eq-3" />
                        </div>
                      )}
                    </div>

                    {/* Title & Artist */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight group-hover:text-violet-300 transition-colors font-heading">
                        {hit.title}
                      </h4>
                      <p className="text-[11px] text-white/50 truncate font-medium mt-0.5">
                        {hit.artist || hit.channelTitle}
                      </p>
                    </div>
                  </div>

                  {/* Duration + Actions: Play & Queue */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-white/40 hidden sm:inline">
                      {formatDuration(hit.duration)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleQueueIndividual(hit)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all active:scale-90 ${
                        isQueued
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
                      }`}
                      title="Add to Upcoming Queue"
                    >
                      {isQueued ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px]">Queued</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span className="text-[10px] hidden sm:inline">Queue</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePlayIndividual(hit, idx)}
                      className="w-8 h-8 rounded-xl bg-white text-black hover:bg-white/90 flex items-center justify-center shadow transition-all active:scale-90"
                      title={`Play #${hit.rank || idx + 1}: ${hit.title}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 border-t border-white/[0.08] bg-black/40 text-center">
          <p className="text-[11px] text-white/40">
            Playing any track automatically fills your YouTube Music "Up Next" queue with the rest of this playlist
          </p>
        </div>
      </div>
    </div>
  );
}
