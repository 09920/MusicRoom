import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Shuffle, 
  BookmarkPlus, 
  Check, 
  MoreVertical, 
  Heart, 
  Plus, 
  Search, 
  Music2, 
  Share2, 
  SlidersHorizontal,
  Clock,
  Sparkles,
  ListMusic
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTracksForCompilation } from '../data/topHitsData';

function formatDuration(val) {
  if (typeof val === 'string' && val.includes(':')) return val;
  const sec = Number(val);
  if (isNaN(sec) || !sec) return '3:20';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function calculateTotalDuration(tracks) {
  let totalSecs = 0;
  tracks.forEach((t) => {
    if (typeof t.duration === 'number') {
      totalSecs += t.duration;
    } else {
      totalSecs += 200; // ~3.3 mins default
    }
  });
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} minutes`;
}

export default function PlaylistView() {
  const {
    selectedPlaylist,
    setActiveTab,
    playSong,
    playFromCollection,
    currentSong,
    playback,
    togglePlayPause,
    isLiked,
    toggleLike,
    addToQueue,
    createPlaylist,
    addSongToPlaylist,
    openSongMenu
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [queuedIds, setQueuedIds] = useState(new Set());
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'title' | 'artist'

  // If no playlist selected, redirect back to discover
  if (!selectedPlaylist) {
    return (
      <div className="py-20 text-center text-white/50">
        <p>No playlist selected</p>
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="mt-3 px-4 py-2 rounded-full bg-white text-black text-xs font-semibold"
        >
          Return to Discover
        </button>
      </div>
    );
  }

  // Resolve tracks: either custom user playlist `songs` or curated collection
  const allTracks = useMemo(() => {
    if (Array.isArray(selectedPlaylist.songs) && selectedPlaylist.songs.length > 0) {
      return selectedPlaylist.songs;
    }
    return getTracksForCompilation(selectedPlaylist);
  }, [selectedPlaylist]);

  // Filter and sort tracks
  const filteredTracks = useMemo(() => {
    let list = [...allTracks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          ((t.artist || t.channelTitle) && (t.artist || t.channelTitle).toLowerCase().includes(q))
      );
    }
    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist') {
      list.sort((a, b) => (a.artist || a.channelTitle || '').localeCompare(b.artist || b.channelTitle || ''));
    }
    return list;
  }, [allTracks, searchQuery, sortBy]);

  const playlistTitle = selectedPlaylist.title || selectedPlaylist.name || 'Featured Playlist';
  const creatorName = selectedPlaylist.channelTitle || 'MusicRoom Curated';
  const totalDurationStr = calculateTotalDuration(allTracks);

  // Play All: Starts from #1, passes all tracks into `playFromCollection`
  const handlePlayAll = () => {
    if (allTracks.length === 0) return;
    playFromCollection(
      allTracks.map((t) => ({
        videoId: t.videoId,
        title: t.title,
        channelTitle: t.artist || t.channelTitle,
        thumbnail: t.thumbnail,
        duration: t.duration
      })),
      0,
      playlistTitle
    );
  };

  // Shuffle Play
  const handleShufflePlay = () => {
    if (allTracks.length === 0) return;
    const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
    playFromCollection(
      shuffled.map((t) => ({
        videoId: t.videoId,
        title: t.title,
        channelTitle: t.artist || t.channelTitle,
        thumbnail: t.thumbnail,
        duration: t.duration
      })),
      0,
      `${playlistTitle} (Shuffled)`
    );
  };

  // Play specific track in playlist
  const handlePlayTrack = (track, idx) => {
    const songIndex = allTracks.findIndex((t) => t.videoId === track.videoId);
    const targetIdx = songIndex >= 0 ? songIndex : idx;

    playFromCollection(
      allTracks.map((t) => ({
        videoId: t.videoId,
        title: t.title,
        channelTitle: t.artist || t.channelTitle,
        thumbnail: t.thumbnail,
        duration: t.duration
      })),
      targetIdx,
      playlistTitle
    );
  };

  // Save playlist to local Library
  const handleSavePlaylist = () => {
    if (!createPlaylist || !addSongToPlaylist) return;
    const newPl = createPlaylist(playlistTitle);
    if (newPl) {
      allTracks.forEach((t) => {
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

  // Add individual track to queue
  const handleQueueTrack = (track) => {
    addToQueue({
      videoId: track.videoId,
      title: track.title,
      channelTitle: track.artist || track.channelTitle,
      thumbnail: track.thumbnail,
      duration: track.duration
    });
    setQueuedIds((prev) => new Set([...prev, track.videoId]));
    setTimeout(() => {
      setQueuedIds((prev) => {
        const next = new Set(prev);
        next.delete(track.videoId);
        return next;
      });
    }, 1800);
  };

  const isPlaylistPlaying = allTracks.some((t) => t.videoId === currentSong?.videoId) && playback.isPlaying;

  return (
    <div className="space-y-6 pb-28 select-none animate-in fade-in duration-300">
      
      {/* 1. Back Navigation Button (Takes user back to Discover page) */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-all active:scale-95 group shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Discover</span>
        </button>

        <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider hidden sm:inline">
          YouTube Music Experience
        </span>
      </div>

      {/* 2. Main 2-Column YouTube Music Playlist Page Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        
        {/* ── LEFT COLUMN: PLAYLIST COVER, TITLE, CURATOR & ACTION BUTTONS ── */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left lg:sticky lg:top-4 space-y-5">
          
          {/* Large Square Cover Art */}
          <div className="relative w-60 h-60 sm:w-72 sm:h-72 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/70 group">
            <img
              src={selectedPlaylist.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'}
              alt={playlistTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Quick Play Overlay on Cover */}
            <div 
              onClick={handlePlayAll}
              className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-6 h-6 fill-black translate-x-0.5" />
              </div>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="space-y-1.5 w-full">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight leading-tight">
              {playlistTitle}
            </h1>

            {/* Curator Line */}
            <div className="flex items-center justify-center lg:justify-start gap-2 pt-1 text-xs text-white/70">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow">
                m
              </div>
              <span className="font-semibold text-white/90">{creatorName}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/50">Playlist · 2026</span>
            </div>

            {/* Stats line */}
            <p className="text-xs text-white/40 font-mono pt-0.5">
              {allTracks.length} tracks · {totalDurationStr} · Real-time sync
            </p>
          </div>

          {/* Signature YouTube Music Action Buttons ([💾 Bookmark] [▶ Giant Play] [🔀 Shuffle] [⋯]) */}
          <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
            {/* Save to Library Bookmark Button */}
            <button
              type="button"
              onClick={handleSavePlaylist}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all active:scale-90 ${
                isSaved
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-glow-emerald'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
              }`}
              title={isSaved ? "Saved to Library" : "Save Playlist to Library"}
            >
              {isSaved ? (
                <Check className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <BookmarkPlus className="w-5 h-5" />
              )}
            </button>

            {/* Giant Circular White Play Button */}
            <button
              type="button"
              onClick={handlePlayAll}
              className="w-14 h-14 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 flex items-center justify-center shadow-2xl active:scale-95 transition-all"
              title="Play All Tracks"
            >
              {isPlaylistPlaying ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black translate-x-0.5" />
              )}
            </button>

            {/* Shuffle Button */}
            <button
              type="button"
              onClick={handleShufflePlay}
              className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all active:scale-90"
              title="Shuffle Playlist"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* 3-Dot More Menu */}
            <button
              type="button"
              onClick={() => allTracks.length > 0 && openSongMenu(allTracks[0])}
              className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all active:scale-90"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* ── RIGHT COLUMN: YOUTUBE MUSIC TRACKLIST ── */}
        <div className="flex-1 w-full min-w-0 space-y-3">
          
          {/* Tracklist Filter & Sort Header Bar */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
            {/* Sort Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortBy((s) => (s === 'default' ? 'title' : s === 'title' ? 'artist' : 'default'))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white/70 hover:text-white border border-white/10 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-violet-300" />
                <span>Sort: {sortBy === 'default' ? 'Original' : sortBy === 'title' ? 'Title' : 'Artist'}</span>
              </button>
            </div>

            {/* Quick Search Filter */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in playlist..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Songs List */}
          {filteredTracks.length === 0 ? (
            <div className="py-20 text-center text-white/40 flex flex-col items-center">
              <Music2 className="w-10 h-10 text-white/20 mb-2" />
              <p className="text-sm font-medium text-white/60">No songs match "{searchQuery}"</p>
              <p className="text-xs text-white/30 mt-0.5">Try searching for another song or artist</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTracks.map((track, idx) => {
                const isPlayingThis = currentSong?.videoId === track.videoId && playback.isPlaying;
                const liked = isLiked(track.videoId);
                const isQueued = queuedIds.has(track.videoId);

                return (
                  <div
                    key={`track-${track.videoId}-${idx}`}
                    className={`group flex items-center justify-between p-2 sm:p-2.5 rounded-2xl transition-all border ${
                      isPlayingThis
                        ? 'bg-violet-600/20 border-violet-500/40 shadow-glow-purple'
                        : 'bg-transparent hover:bg-white/[0.06] border-transparent'
                    }`}
                  >
                    {/* Left: # Rank / EQ + Thumbnail + Title + Artist */}
                    <div
                      onClick={() => handlePlayTrack(track, idx)}
                      className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer pr-3"
                    >
                      {/* Number or Equalizer wave */}
                      <div className="w-6 text-center shrink-0">
                        {isPlayingThis ? (
                          <span className="flex items-center justify-center gap-0.5">
                            <span className="w-0.5 h-3 bg-violet-400 rounded-full animate-eq-1" />
                            <span className="w-0.5 h-4 bg-violet-400 rounded-full animate-eq-2" />
                            <span className="w-0.5 h-2 bg-violet-400 rounded-full animate-eq-3" />
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-white/40 group-hover:hidden">
                            {idx + 1}
                          </span>
                        )}
                        {/* Hover Play Triangle */}
                        {!isPlayingThis && (
                          <Play className="w-3.5 h-3.5 fill-white text-white mx-auto hidden group-hover:block" />
                        )}
                      </div>

                      {/* Thumbnail */}
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black/60 shadow border border-white/5">
                        <img
                          src={track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>

                      {/* Song Title & Artist Subtitle */}
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs sm:text-sm font-semibold truncate leading-tight transition-colors ${
                          isPlayingThis ? 'text-violet-300' : 'text-white group-hover:text-violet-200'
                        }`}>
                          {track.title}
                        </h4>
                        <p className="text-[11px] text-white/50 truncate font-normal mt-0.5">
                          {track.artist || track.channelTitle || 'Artist'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Duration + Actions ([❤] [＋ Queue] [⋯]) */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Like Heart */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track);
                        }}
                        className="text-white/40 hover:text-rose-400 p-1.5 rounded-full transition-colors active:scale-90 opacity-0 group-hover:opacity-100"
                        title={liked ? "Unlike" : "Like"}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500 opacity-100' : ''}`} />
                      </button>

                      {/* Add to Queue Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQueueTrack(track);
                        }}
                        className="text-white/40 hover:text-white p-1.5 rounded-full transition-colors active:scale-90 opacity-0 group-hover:opacity-100"
                        title="Add to Upcoming Queue"
                      >
                        {isQueued ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>

                      {/* Duration */}
                      <span className="text-[11px] font-mono text-white/40 w-10 text-right">
                        {formatDuration(track.duration)}
                      </span>

                      {/* 3-Dot Menu */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSongMenu(track);
                        }}
                        className="text-white/40 hover:text-white p-1 rounded-full transition-colors active:scale-90 opacity-0 group-hover:opacity-100"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

