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
import SessionHistoryModal from '../components/SessionHistoryModal';
import Toast from '../components/Toast';
import TapToJoin from '../components/TapToJoin';
import FadingVideo from '../components/FadingVideo';
import { Shield, Users, MessageSquare, Copy, LogOut, Music2, History } from 'lucide-react';

export default function Room({ initialRoom, currentSocketId, userId, onLeaveRoom }) {
  const [room, setRoom] = useState(initialRoom);
  const [queue, setQueue] = useState(initialRoom?.queue || []);
  const [messages, setMessages] = useState(initialRoom?.messages || []);
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [mobileTab, setMobileTab] = useState('queue');
  const [toasts, setToasts] = useState([]);
  const isHost = room?.hostSocketId === currentSocketId;
  const canControl = room?.hostMode === 'friendly' || isHost;
  const [needsTapToJoin, setNeedsTapToJoin] = useState(!isHost);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [autoMode, setAutoMode] = useState(initialRoom?.autoMode ?? true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const playerRef = useRef(null);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    const handleSynced = (data) => {
      setRoom((prev) => ({
        ...prev,
        playback: {
          isPlaying: data.isPlaying,
          currentTime: data.currentTime,
          lastUpdated: data.lastUpdated
        }
      }));
    };

    const handleSongChanged = (data) => {
      setRoom((prev) => ({
        ...prev,
        currentSong: data.currentSong,
        playback: data.playback,
        playedHistory: data.playedHistory || prev.playedHistory
      }));
    };

    const handleMemberJoined = (data) => {
      setRoom((prev) => ({
        ...prev,
        members: data.members
      }));
      if (data.message) {
        addToast(data.message, 'success');
      }
    };

    const handleMemberLeft = (data) => {
      setRoom((prev) => ({
        ...prev,
        members: data.members
      }));
      if (data.message) {
        addToast(data.message, 'info');
      }
    };

    const handleQueueUpdated = (data) => {
      setQueue(data.queue || []);
    };

    const handleAutoModeUpdated = (data) => {
      setAutoMode(data.autoMode);
    };

    const handleChatMessage = (data) => {
      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    const handleGeneralToast = (data) => {
      addToast(data.message, data.type || 'info');
    };

    const handleHeartbeat = (data) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          playback: {
            ...prev.playback,
            isPlaying: data.isPlaying,
            currentTime: data.currentTime
          }
        };
      });
    };

    const handleConnect = () => {
      if (room?.id) {
        let savedName = '';
        try {
          savedName = localStorage.getItem('musicroom_user_name') || '';
        } catch {}
        socket.emit('room:reconnect', {
          roomId: room.id,
          userId,
          name: savedName
        }, (res) => {
          if (res?.success && res.room) {
            setRoom(res.room);
            setQueue(res.room.queue || []);
          }
        });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('player:synced', handleSynced);
    socket.on('player:song_changed', handleSongChanged);
    socket.on('player:heartbeat', handleHeartbeat);
    socket.on('room:member_joined', handleMemberJoined);
    socket.on('room:member_left', handleMemberLeft);
    socket.on('room:queue_updated', handleQueueUpdated);
    socket.on('room:automode_updated', handleAutoModeUpdated);
    socket.on('chat:message', handleChatMessage);
    socket.on('room:toast', handleGeneralToast);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('player:synced', handleSynced);
      socket.off('player:song_changed', handleSongChanged);
      socket.off('player:heartbeat', handleHeartbeat);
      socket.off('room:member_joined', handleMemberJoined);
      socket.off('room:member_left', handleMemberLeft);
      socket.off('room:queue_updated', handleQueueUpdated);
      socket.off('room:automode_updated', handleAutoModeUpdated);
      socket.off('chat:message', handleChatMessage);
      socket.off('room:toast', handleGeneralToast);
    };
  }, []);

  const handlePlaybackChange = ({ isPlaying }) => {
    setRoom((prev) => {
      if (!prev || prev.playback?.isPlaying === isPlaying) return prev;
      return {
        ...prev,
        playback: {
          ...prev.playback,
          isPlaying
        }
      };
    });
  };

  const handlePlayPause = () => {
    if (!canControl) return;
    const playerState = playerRef.current?.getPlayerState?.();
    const currentlyPlaying = (playerState === 1) || room?.playback?.isPlaying;
    const currentTime = playerRef.current?.getCurrentTime?.() || room?.playback?.currentTime || 0;

    socket.emit('player:control', {
      roomId: room.id,
      action: currentlyPlaying ? 'pause' : 'play',
      currentTime
    });
  };

  const handleSeek = (newTime) => {
    if (!canControl) return;
    socket.emit('player:control', {
      roomId: room.id,
      action: 'seek',
      currentTime: newTime
    });
  };

  const handleSkip = () => {
    if (!canControl) return;
    socket.emit('queue:skip_next', { roomId: room.id });
  };

  const handleToggleAutoMode = () => {
    if (!canControl) return;
    socket.emit('room:toggle_automode', { roomId: room.id });
  };

  const handlePlayQueueItem = (queueId) => {
    if (!canControl) return;
    socket.emit('queue:play_item', { roomId: room.id, queueId });
  };

  const handleRemoveQueueItem = (queueId) => {
    if (!canControl) return;
    socket.emit('queue:remove_item', { roomId: room.id, queueId });
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
    <div className="min-h-screen min-h-[100dvh] bg-black pb-16 font-body relative overflow-x-hidden">
      {/* Subtle Cinematic Video Background */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="fixed inset-0 w-full h-full object-cover opacity-25 pointer-events-none z-0"
      />

      {needsTapToJoin && room.currentSong && (
        <TapToJoin onJoin={handleTapToJoin} roomName={room?.name} />
      )}

      <ImportPlaylistModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count, msg) => addToast(msg || `Added ${count} songs to queue!`, 'success')}
      />

      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={room?.playedHistory || []}
        onPlaySong={(song) => handlePlayQueueItem(song)}
        canControl={canControl}
      />

      <Toast toasts={toasts} />

      <Navbar
        room={room}
        onLeaveRoom={onLeaveRoom}
        onCopyInvite={handleCopyInvite}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={room?.playedHistory?.length || 0}
      />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Stage (2 Columns) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            <Player
              currentSong={room.currentSong}
              playback={room.playback}
              isHost={isHost}
              canControl={canControl}
              onPlaybackChange={handlePlaybackChange}
              onSongEnd={handleSkip}
              volume={volume}
              isMuted={isMuted}
              playerRefOut={playerRef}
              onOpenImport={() => setIsImportModalOpen(true)}
            />

            {/* Song Meta Header */}
            <div className="liquid-glass rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5 font-body">
                  {room.currentSong ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                      Now Playing
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />
                      Session Idle
                    </>
                  )}
                </span>
                <h2 className="text-base sm:text-xl font-heading italic text-white truncate mt-0.5">
                  {room.currentSong?.title || 'No Song Playing'}
                </h2>
                <p className="text-xs text-white/50 truncate font-light font-body">
                  {room.currentSong?.channelTitle || 'Import a playlist to begin'}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 liquid-glass px-3 py-1.5 rounded-full text-xs">
                <span className="text-white/40 font-mono text-[10px]">ROOM:</span>
                <span className="text-white font-mono font-bold">{room.id}</span>
              </div>
            </div>

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

            <SongSearch
              roomId={room?.id}
              canControl={canControl}
              onSongPicked={(song, playNow) => {
                if (playNow) {
                  addToast(`Playing "${song.title}" for everyone`, 'success');
                } else {
                  addToast(`Added "${song.title}" to queue`, 'success');
                }
              }}
            />

            {/* Mobile Segmented Navigation: Queue | Chat | Listeners */}
            <div className="lg:hidden grid grid-cols-3 p-1 liquid-glass rounded-2xl gap-1">
              <button
                onClick={() => setMobileTab('queue')}
                className={`py-2 px-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  mobileTab === 'queue'
                    ? 'bg-white text-black shadow-md font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Music2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Queue ({queue.length})</span>
              </button>

              <button
                onClick={() => setMobileTab('chat')}
                className={`py-2 px-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  mobileTab === 'chat'
                    ? 'bg-white text-black shadow-md font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Chat ({messages.length})</span>
              </button>

              <button
                onClick={() => setMobileTab('members')}
                className={`py-2 px-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  mobileTab === 'members'
                    ? 'bg-white text-black shadow-md font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Listeners ({room.members?.length || 1})</span>
              </button>
            </div>

            {/* Mobile Tab View */}
            <div className="lg:hidden">
              {mobileTab === 'queue' && (
                <QueueList
                  queue={queue}
                  canControl={canControl}
                  autoMode={autoMode}
                  language={room.mood || 'Hindi'}
                  onPlayItem={handlePlayQueueItem}
                  onRemoveItem={handleRemoveQueueItem}
                  onOpenImport={() => setIsImportModalOpen(true)}
                />
              )}

              {mobileTab === 'chat' && (
                <ChatBox
                  roomId={room?.id}
                  messages={messages}
                  currentSocketId={currentSocketId}
                />
              )}

              {mobileTab === 'members' && (
                <div className="space-y-4">
                  <MemberList
                    members={room.members || []}
                    currentSocketId={currentSocketId}
                  />

                  {/* Room Info */}
                  <div className="liquid-glass rounded-3xl p-5 text-xs space-y-2.5">
                    <h4 className="font-heading italic text-base text-white flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-white/70" />
                      Room Information
                    </h4>
                    <div className="flex justify-between py-1 border-b border-white/10 text-white/60 font-body">
                      <span>Control Mode</span>
                      <span className="text-white font-medium capitalize">
                        {room.hostMode === 'friendly' ? '🤝 Friendly (All Control)' : '👑 Single Host Only'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10 text-white/60 font-body">
                      <span>Language</span>
                      <span className="text-white font-medium">{room.mood || 'Hindi'}</span>
                    </div>
                    <div className="flex justify-between py-1 text-white/60 font-body">
                      <span>Protection</span>
                      <span className="text-white font-medium">
                        {room.hasPin ? '🔒 PIN Protected' : '🌐 Open Link'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Share & Safe Leave Widgets */}
                  <div className="liquid-glass-strong rounded-3xl p-5 text-center space-y-3">
                    <div>
                      <p className="text-xs text-white/80 mb-2.5 font-medium font-body">
                        Invite friends to this session
                      </p>
                      <button
                        onClick={handleCopyInvite}
                        className="w-full py-2.5 px-4 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy Shareable Link
                      </button>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <button
                        onClick={onLeaveRoom}
                        className="w-full py-2 px-4 rounded-full liquid-glass border border-rose-500/25 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Leave Session
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Left Column Queue */}
            <div className="hidden lg:block">
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

          </div>

          {/* Desktop Right Column: Tabbed Chat & Listeners */}
          <div className="hidden lg:block space-y-4">

            {/* Sidebar Tabs */}
            <div className="grid grid-cols-2 p-1 liquid-glass rounded-full">
              <button
                onClick={() => setSidebarTab('chat')}
                className={`py-2 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all ${sidebarTab === 'chat'
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat ({messages.length})</span>
              </button>

              <button
                onClick={() => setSidebarTab('members')}
                className={`py-2 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all ${sidebarTab === 'members'
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                  }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Listeners ({room.members?.length || 1})</span>
              </button>
            </div>

            {sidebarTab === 'chat' ? (
              <ChatBox
                roomId={room?.id}
                messages={messages}
                currentSocketId={currentSocketId}
              />
            ) : (
              <MemberList
                members={room.members || []}
                currentSocketId={currentSocketId}
              />
            )}

            {/* Room Info */}
            <div className="liquid-glass rounded-3xl p-5 text-xs space-y-2.5">
              <h4 className="font-heading italic text-base text-white flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-white/70" />
                Room Information
              </h4>

              <div className="flex justify-between py-1 border-b border-white/10 text-white/60 font-body">
                <span>Control Mode</span>
                <span className="text-white font-medium capitalize">
                  {room.hostMode === 'friendly' ? '🤝 Friendly (All Control)' : '👑 Single Host Only'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/10 text-white/60 font-body">
                <span>Language</span>
                <span className="text-white font-medium">{room.mood || 'Hindi'}</span>
              </div>

              <div className="flex justify-between py-1 text-white/60 font-body">
                <span>Protection</span>
                <span className="text-white font-medium">
                  {room.hasPin ? '🔒 PIN Protected' : '🌐 Open Link'}
                </span>
              </div>
            </div>

            {/* Quick Share & Safe Leave Widgets */}
            <div className="liquid-glass-strong rounded-3xl p-5 text-center space-y-3">
              <div>
                <p className="text-xs text-white/80 mb-2.5 font-medium font-body">
                  Invite friends to this session
                </p>
                <button
                  onClick={handleCopyInvite}
                  className="w-full py-2.5 px-4 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Shareable Link
                </button>
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={onLeaveRoom}
                  className="w-full py-2 px-4 rounded-full liquid-glass border border-rose-500/25 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Session
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
