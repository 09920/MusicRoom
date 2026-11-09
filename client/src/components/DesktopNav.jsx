import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  Library, 
  ListMusic, 
  Plus, 
  Users, 
  MessageSquare, 
  Send, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Volume2, 
  VolumeX, 
  Radio, 
  Video, 
  Headphones, 
  Maximize2,
  Trash2,
  Music2,
  LayoutGrid,
  Sparkles,
  Download,
  FolderPlus
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

function formatTime(sec) {
  if (isNaN(sec) || sec === null || sec === undefined) return '0:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function DesktopLeftSidebar() {
  const {
    activeTab,
    setActiveTab,
    playlists,
    librarySubTab,
    setLibrarySubTab,
    setPlaylistModalMode,
    playPlaylist,
    openPlaylist,
    activeRoom,
    roomMembers,
    setIsPartyModalOpen,
    setIsImportModalOpen,
    setSelectedMood
  } = usePlayer();

  return (
    <aside className="w-60 xl:w-64 shrink-0 border-r border-white/[0.08] p-4 flex flex-col justify-between h-[calc(100vh-96px)] bg-[#0d0e16]/80 backdrop-blur-2xl select-none">
      <div className="space-y-5 overflow-y-auto pr-1 no-scrollbar">
        {/* Brand: Aether Sound Studio (Stitch Mockup) */}
        <div 
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-3 px-1 py-1 cursor-pointer group"
        >
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDENrmzmKL9KqZ4D7hQkQXZUu9zQC1k3dQg44UK6O7tfFDjbPU-Dj3aLMyhpOWpe9df8vsxGpZZUi7mZDkEHGTlktP4Npdv76h4lkXoAC-p7LqHPdoy2MoAcemcbv0A7vvbvCYrgcys7YWW6lzF0Tcnf_aYKsukYd9iTOtocoSts_udHkz2Zc5-aGdV-GI8c4UZsy_Sngu-PucjzYT2GMRo2zxxiDUxrwdWtmLvFOU" 
            alt="Aether Sound Logo" 
            className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" 
          />
          <div className="flex flex-col">
            <span className="font-headline font-bold text-lg text-white tracking-tight leading-none">
              Aether
            </span>
            <span className="font-mono text-[9px] text-[#4cd7f6] tracking-widest uppercase mt-0.5 font-bold">
              Sound Studio
            </span>
          </div>
        </div>

        {/* Section 1: Main Menu */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#958ea0] font-semibold">
            Menu
          </span>
          <nav className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('discover')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-headline font-semibold transition-all ${
                activeTab === 'discover'
                  ? 'bg-[#a078ff] text-[#340080] shadow-[0_0_16px_rgba(160,120,255,0.35)] font-bold'
                  : 'text-[#cbc3d7] hover:text-white hover:bg-[#1e1f28]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#4cd7f6]" />
              <span>Discover</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('discover');
                setSelectedMood('Trending');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-headline font-semibold text-[#cbc3d7] hover:text-white hover:bg-[#1e1f28] transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Radio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-headline font-semibold transition-all ${
                activeTab === 'search'
                  ? 'bg-[#a078ff] text-[#340080] shadow-[0_0_16px_rgba(160,120,255,0.35)] font-bold'
                  : 'text-[#cbc3d7] hover:text-white hover:bg-[#1e1f28]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Explore Genres</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPartyModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-headline font-semibold text-[#cbc3d7] hover:text-[#4cd7f6] hover:bg-[#1e1f28] transition-all group"
            >
              <Users className="w-4 h-4 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
              <div className="flex items-center justify-between flex-1">
                <span>Live Sessions</span>
                <span className="w-2 h-2 rounded-full bg-[#ff516a] animate-pulse" />
              </div>
            </button>
          </nav>
        </div>

        {/* Section 2: Your Library */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#958ea0] font-semibold">
            Your Library
          </span>
          <nav className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('library');
                setLibrarySubTab('smart-mixes');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-headline font-semibold transition-all ${
                activeTab === 'library' && librarySubTab === 'smart-mixes'
                  ? 'bg-[#a078ff] text-[#340080] shadow-[0_0_16px_rgba(160,120,255,0.35)]'
                  : 'text-[#cbc3d7] hover:text-white hover:bg-[#1e1f28]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#d0bcff]" />
              <span>Made for You</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('library');
                setLibrarySubTab('liked');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-headline font-semibold transition-all ${
                activeTab === 'library' && librarySubTab === 'liked'
                  ? 'bg-[#a078ff] text-[#340080] shadow-[0_0_16px_rgba(160,120,255,0.35)]'
                  : 'text-[#cbc3d7] hover:text-white hover:bg-[#1e1f28]'
              }`}
            >
              <Heart className="w-4 h-4 text-[#ff516a]" />
              <span>Liked Songs</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('library');
                setLibrarySubTab('playlists');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-headline font-semibold transition-all ${
                activeTab === 'library' && librarySubTab === 'playlists'
                  ? 'bg-[#a078ff] text-[#340080] shadow-[0_0_16px_rgba(160,120,255,0.35)]'
                  : 'text-[#cbc3d7] hover:text-white hover:bg-[#1e1f28]'
              }`}
            >
              <ListMusic className="w-4 h-4 text-[#4cd7f6]" />
              <span>Recent Playlists</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-headline font-semibold text-[#cbc3d7] hover:text-white hover:bg-[#1e1f28] transition-all"
            >
              <Download className="w-4 h-4 text-[#a078ff]" />
              <span>Import Playlist</span>
            </button>
          </nav>
        </div>

        {/* Live Collab telemetry strip if room active */}
        {activeRoom && (
          <div className="p-2.5 rounded-xl bg-[#1a1b24] border border-[#a078ff]/30 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#4cd7f6] flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                #{activeRoom.id}
              </span>
              <span className="text-[#cbc3d7]/60">0.12ms sync</span>
            </div>
            <span className="text-[10px] text-[#cbc3d7] block">
              {roomMembers.length} peers connected in-sync
            </span>
          </div>
        )}

        {/* User Playlists */}
        {playlists.length > 0 && (
          <div className="border-t border-white/[0.08] pt-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#958ea0] font-semibold">
                Your Playlists
              </span>
            </div>
            <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => openPlaylist(pl)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#cbc3d7] hover:text-white hover:bg-[#1e1f28] truncate transition-colors flex items-center gap-2"
                >
                  <ListMusic className="w-3.5 h-3.5 text-[#a078ff] shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Playlist Action & Footer */}
      <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setPlaylistModalMode('create')}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-[#1e1f28] hover:bg-[#282933] text-white font-headline text-xs font-semibold transition-all border border-white/5 active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4 text-[#d0bcff]" />
          <span>New Playlist</span>
        </button>

        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-mono text-[#958ea0]">Studio Lossless DAC</span>
          <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" title="192kHz Master Active" />
        </div>
      </div>
    </aside>
  );
}

export function DesktopRightSidebar() {
  const {
    currentSong,
    queue,
    removeFromQueue,
    clearQueue,
    playSong,
    activeRoom,
    roomMembers,
    roomMessages
  } = usePlayer();

  const [chatText, setChatText] = useState('');

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatText.trim() || !activeRoom) return;

    let savedName = '';
    try { savedName = localStorage.getItem('musicroom_user_name') || 'Guest'; } catch {}

    socket.emit('chat:send', {
      roomId: activeRoom.id,
      text: chatText.trim(),
      senderName: savedName
    });
    setChatText('');
  };

  return (
    <aside className="w-72 xl:w-80 shrink-0 border-l border-white/10 p-4 flex flex-col justify-between h-[calc(100vh-80px)] liquid-glass select-none">
      
      {/* Top: Queue Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-purple-400" />
            <h4 className="font-heading italic text-sm text-white">Live Queue</h4>
          </div>
          {queue.length > 0 && (
            <button
              type="button"
              onClick={clearQueue}
              className="text-[10px] text-white/40 hover:text-rose-400 font-mono transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Now Playing */}
        {currentSong && (
          <div className="py-2.5 border-b border-white/5 shrink-0">
            <span className="text-[9px] uppercase font-mono tracking-wider text-purple-400 block mb-1">
              ▶ Now Playing
            </span>
            <div className="flex items-center gap-2.5 p-1.5 rounded-xl bg-white/5">
              <img
                src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                alt=""
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{currentSong.title}</p>
                <p className="text-[10px] text-white/40 truncate">{currentSong.channelTitle}</p>
              </div>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-1 pr-1 min-h-[100px]">
          <span className="text-[9px] uppercase font-mono tracking-wider text-white/30 block mb-1">
            Up Next ({queue.length})
          </span>
          {queue.length === 0 ? (
            <div className="py-8 text-center text-white/30 text-xs font-light">
              Queue is empty
            </div>
          ) : (
            queue.map((song, idx) => (
              <div
                key={`${song.videoId}-${idx}`}
                className="flex items-center justify-between p-1.5 rounded-xl liquid-glass hover:bg-white/5 group text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-white/30 w-3 text-right">
                    {idx + 1}
                  </span>
                  <p className="text-white truncate flex-1">{song.title}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => {
                      playSong(song, true);
                      removeFromQueue(idx);
                    }}
                    className="p-1 text-white hover:text-purple-300"
                    title="Play now"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 text-white/40 hover:text-rose-400"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom: Party Room Chat & Members (Appears when in a room!) */}
      {activeRoom && (
        <div className="border-t border-white/10 pt-2.5 mt-2 flex flex-col h-56 shrink-0">
          <div className="flex items-center justify-between pb-1.5 shrink-0">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Room Chat ({roomMembers.length}👥)</span>
            </span>
            <span className="text-[10px] text-purple-300 font-mono">{activeRoom.id}</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 py-1 text-xs">
            {roomMessages.length === 0 ? (
              <p className="text-center text-white/30 text-[11px] py-4">No messages yet. Say hi!</p>
            ) : (
              roomMessages.map((msg, idx) => (
                <div key={idx} className="p-1.5 rounded-lg bg-white/5 text-[11px]">
                  <span className="font-semibold text-purple-300 block">{msg.senderName}:</span>
                  <span className="text-white/80">{msg.text}</span>
                </div>
              ))
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="flex gap-1 pt-1.5 shrink-0">
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Type message..."
              className="flex-1 px-2.5 py-1.5 rounded-lg liquid-glass text-xs text-white focus:outline-none border border-white/10"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

    </aside>
  );
}

export function DesktopPlayerBar() {
  const {
    currentSong,
    playback,
    togglePlayPause,
    seekTo,
    nextSong,
    prevSong,
    isLiked,
    toggleLike,
    isAudioOnly,
    toggleAudioOnly,
    radioMode,
    toggleRadio,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    setIsFullScreen,
    isQueueOpen,
    setIsQueueOpen,
    queue
  } = usePlayer();

  if (!currentSong) return null;

  const liked = isLiked(currentSong.videoId);
  const progressPercent = playback.duration > 0
    ? Math.min(100, Math.max(0, (playback.currentTime / playback.duration) * 100))
    : 0;

  return (
    <footer className="fixed bottom-3 left-4 right-4 lg:left-[272px] lg:right-6 h-20 max-h-20 z-40 rounded-2xl bg-[#12131c]/95 backdrop-blur-2xl border border-white/[0.08] px-5 flex items-center justify-between shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] select-none">
      
      {/* Left: Thumbnail & Title/Artist [❤] */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[280px] shrink-0 overflow-hidden">
        <div
          onClick={() => setIsFullScreen(true)}
          className={`relative w-[52px] h-[52px] min-w-[52px] min-h-[52px] max-w-[52px] max-h-[52px] rounded-xl overflow-hidden shadow-lg bg-[#0d0e16] shrink-0 aspect-square cursor-pointer group border border-white/10 ${playback.isPlaying ? 'ring-2 ring-[#a078ff]/50 shadow-[0_0_20px_rgba(160,120,255,0.3)]' : ''}`}
        >
          <img
            src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
          {playback.isPlaying && (
            <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/80 px-1 py-0.5 rounded backdrop-blur-sm">
              <span className="w-0.5 h-2 bg-[#4cd7f6] rounded-full animate-eq-1" />
              <span className="w-0.5 h-3 bg-[#4cd7f6] rounded-full animate-eq-2" />
              <span className="w-0.5 h-1.5 bg-[#4cd7f6] rounded-full animate-eq-3" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <h4
            onClick={() => setIsFullScreen(true)}
            className="font-headline text-xs sm:text-sm font-semibold text-white truncate cursor-pointer hover:text-[#d0bcff] transition-colors leading-tight block"
            title={currentSong.title}
          >
            {currentSong.title}
          </h4>
          <p className="font-body text-[11px] text-[#cbc3d7]/60 truncate font-normal mt-0.5 block">
            {currentSong.channelTitle || 'YouTube Music'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleLike(currentSong)}
          className="text-white/40 hover:text-[#ff516a] p-1.5 rounded-full transition-colors active:scale-90 shrink-0 hover:bg-white/5"
          title={liked ? "Liked" : "Like"}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-[#ff516a] text-[#ff516a]' : ''}`} />
        </button>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex flex-col items-center justify-center gap-1 flex-1 max-w-xl px-4 min-w-0">
        {/* Buttons: ⏮ ⏯ ⏭ */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={prevSong}
            className="text-[#cbc3d7] hover:text-white transition-colors active:scale-90"
            title="Previous"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-[#a078ff] text-[#340080] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_16px_rgba(160,120,255,0.45)] shrink-0"
            title={playback.isPlaying ? "Pause" : "Play"}
          >
            {playback.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={nextSong}
            className="text-[#cbc3d7] hover:text-white transition-colors active:scale-90"
            title="Next"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* High-Precision Scrubber */}
        <div className="flex items-center gap-2.5 w-full">
          <span className="text-[10px] font-mono text-[#cbc3d7]/70 w-8 text-right shrink-0">
            {formatTime(playback.currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={playback.duration > 0 ? playback.duration : 100}
            value={playback.currentTime || 0}
            onChange={(e) => seekTo(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #4cd7f6 ${progressPercent}%, rgba(255, 255, 255, 0.12) ${progressPercent}%)`
            }}
            className="flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-[#4cd7f6] hover:h-1.5 transition-all shadow-inner"
          />
          <span className="text-[10px] font-mono text-[#cbc3d7]/70 w-8 shrink-0">
            {formatTime(playback.duration)}
          </span>
        </div>
      </div>

      {/* Right: Audio/Video, Radio, Volume & Expand */}
      <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[200px] shrink-0">
        {/* Spatial Audio / 144p toggle badge */}
        <button
          type="button"
          onClick={toggleAudioOnly}
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border transition-all ${
            isAudioOnly
              ? 'bg-[#a078ff]/20 text-[#d0bcff] border-[#a078ff]/40 shadow-sm'
              : 'bg-[#1a1b24] text-[#cbc3d7] hover:text-white border-white/10'
          }`}
          title="Toggle Stream Mode"
        >
          {isAudioOnly ? 'Lossless Audio' : 'Video Mode'}
        </button>

        {/* Radio toggle */}
        <button
          type="button"
          onClick={toggleRadio}
          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium border transition-all ${
            radioMode
              ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border-[#4cd7f6]/40'
              : 'bg-[#1a1b24] text-[#cbc3d7]/60 border-white/10'
          }`}
          title="Endless Radio"
        >
          Radio {radioMode ? 'ON' : 'OFF'}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="text-[#cbc3d7] hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-[#ff516a]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
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
            className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#4cd7f6]"
          />
        </div>

        {/* Up Next Drawer toggle */}
        <button
          type="button"
          onClick={() => setIsQueueOpen((prev) => !prev)}
          className={`p-1.5 rounded-full transition-all active:scale-90 relative ${
            isQueueOpen
              ? 'bg-[#a078ff] text-[#340080] shadow-[0_0_12px_rgba(160,120,255,0.4)]'
              : 'text-[#cbc3d7] hover:text-white hover:bg-white/10'
          }`}
          title="Up Next (YouTube Music style)"
        >
          <ListMusic className="w-4 h-4" />
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ff516a] text-[9px] font-mono font-bold text-white flex items-center justify-center">
              {queue.length > 9 ? '9+' : queue.length}
            </span>
          )}
        </button>

        {/* Expand to Full Screen */}
        <button
          type="button"
          onClick={() => setIsFullScreen(true)}
          className="text-[#cbc3d7] hover:text-white p-1 rounded-full transition-colors active:scale-90"
          title="Full screen player"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

    </footer>
  );
}

