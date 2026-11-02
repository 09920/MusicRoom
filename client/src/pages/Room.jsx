import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import Navbar from '../components/Navbar';
import Player from '../components/Player';
import Controls from '../components/Controls';
import MemberList from '../components/MemberList';
import QueueList from '../components/QueueList';
import SongSearch from '../components/SongSearch';
import ChatBox from '../components/ChatBox';
import ImportPlaylistModal from '../components/ImportPlaylistModal';
import Toast from '../components/Toast';
import TapToJoin from '../components/TapToJoin';
import { Music, Shield, Sparkles, Globe, ListMusic, Users, MessageSquare } from 'lucide-react';

export default function Room({ initialRoom, currentSocketId, onLeaveRoom }) {
  const [room, setRoom] = useState(initialRoom);
  const [queue, setQueue] = useState(initialRoom?.queue || []);
  const [messages, setMessages] = useState(initialRoom?.messages || []);
  const [sidebarTab, setSidebarTab] = useState('chat'); // 'chat' or 'members'
  const [toasts, setToasts] = useState([]);
  const [needsTapToJoin, setNeedsTapToJoin] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [autoMode, setAutoMode] = useState(initialRoom?.autoMode ?? true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const playerRef = useRef(null);

  // Toast Helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const isHost = room?.hostSocketId === currentSocketId;
  const canControl = room?.hostMode === 'friendly' || isHost;

  // Listen to socket room events
  useEffect(() => {
    // 1. Playback synced
    const handleSynced = (data) => {
      setRoom((prev) => ({
        ...prev,
        playback: {
          isPlaying: data.isPlaying,
          currentTime: data.currentTime,
          lastUpdated: data.lastUpdated
        }
      }));

      if (data.actorName) {
        const actionVerb = data.action === 'play' ? 'resumed' : data.action === 'pause' ? 'paused' : 'scrubbed';
        addToast(`${data.actorName} ${actionVerb} the music`, 'info');
      }
    };

    // 2. Song changed
    const handleSongChanged = (data) => {
      setRoom((prev) => ({
        ...prev,
        currentSong: data.currentSong,
        playback: data.playback
      }));
      addToast(`Now playing: ${data.currentSong.title}`, 'info');
    };

    // 3. Member joined
    const handleMemberJoined = (data) => {
      setRoom((prev) => ({
        ...prev,
        members: data.members
      }));
      addToast(data.message, 'success');
    };

    // 4. Member left
    const handleMemberLeft = (data) => {
      setRoom((prev) => ({
        ...prev,
        members: data.members
      }));
      addToast(data.message, 'info');
    };

    // 5. Queue updated
    const handleQueueUpdated = (data) => {
      setQueue(data.queue || []);
      if (data.message) {
        addToast(data.message, 'success');
      }
    };

    // 6. AutoMode updated
    const handleAutoModeUpdated = (data) => {
      setAutoMode(data.autoMode);
      if (data.message) {
        addToast(data.message, 'info');
      }
    };

    // 7. Chat message received
    const handleChatMessage = (data) => {
      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    // 8. General Toast
    const handleGeneralToast = (data) => {
      addToast(data.message, data.type || 'info');
    };

    socket.on('player:synced', handleSynced);
    socket.on('player:song_changed', handleSongChanged);
    socket.on('room:member_joined', handleMemberJoined);
    socket.on('room:member_left', handleMemberLeft);
    socket.on('room:queue_updated', handleQueueUpdated);
    socket.on('room:automode_updated', handleAutoModeUpdated);
    socket.on('chat:message', handleChatMessage);
    socket.on('room:toast', handleGeneralToast);

    return () => {
      socket.off('player:synced', handleSynced);
      socket.off('player:song_changed', handleSongChanged);
      socket.off('room:member_joined', handleMemberJoined);
      socket.off('room:member_left', handleMemberLeft);
      socket.off('room:queue_updated', handleQueueUpdated);
      socket.off('room:automode_updated', handleAutoModeUpdated);
      socket.off('chat:message', handleChatMessage);
      socket.off('room:toast', handleGeneralToast);
    };
  }, []);

  // Controls Handlers
  const handlePlayPause = () => {
    if (!canControl) return;
    const isPlaying = room.playback.isPlaying;
    const currentTime = playerRef.current?.getCurrentTime?.() || room.playback.currentTime;

    socket.emit('player:control', {
      action: isPlaying ? 'pause' : 'play',
      currentTime
    });
  };

  const handleSeek = (newTime) => {
    if (!canControl) return;
    socket.emit('player:control', {
      action: 'seek',
      currentTime: newTime
    });
  };

  const handleSkip = () => {
    if (!canControl) return;
    socket.emit('queue:skip_next');
  };

  const handleToggleAutoMode = () => {
    if (!canControl) return;
    socket.emit('room:toggle_automode');
  };

  const handlePlayQueueItem = (queueId) => {
    if (!canControl) return;
    socket.emit('queue:play_item', { queueId });
  };

  const handleRemoveQueueItem = (queueId) => {
    if (!canControl) return;
    socket.emit('queue:remove_item', { queueId });
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/?room=${room.id}`;
    navigator.clipboard.writeText(inviteUrl);
    addToast('Room invite link copied to clipboard!', 'success');
  };

  const handleTapToJoin = () => {
    setNeedsTapToJoin(false);
    if (playerRef.current) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        if (room.playback.isPlaying) {
          playerRef.current.playVideo();
        }
      } catch (err) {
        console.error('Tap to join error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] pb-12">
      {/* Tap to Join Modal only shown when music is actually playing */}
      {needsTapToJoin && room.currentSong && (
        <TapToJoin onJoin={handleTapToJoin} roomName={room?.name} />
      )}

      {/* Import Playlist Modal */}
      <ImportPlaylistModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count) => addToast(`Successfully added ${count} songs to queue!`, 'success')}
      />

      {/* Floating Notifications */}
      <Toast toasts={toasts} />

      {/* Top Navbar */}
      <Navbar
        room={room}
        onLeaveRoom={onLeaveRoom}
        onCopyInvite={handleCopyInvite}
        onOpenImport={() => setIsImportModalOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Stage: Player, Controls & Queue (2 Columns) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* The Synced YouTube Embed Player */}
            <Player
              currentSong={room.currentSong}
              playback={room.playback}
              isHost={isHost}
              canControl={canControl}
              onSongEnd={handleSkip}
              volume={volume}
              isMuted={isMuted}
              playerRefOut={playerRef}
              onOpenImport={() => setIsImportModalOpen(true)}
            />

            {/* Song Meta Header */}
            <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  {room.currentSong ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      Now Playing
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-zinc-500 inline-block" />
                      Waiting for Music
                    </>
                  )}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                  {room.currentSong?.title || 'No Song Playing'}
                </h2>
                <p className="text-xs text-zinc-400 truncate">
                  {room.currentSong?.channelTitle || 'Add songs via Import Playlist'}
                </p>
              </div>

              {/* Room Code Badge */}
              <div className="shrink-0 flex items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
                <span className="text-zinc-500 font-mono">ROOM:</span>
                <span className="text-purple-300 font-mono font-bold">{room.id}</span>
              </div>
            </div>

            {/* Synchronized Playback Controls */}
            <Controls
              playback={room.playback}
              currentSong={room.currentSong}
              canControl={canControl}
              hostMode={room.hostMode}
              isHost={isHost}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSkip={handleSkip}
              volume={volume}
              setVolume={setVolume}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              autoMode={autoMode}
              onToggleAutoMode={handleToggleAutoMode}
              playerRef={playerRef}
            />

            {/* Song Search Component */}
            <SongSearch
              canControl={canControl}
              onSongPicked={(song, playNow) => {
                if (playNow) {
                  addToast(`Playing "${song.title}" for everyone`, 'success');
                } else {
                  addToast(`Added "${song.title}" to queue`, 'success');
                }
              }}
            />

            {/* Queue & Up Next Section */}
            <QueueList
              queue={queue}
              canControl={canControl}
              autoMode={autoMode}
              language={room.mood || 'Hindi'}
              onPlayItem={handlePlayQueueItem}
              onRemoveItem={handleRemoveQueueItem}
              onOpenImport={() => setIsImportModalOpen(true)}
            />

          </div>

          {/* Right Column: Tabbed Chat & Listeners List */}
          <div className="space-y-4">
            
            {/* Sidebar Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl">
              <button
                onClick={() => setSidebarTab('chat')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  sidebarTab === 'chat'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat ({messages.length})</span>
              </button>

              <button
                onClick={() => setSidebarTab('members')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  sidebarTab === 'members'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Listeners ({room.members?.length || 1})</span>
              </button>
            </div>

            {/* Active Tab Content */}
            {sidebarTab === 'chat' ? (
              <ChatBox
                messages={messages}
                currentSocketId={currentSocketId}
              />
            ) : (
              <MemberList
                members={room.members || []}
                currentSocketId={currentSocketId}
              />
            )}

            {/* Room Info Card */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 text-xs space-y-2.5">
              <h4 className="font-semibold text-zinc-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Room Information
              </h4>
              
              <div className="flex justify-between py-1 border-b border-zinc-800/60 text-zinc-400">
                <span>Control Mode</span>
                <span className="text-zinc-200 font-medium capitalize">
                  {room.hostMode === 'friendly' ? '🤝 Friendly (All Control)' : '👑 Single Host Only'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-800/60 text-zinc-400">
                <span>Language</span>
                <span className="text-purple-300 font-medium">{room.mood || 'Hindi'}</span>
              </div>

              <div className="flex justify-between py-1 text-zinc-400">
                <span>Protection</span>
                <span className="text-zinc-200 font-medium">
                  {room.hasPin ? '🔒 PIN Protected' : '🌐 Open Link'}
                </span>
              </div>
            </div>

            {/* Quick Share Widget */}
            <div className="bg-gradient-to-br from-purple-950/30 to-zinc-900 border border-purple-800/30 rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-300 mb-2 font-medium">
                Want friends to join the session?
              </p>
              <button
                onClick={handleCopyInvite}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Copy Invite Link
              </button>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
