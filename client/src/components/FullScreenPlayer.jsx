import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ChevronDown, 
  ListMusic, 
  Heart, 
  Plus, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Radio, 
  Video, 
  Headphones, 
  Trash2, 
  Music2,
  Mic2,
  Disc3,
  Image as ImageIcon,
  BookmarkPlus,
  Check,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatDuration(val) {
  if (typeof val === 'string' && val.includes(':')) return val;
  const sec = Number(val);
  if (isNaN(sec) || !sec) return '3:20';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function FullScreenPlayer() {
  const {
    currentSong,
    playback,
    isFullScreen,
    setIsFullScreen,
    togglePlayPause,
    seekTo,
    nextSong,
    prevSong,
    isLiked,
    toggleLike,
    openAddToPlaylistModal,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    isAudioOnly,
    toggleAudioOnly,
    radioMode,
    toggleRadio,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    queue,
    removeFromQueue,
    clearQueue,
    playSong,
    lyricsState,
    fetchLyrics,
    playingFrom,
    createPlaylist,
    addSongToPlaylist,
    playFromCollection
  } = usePlayer();

  // Desktop active tab: 'upnext' | 'lyrics' | 'related'
  const [rightTab, setRightTab] = useState('upnext');
  // Visual style for left stage: 'art' (YT Music album art) | 'vinyl' (vintage spinning vinyl)
  const [stageStyle, setStageStyle] = useState('art');
  // Mobile active tab: 'upnext' | 'player' | 'lyrics'
  const [mobileTab, setMobileTab] = useState('player');
  // Related recommendations
  const [relatedTracks, setRelatedTracks] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [isSavedPlaylist, setIsSavedPlaylist] = useState(false);

  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Fetch related songs when tab changes to 'related'
  useEffect(() => {
    if (rightTab === 'related' && currentSong?.videoId) {
      setLoadingRelated(true);
      socket.emit('radio:get_tracks', { song: currentSong }, (res) => {
        setLoadingRelated(false);
        if (res?.success && Array.isArray(res.tracks)) {
          setRelatedTracks(res.tracks.filter((t) => t.videoId !== currentSong.videoId).slice(0, 15));
        }
      });
    }
  }, [rightTab, currentSong?.videoId]);

  // Compute active lyric based on playback.currentTime
  const activeLyricIndex = useMemo(() => {
    if (!lyricsState?.lines || lyricsState.lines.length === 0) return -1;
    const curTime = playback.currentTime;
    let active = -1;
    for (let i = 0; i < lyricsState.lines.length; i++) {
      if (lyricsState.lines[i].time <= curTime) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  }, [lyricsState?.lines, playback.currentTime]);

  // Smooth scroll active lyric into center view
  useEffect(() => {
    if ((rightTab === 'lyrics' || mobileTab === 'lyrics') && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex, rightTab, mobileTab]);

  if (!isFullScreen || !currentSong) return null;

  const liked = isLiked(currentSong.videoId);

  const handleSeekChange = (e) => {
    const newTime = Number(e.target.value);
    seekTo(newTime);
  };

  const handleSaveQueueAsPlaylist = () => {
    if (!createPlaylist || !addSongToPlaylist) return;
    const playlistName = playingFrom?.name || `Queue Mix (${new Date().toLocaleDateString()})`;
    const newPl = createPlaylist(playlistName);
    if (newPl) {
      if (currentSong) addSongToPlaylist(newPl.id, currentSong);
      queue.forEach((s) => addSongToPlaylist(newPl.id, s));
      setIsSavedPlaylist(true);
      setTimeout(() => setIsSavedPlaylist(false), 2500);
    }
  };

  const progressPercent = playback.duration > 0
    ? Math.min(100, Math.max(0, (playback.currentTime / playback.duration) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#06070c]/95 backdrop-blur-3xl flex flex-col justify-between overflow-hidden text-white font-body animate-in slide-in-from-bottom duration-300 select-none">
      
      {/* Ambient Blurred Artwork Glow Backdrop */}
      {currentSong.thumbnail && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 z-0">
          <img
            src={currentSong.thumbnail}
            alt=""
            className="w-full h-full object-cover blur-3xl scale-125 transform transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06070c]/90 via-[#06070c]/70 to-[#06070c]/98" />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* TOP HEADER BAR                                             */}
      {/* ───────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={() => setIsFullScreen(false)}
          className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-90"
          title="Collapse player"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Mobile View Switcher (UP NEXT | PLAYER | LYRICS) */}
        <div className="flex lg:hidden items-center gap-1 bg-[#141624] p-1 rounded-full border border-white/10 shadow-inner">
          <button
            type="button"
            onClick={() => setMobileTab('upnext')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              mobileTab === 'upnext'
                ? 'bg-white text-black shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Up Next</span>
            {queue.length > 0 && (
              <span className="text-[10px] bg-black/20 text-current px-1.5 py-0.2 rounded-full">
                {queue.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('player')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              mobileTab === 'player'
                ? 'bg-white text-black shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Player</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('lyrics')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
              mobileTab === 'lyrics'
                ? 'bg-[#9d8df1] text-[#0d0e14] shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
        </div>

        {/* Desktop Brand / Header label */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono tracking-wider uppercase text-white/50">
            Playing: {playingFrom?.name || 'MusicRoom Session'}
          </span>
        </div>

        {/* Right Header: Stage Style Toggle (Art vs Vinyl) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStageStyle((s) => (s === 'art' ? 'vinyl' : 'art'))}
            className="px-3 py-1.5 rounded-full liquid-glass text-xs text-white/80 hover:text-white border border-white/10 flex items-center gap-1.5 active:scale-95 transition-all"
            title="Switch between Album Art and Vinyl Record"
          >
            {stageStyle === 'art' ? (
              <>
                <Disc3 className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Vinyl View</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Cover Art</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────── */}
      {/* MAIN STAGE (DESKTOP 2-COLUMN YOUTUBE MUSIC LAYOUT)         */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-8 py-3 gap-6 sm:gap-10 items-stretch">
        
        {/* ── LEFT COLUMN: ARTWORK / VINYL STAGE ── */}
        <div className={`flex-1 flex flex-col items-center justify-center min-h-0 ${
          mobileTab !== 'player' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {stageStyle === 'art' ? (
            /* YouTube Music Style Square Album Art */
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 max-w-[75vw] max-h-[75vw] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group bg-black/60 flex items-center justify-center">
              <img
                src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt={currentSong.title}
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Live Equalizer Overlay when playing */}
              {playback.isPlaying && (
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full liquid-glass-strong border border-violet-500/30 flex items-center gap-1 shadow-glow-purple">
                  <span className="w-1 bg-violet-400 h-3 rounded-full animate-eq-1" />
                  <span className="w-1 bg-fuchsia-400 h-4 rounded-full animate-eq-2" />
                  <span className="w-1 bg-emerald-400 h-2.5 rounded-full animate-eq-3" />
                  <span className="w-1 bg-cyan-400 h-3.5 rounded-full animate-eq-4" />
                </div>
              )}
            </div>
          ) : (
            /* Spinning Vinyl Record with Tone Arm */
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 max-w-[75vw] max-h-[75vw] aspect-square rounded-full shadow-2xl p-2 liquid-glass flex items-center justify-center">
              {/* Tone Arm Stylus on Top Right */}
              <div className={`absolute -top-3 -right-2 sm:-top-4 sm:-right-3 w-20 h-32 pointer-events-none transition-transform duration-700 origin-top-right z-20 ${
                playback.isPlaying ? 'rotate-[-5deg]' : 'rotate-[-32deg]'
              }`}>
                <div className="absolute top-0 right-0 w-7 h-7 rounded-full bg-neutral-800 border-2 border-white/20 shadow-lg flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/70 shadow" />
                </div>
                <div className="absolute top-4 right-3 w-1.5 h-24 bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-600 rounded-full shadow-md" />
                <div className="absolute bottom-2 right-1.5 w-3.5 h-5 bg-gradient-to-br from-violet-400 to-violet-600 rounded-sm shadow-lg rotate-12 border border-white/30" />
              </div>

              {/* Spinning Vinyl Texture & Center Artwork */}
              <div
                className={`relative w-full h-full rounded-full vinyl-grooves p-6 sm:p-8 flex items-center justify-center shadow-2xl ${
                  playback.isPlaying ? 'animate-[spin_18s_linear_infinite]' : ''
                }`}
              >
                <div className="absolute inset-0 rounded-full vinyl-sheen pointer-events-none opacity-80" />
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-black/80 shadow-2xl z-10 flex items-center justify-center ring-2 ring-white/10">
                  <img
                    src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                    alt={currentSong.title}
                    className="w-full h-full object-cover scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-black/95 border-2 border-neutral-700 flex items-center justify-center shadow-inner">
                      <div className="w-2 h-2 rounded-full bg-white/90 shadow" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Song Info & Quick Actions below Artwork */}
          <div className="mt-4 sm:mt-6 w-full max-w-sm flex items-center justify-between gap-3 px-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-bold text-lg sm:text-2xl text-white truncate leading-tight">
                {currentSong.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/50 truncate font-medium mt-0.5">
                {currentSong.channelTitle || 'YouTube Music'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => toggleLike(currentSong)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-90 hover:bg-white/10"
                title={liked ? "Unlike" : "Like"}
              >
                <Heart
                  className={`w-5 h-5 transition-all ${
                    liked
                      ? 'fill-rose-500 text-rose-500 scale-110'
                      : 'text-white/60 hover:text-white'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => openAddToPlaylistModal(currentSong)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90 hover:bg-white/10"
                title="Add to playlist"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: YOUTUBE MUSIC TABS (UP NEXT | LYRICS | RELATED) ── */}
        <div className={`flex-1 flex flex-col min-h-0 bg-[#0c0e18]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl ${
          mobileTab === 'player' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Top Tabs (UP NEXT | LYRICS | RELATED) */}
          <div className="px-5 pt-3 border-b border-white/10 shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => {
                  setRightTab('upnext');
                  setMobileTab('upnext');
                }}
                className={`text-xs sm:text-sm font-bold tracking-wider uppercase transition-all pb-2.5 relative flex items-center gap-1.5 ${
                  (rightTab === 'upnext' && mobileTab !== 'lyrics') ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span>UP NEXT</span>
                {queue.length > 0 && (
                  <span className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.2 rounded-full font-mono">
                    {queue.length}
                  </span>
                )}
                {(rightTab === 'upnext' && mobileTab !== 'lyrics') && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRightTab('lyrics');
                  setMobileTab('lyrics');
                }}
                className={`text-xs sm:text-sm font-bold tracking-wider uppercase transition-all pb-2.5 relative flex items-center gap-1.5 ${
                  (rightTab === 'lyrics' || mobileTab === 'lyrics') ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span>LYRICS</span>
                {lyricsState.synced && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {(rightTab === 'lyrics' || mobileTab === 'lyrics') && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRightTab('related');
                  setMobileTab('upnext');
                }}
                className={`text-xs sm:text-sm font-bold tracking-wider uppercase transition-all pb-2.5 relative ${
                  rightTab === 'related' && mobileTab !== 'lyrics' ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <span>RELATED</span>
                {rightTab === 'related' && mobileTab !== 'lyrics' && (
                  <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: UP NEXT LIST (Exact YouTube Music Look) */}
          {(mobileTab === 'lyrics' || (rightTab === 'lyrics' && mobileTab !== 'upnext')) ? (
            /* Synchronized Karaoke Lyrics */
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-10 space-y-4 text-center select-text scroll-smooth">
              {lyricsState.loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-16 text-white/50">
                  <div className="w-8 h-8 rounded-full border-2 border-[#9d8df1] border-t-transparent animate-spin" />
                  <p className="text-sm font-medium animate-pulse">Fetching synchronized lyrics...</p>
                </div>
              ) : lyricsState.lines && lyricsState.lines.length > 0 ? (
                lyricsState.lines.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <p
                      key={`lyric-${idx}`}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => line.time !== undefined && seekTo(line.time)}
                      className={`transition-all duration-300 cursor-pointer rounded-2xl px-4 py-2 ${
                        isActive
                          ? 'text-[#9d8df1] font-bold text-lg sm:text-xl scale-105 drop-shadow-[0_0_20px_rgba(157,141,241,0.5)] bg-white/[0.04]'
                          : 'text-white/30 hover:text-white/75 text-sm sm:text-base font-medium hover:scale-102'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-16 text-white/40">
                  <Music2 className="w-10 h-10 stroke-1 text-white/20" />
                  <p className="text-sm font-medium">Lyrics unavailable for this track</p>
                  <button
                    type="button"
                    onClick={() => {
                      setRightTab('upnext');
                      setMobileTab('upnext');
                    }}
                    className="px-4 py-1.5 rounded-full liquid-glass text-xs text-white/80 hover:text-white border border-white/10"
                  >
                    View Up Next Queue
                  </button>
                </div>
              )}
            </div>
          ) : rightTab === 'related' ? (
            /* Related Songs recommendations */
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              <div className="px-1 py-1 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Similar to {currentSong.title}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Radio DJ</span>
              </div>

              {loadingRelated ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3 text-white/40">
                  <div className="w-7 h-7 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <p className="text-xs">Finding similar music...</p>
                </div>
              ) : relatedTracks.map((song, idx) => (
                <div
                  key={`rel-${song.videoId}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-2xl liquid-glass hover:bg-white/10 transition-all group border border-white/5"
                >
                  <div
                    onClick={() => playSong(song, true)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                  >
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-violet-300">
                        {song.title}
                      </p>
                      <p className="text-[10px] text-white/50 truncate mt-0.5">
                        {song.channelTitle || 'YouTube'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => playSong(song, true)}
                    className="w-8 h-8 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow active:scale-90 transition-all shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* UP NEXT: YouTube Music Style Queue (Matching Screenshot) */
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Playing From Header + Save Button */}
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-white/[0.02]">
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">
                    Playing from
                  </span>
                  <h4 className="text-sm font-bold text-white font-heading truncate">
                    {playingFrom?.name || 'Current Session'}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveQueueAsPlaylist}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 active:scale-95 transition-all ${
                      isSavedPlaylist
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                    }`}
                    title="Save this queue as a playlist in your library"
                  >
                    {isSavedPlaylist ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5 text-violet-300" />
                        <span>Save</span>
                      </>
                    )}
                  </button>

                  {queue.length > 0 && (
                    <button
                      type="button"
                      onClick={clearQueue}
                      className="px-2.5 py-1.5 rounded-full text-xs font-mono text-white/40 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-colors"
                      title="Clear Upcoming Queue"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Song List: Currently Playing (Highlighted) + Up Next */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
                
                {/* Currently Playing Card */}
                <div className="p-2.5 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-5 text-center shrink-0">
                      {playback.isPlaying ? (
                        <span className="flex items-center justify-center gap-0.5">
                          <span className="w-0.5 h-3 bg-violet-400 rounded-full animate-eq-1" />
                          <span className="w-0.5 h-4 bg-violet-400 rounded-full animate-eq-2" />
                          <span className="w-0.5 h-2 bg-violet-400 rounded-full animate-eq-3" />
                        </span>
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-white text-white mx-auto" />
                      )}
                    </div>

                    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black shadow border border-white/10">
                      <img
                        src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                        alt={currentSong.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                        {currentSong.title}
                      </h5>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">
                        {currentSong.channelTitle || 'Artist'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-white/40 shrink-0">
                    {formatDuration(playback.duration)}
                  </span>
                </div>

                {/* Up Next Divider */}
                <div className="px-2 pt-2.5 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    Up Next ({queue.length})
                  </span>
                  {radioMode && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Radio Autoplay ON
                    </span>
                  )}
                </div>

                {/* Upcoming Queue Tracks */}
                {queue.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center text-white/40 space-y-2">
                    <Music2 className="w-8 h-8 text-white/20" />
                    <p className="text-xs font-medium text-white/60">Queue is empty</p>
                    <p className="text-[11px] text-white/30 max-w-xs">
                      {radioMode
                        ? 'Endless Radio will automatically pick the next viral track when this song finishes'
                        : 'Select any playlist from Discover or Search to queue up more songs'}
                    </p>
                    {!radioMode && (
                      <button
                        type="button"
                        onClick={toggleRadio}
                        className="mt-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/25 transition-all"
                      >
                        Turn on Radio DJ
                      </button>
                    )}
                  </div>
                ) : (
                  queue.map((song, idx) => (
                    <div
                      key={`queue-${song.videoId}-${idx}`}
                      className="flex items-center justify-between p-2 rounded-xl liquid-glass hover:bg-white/[0.08] transition-all group"
                    >
                      <div
                        onClick={() => {
                          playSong(song, true);
                          removeFromQueue(idx);
                        }}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/60 shadow">
                          <img
                            src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate group-hover:text-violet-300">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-white/50 truncate mt-0.5">
                            {song.channelTitle || 'YouTube'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-white/35">
                          {formatDuration(song.duration)}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            playSong(song, true);
                            removeFromQueue(idx);
                          }}
                          className="w-7 h-7 rounded-full bg-white text-black opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all active:scale-90"
                          title="Play Now"
                        >
                          <Play className="w-3 h-3 fill-black translate-x-0.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromQueue(idx)}
                          className="w-7 h-7 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/30 hover:text-rose-400 flex items-center justify-center transition-all active:scale-90"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* BOTTOM CONTROLS & SCRUBBER (YOUTUBE MUSIC STYLE DOCK)      */}
      {/* ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 px-5 sm:px-8 py-3.5 border-t border-white/[0.08] bg-[#07080e]/95 backdrop-blur-2xl shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          
          {/* Scrubber Bar with live glowing progress */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[11px] font-mono text-white/50 w-10 text-right shrink-0">
              {formatTime(playback.currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max={playback.duration > 0 ? playback.duration : 100}
              value={playback.currentTime || 0}
              onChange={handleSeekChange}
              style={{
                background: `linear-gradient(to right, #8b5cf6 ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`
              }}
              className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-white hover:h-2 transition-all shadow-inner"
            />

            <span className="text-[11px] font-mono text-white/50 w-10 shrink-0">
              {formatTime(playback.duration)}
            </span>
          </div>

          {/* Controls Row: Left Song Info | Center Playback | Right Volume & Mode */}
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Thumbnail & Title */}
            <div className="flex items-center gap-3 w-1/4 min-w-0 hidden sm:flex">
              <img
                src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt={currentSong.title}
                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{currentSong.title}</p>
                <p className="text-[11px] text-white/50 truncate">{currentSong.channelTitle || 'YouTube'}</p>
              </div>
            </div>

            {/* Center: Previous / Play-Pause / Next / Shuffle / Repeat */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-1">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isShuffled ? 'text-purple-400' : 'text-white/40 hover:text-white'
                }`}
                title={isShuffled ? "Shuffle On" : "Shuffle Off"}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={prevSong}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-90"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 fill-white/80" />
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full bg-white text-black hover:bg-white/95 flex items-center justify-center shadow-2xl active:scale-95 transition-all"
                title={playback.isPlaying ? "Pause" : "Play"}
              >
                {playback.isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={nextSong}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-90"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 fill-white/80" />
              </button>

              <button
                type="button"
                onClick={cycleRepeat}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  repeatMode !== 'off' ? 'text-purple-400' : 'text-white/40 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Right: Audio/Video, Radio DJ & Volume */}
            <div className="flex items-center justify-end gap-2.5 w-1/4 shrink-0">
              {/* Audio / Video toggle */}
              <button
                type="button"
                onClick={toggleAudioOnly}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all hidden md:flex items-center gap-1 ${
                  isAudioOnly
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500/40'
                    : 'liquid-glass text-white/70 border-white/10'
                }`}
                title="Toggle Audio / Video"
              >
                {isAudioOnly ? (
                  <>
                    <Headphones className="w-3.5 h-3.5 text-purple-300" />
                    <span>144p</span>
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Video</span>
                  </>
                )}
              </button>

              {/* Radio Autoplay Toggle */}
              <button
                type="button"
                onClick={toggleRadio}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all hidden md:flex items-center gap-1 ${
                  radioMode
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
                    : 'liquid-glass text-white/40 border-white/10'
                }`}
                title="Endless Radio Autoplay"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Radio {radioMode ? 'ON' : 'OFF'}</span>
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="text-white/60 hover:text-white active:scale-90 transition-all"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-14 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}
