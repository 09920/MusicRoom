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
  Music2
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
    setLibrarySubTab,
    setPlaylistModalMode,
    playPlaylist
  } = usePlayer();

  return (
    <aside className="w-56 xl:w-64 shrink-0 border-r border-white/10 p-4 flex flex-col justify-between h-[calc(100vh-80px)] liquid-glass select-none">
      <div className="space-y-6">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-2.5 px-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-heading italic text-white text-base shadow-md group-hover:scale-105 transition-transform">
            m
          </div>
          <span className="font-heading italic text-xl text-white tracking-tight">
            MusicRoom
          </span>
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1">
          {[
            { id: 'discover', label: 'Discover', icon: Compass },
            { id: 'search', label: 'Search', icon: Search },
            { id: 'library', label: 'Library', icon: Library }
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
              Playlists
            </span>
            <button
              type="button"
              onClick={() => setPlaylistModalMode('create')}
              className="text-white/40 hover:text-white p-0.5 rounded transition-colors"
              title="New Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Playlists list */}
          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => {
                  setActiveTab('library');
                  setLibrarySubTab('playlists');
                }}
                className="w-full text-left px-2 py-1.5 rounded-xl text-xs text-white/60 hover:text-purple-300 hover:bg-white/5 truncate block transition-colors"
              >
                • {pl.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-2 pt-2 border-t border-white/5 text-[11px] text-white/30 font-mono">
        MusicRoom v2.0
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
    setIsFullScreen
  } = usePlayer();

  if (!currentSong) return null;

  const liked = isLiked(currentSong.videoId);

  return (
    <footer className="fixed bottom-0 inset-x-0 h-20 z-40 liquid-glass-strong border-t border-white/10 px-5 flex items-center justify-between shadow-2xl backdrop-blur-2xl">
      
      {/* Left: Thumbnail & Title/Artist [❤] */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
        <div
          onClick={() => setIsFullScreen(true)}
          className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg bg-black/60 shrink-0 cursor-pointer group"
        >
          <img
            src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h4
            onClick={() => setIsFullScreen(true)}
            className="text-xs font-semibold text-white truncate cursor-pointer hover:text-purple-300 transition-colors"
          >
            {currentSong.title}
          </h4>
          <p className="text-[11px] text-white/40 truncate font-light mt-0.5">
            {currentSong.channelTitle || 'YouTube'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleLike(currentSong)}
          className="text-white/40 hover:text-rose-400 p-1 rounded-full transition-colors active:scale-90 shrink-0"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-lg">
        {/* Buttons: ⏮ ⏯ ⏭ */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prevSong}
            className="text-white/70 hover:text-white transition-colors active:scale-90"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            {playback.isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={nextSong}
            className="text-white/70 hover:text-white transition-colors active:scale-90"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Scrubber */}
        <div className="flex items-center gap-2.5 w-full">
          <span className="text-[10px] font-mono text-white/40 w-8 text-right">
            {formatTime(playback.currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={playback.duration || 100}
            value={playback.currentTime || 0}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-1.5 transition-all"
          />
          <span className="text-[10px] font-mono text-white/40 w-8">
            {formatTime(playback.duration)}
          </span>
        </div>
      </div>

      {/* Right: Audio/Video, Radio, Volume & Expand */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
        {/* Audio / Video toggle */}
        <button
          type="button"
          onClick={toggleAudioOnly}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
            isAudioOnly
              ? 'bg-purple-600/30 text-purple-200 border-purple-500/40'
              : 'liquid-glass text-white/60 hover:text-white border-white/10'
          }`}
          title="Toggle Audio / Video"
        >
          {isAudioOnly ? '144p Audio' : 'Video'}
        </button>

        {/* Radio toggle */}
        <button
          type="button"
          onClick={toggleRadio}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
            radioMode
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40'
              : 'liquid-glass text-white/40 border-white/10'
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
            className="text-white/60 hover:text-white transition-colors"
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
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>

        {/* Expand to Full Screen */}
        <button
          type="button"
          onClick={() => setIsFullScreen(true)}
          className="text-white/50 hover:text-white p-1 rounded-full transition-colors active:scale-90"
          title="Full screen player"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

    </footer>
  );
}
