import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';
import Navbar from '../components/Navbar';
import Player from '../components/Player';
import Controls from '../components/Controls';
import MemberList from '../components/MemberList';
import QueueList from '../components/QueueList';
import SongSearch from '../components/SongSearch';
import ChatBox from '../components/ChatBox';
import SyncedLyrics from '../components/SyncedLyrics';
import SimilarSongs from '../components/SimilarSongs';
import ImportPlaylistModal from '../components/ImportPlaylistModal';
import SessionHistoryModal from '../components/SessionHistoryModal';
import Toast from '../components/Toast';
import TapToJoin from '../components/TapToJoin';
import { Shield, Users, MessageSquare, Copy, LogOut, Radio, ListMusic, Crown, Sparkles, Check, Mic2 } from 'lucide-react';

export default function Room({ initialRoom, currentSocketId, userId, onLeaveRoom }) {
  const [room, setRoom] = useState(initialRoom);
  const [queue, setQueue] = useState(initialRoom?.queue || []);
  const [messages, setMessages] = useState(initialRoom?.messages || []);
  const [sidebarTab, setSidebarTab] = useState('chat');
  const [mobileTab, setMobileTab] = useState('player');
  const [activeMediaTab, setActiveMediaTab] = useState('queue'); // 'queue' | 'lyrics' | 'similar'
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const isHost = room?.hostSocketId === currentSocketId;
  const canControl = room?.hostMode === 'friendly' || isHost;
  const [needsTapToJoin, setNeedsTapToJoin] = useState(!isHost);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [autoMode, setAutoMode] = useState(initialRoom?.autoMode ?? true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const playerRef = useRef(null);

  const sidebarTabRef = useRef(sidebarTab);
  const mobileTabRef = useRef(mobileTab);

  useEffect(() => {
    sidebarTabRef.current = sidebarTab;
  }, [sidebarTab]);

  useEffect(() => {
    mobileTabRef.current = mobileTab;
  }, [mobileTab]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  // Persist current room state to localStorage for instantaneous client self-healing
  useEffect(() => {
    if (room?.id) {
      try {
        const snapshot = {
          id: room.id,
          name: room.name,
          pin: room.pin,
          hostMode: room.hostMode,
          mood: room.mood,
          currentSong: room.currentSong,
          playback: room.playback,
          queue,
          playedHistory: room.playedHistory || [],
          autoMode,
          updatedAt: Date.now()
        };
        localStorage.setItem('musicroom_active_room_snapshot', JSON.stringify(snapshot));
      } catch (_) {}
    }
  }, [room?.id, room?.currentSong?.videoId, room?.playback?.isPlaying, queue, autoMode, room?.playedHistory]);

  // Keep-alive heartbeat: ping server every 4 minutes to prevent dyno from sleeping
  useEffect(() => {
    const pingInterval = setInterval(() => {
      fetch('/api/ping').catch(() => {});
    }, 4 * 60 * 1000);

    return () => clearInterval(pingInterval);
  }, []);

  const triggerAutoRecover = () => {
    if (!room?.id) return;
    let savedSnapshot = null;
    try {
      const raw = localStorage.getItem('musicroom_active_room_snapshot');
      if (raw) savedSnapshot = JSON.parse(raw);
    } catch (_) {}

    const snapshot = savedSnapshot || {
      id: room.id,
      name: room.name,
      pin: room.pin,
      hostMode: room.hostMode,
      mood: room.mood,
      currentSong: room.currentSong,
      playback: room.playback,
      queue,
      playedHistory: room.playedHistory || [],
      autoMode
    };

    let savedName = '';
    try {
      savedName = localStorage.getItem('musicroom_user_name') || '';
    } catch (_) {}

    socket.emit('room:auto_recover', {
      roomId: room.id,
      roomSnapshot: {
        ...snapshot,
        hostName: savedName || 'Host',
        userId
      }
    }, (res) => {
      if (res?.success && res.room) {
        setRoom(res.room);
        setQueue(res.room.queue || []);
        addToast('Room connection restored', 'success');
      }
    });
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
        const isChatActive = sidebarTabRef.current === 'chat' || mobileTabRef.current === 'chat';
        if (!isChatActive) {
          setUnreadChatCount((prev) => prev + 1);
        }
      }
    };

    const handleGeneralToast = (data) => {
      if (data?.message === 'Room not found' || data?.message?.includes('not found')) {
        triggerAutoRecover();
        return;
      }
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
          } else {
            triggerAutoRecover();
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

  const handlePlaybackChange = ({ currentTime, duration }) => {
    setRoom((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        playback: {
          ...prev.playback,
          currentTime: typeof currentTime === 'number' ? currentTime : prev.playback.currentTime,
          ...(duration ? { duration } : {})
        }
      };
    });
  };

  const handlePlayPause = () => {
    if (!canControl) return;
    const player = playerRef.current || (typeof window !== 'undefined' ? window.musicroom_player : null);
    const playerState = player?.getPlayerState?.();
    
    // Only consider currently playing if YouTube is actively playing (state === 1).
    // If it's -1 (unstarted), 5 (cued), or 2 (paused), clicking play must START playback!
    const currentlyPlaying = playerState === 1;
    const currentTime = player?.getCurrentTime?.() || room?.playback?.currentTime || 0;

    // Synchronous User Gesture Playback Trigger (CRITICAL for Chrome/Brave Autoplay Policy)
    if (player && typeof player.playVideo === 'function') {
      try {
        if (currentlyPlaying) {
          player.pauseVideo();
        } else {
          player.unMute();
          player.setVolume(volume);
          const playPromise = player.playVideo();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              // Fallback to muted playback if browser restricts audio without prior interaction
              player.mute();
              player.playVideo();
            });
          }
        }
      } catch (err) {
        console.warn('Direct user gesture play failed:', err);
      }
    }

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

  const handlePlayNow = (song) => {
    if (!canControl) return;
    if (typeof window !== 'undefined' && window.musicroom_player) {
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
    socket.emit('song:pick', { roomId: room.id, song, playNow: true });
    addToast(`Streaming "${song.title}"`, 'success');
  };

  const handleRemoveQueueItem = (queueId) => {
    if (!canControl) return;
    socket.emit('queue:remove_item', { roomId: room.id, queueId });
  };

  const handleMoveQueueItem = (queueId, direction) => {
    if (!canControl) return;
    socket.emit('queue:move_item', { roomId: room.id, queueId, direction });
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/?room=${room.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setHasCopied(true);
    addToast('Room invite link copied to clipboard!', 'success');
    setTimeout(() => setHasCopied(false), 2000);
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
    <div className="min-h-screen bg-surface text-on-surface pb-28 font-sans selection:bg-primary-container selection:text-on-primary-container relative overflow-x-hidden">
      {/* Ambient Neon Atmosphere Spotlights */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary-container/20 blur-[80px] pointer-events-none rounded-full" />
      <div className="absolute top-48 right-0 w-64 h-64 bg-secondary/15 blur-[70px] pointer-events-none rounded-full" />
      <div className="absolute bottom-20 left-0 w-60 h-60 bg-tertiary/10 blur-[80px] pointer-events-none rounded-full" />

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
        onPlaySong={(song) => {
          if (!canControl) return;
          socket.emit('player:change_song', { roomId: room.id, song });
        }}
        canControl={canControl}
      />

      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Top Navbar */}
      <Navbar
        room={room}
        onLeaveRoom={onLeaveRoom}
        onCopyInvite={handleCopyInvite}
        onOpenImport={() => setIsImportModalOpen(true)}
        isImportOpen={isImportModalOpen}
        onToggleImport={() => setIsImportModalOpen((prev) => !prev)}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isHistoryOpen={isHistoryOpen}
        historyCount={room?.playedHistory?.length || 0}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Columns (Stage + Search + Queue) */}
          <div className="lg:col-span-2 space-y-5">

            {/* Mobile View Switcher: On mobile, show whichever tab is chosen; on desktop show everything */}
            <div className={`space-y-5 ${mobileTab === 'player' ? 'block' : 'hidden lg:block'}`}>
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
                  if (!playNow) {
                    addToast(`Added "${song.title}" to queue`, 'success');
                  }
                }}
              />
            </div>

            {/* Multi-Panel: Up Next (Queue) | Synced Lyrics | Similar Songs */}
            <div className={`${mobileTab === 'queue' ? 'block' : 'hidden lg:block'} space-y-4`}>
              <div className="grid grid-cols-3 p-1 rounded-2xl bg-surface-container-low border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('queue')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeMediaTab === 'queue'
                      ? 'bg-primary-container text-on-primary-container shadow-[0_2px_12px_rgba(160,120,255,0.35)]'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>Up Next</span>
                  {queue.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary-fixed text-[10px]">
                      {queue.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMediaTab('lyrics')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeMediaTab === 'lyrics'
                      ? 'bg-primary-container text-on-primary-container shadow-[0_2px_12px_rgba(160,120,255,0.35)]'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Mic2 className="w-3.5 h-3.5 text-secondary" />
                  <span>Lyrics</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMediaTab('similar')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    activeMediaTab === 'similar'
                      ? 'bg-primary-container text-on-primary-container shadow-[0_2px_12px_rgba(160,120,255,0.35)]'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Similar</span>
                </button>
              </div>

              {/* Tab 1: Queue / Up Next */}
              {activeMediaTab === 'queue' && (
                <QueueList
                  queue={queue}
                  currentSong={room.currentSong}
                  playback={room.playback}
                  roomId={room.id}
                  canControl={canControl}
                  autoMode={autoMode}
                  language={room.mood || 'Hindi'}
                  onPlayItem={handlePlayQueueItem}
                  onRemoveItem={handleRemoveQueueItem}
                  onMoveItem={handleMoveQueueItem}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onToggleAutoMode={handleToggleAutoMode}
                />
              )}

              {/* Tab 2: Synced Lyrics */}
              {activeMediaTab === 'lyrics' && (
                <SyncedLyrics
                  currentSong={room.currentSong}
                  playback={room.playback}
                  canControl={canControl}
                  onSeek={handleSeek}
                />
              )}

              {/* Tab 3: Similar Songs */}
              {activeMediaTab === 'similar' && (
                <SimilarSongs
                  currentSong={room.currentSong}
                  roomId={room.id}
                  canControl={canControl}
                  onAddSong={(song) => {
                    socket.emit('song:pick', { roomId: room.id, song, playNow: false });
                    addToast(`Added "${song.title}" to queue`, 'success');
                  }}
                  onPlayNow={handlePlayNow}
                />
              )}
            </div>

            {/* Mobile-only Chat View */}
            <div className={`lg:hidden ${mobileTab === 'chat' ? 'block' : 'hidden'}`}>
              <ChatBox
                roomId={room?.id}
                messages={messages}
                currentSocketId={currentSocketId}
                currentSong={room.currentSong}
                hostName={room.hostName || 'Host'}
              />
            </div>

            {/* Mobile-only Listeners View */}
            <div className={`lg:hidden space-y-4 ${mobileTab === 'listeners' ? 'block' : 'hidden'}`}>
              <MemberList
                members={room.members || []}
                currentSocketId={currentSocketId}
              />

              {/* Room Info */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 text-xs space-y-2.5">
                <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  Room Information
                </h4>
                <div className="flex justify-between py-1 border-b border-white/5 text-on-surface-variant">
                  <span>Control Mode</span>
                  <span className="text-on-surface font-semibold capitalize">
                    {room.hostMode === 'friendly' ? '🤝 Collaborative (All Can Control)' : '👑 Single Host Only'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-on-surface-variant">
                  <span>Vibe / Mood</span>
                  <span className="text-on-surface font-semibold">{room.mood || 'Chill'}</span>
                </div>
                <div className="flex justify-between py-1 text-on-surface-variant">
                  <span>Protection</span>
                  <span className="text-on-surface font-semibold">
                    {room.hasPin ? '🔒 PIN Protected' : '🌐 Open Public'}
                  </span>
                </div>
              </div>

              {/* Invite & Leave Actions */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-2.5">
                <button
                  onClick={handleCopyInvite}
                  className="w-full py-2.5 px-4 rounded-full bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                >
                  {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {hasCopied ? 'Link Copied!' : 'Copy Shareable Link'}
                </button>

                <button
                  onClick={onLeaveRoom}
                  className="w-full py-2 px-4 rounded-full bg-surface-container-high border border-rose-500/20 text-rose-400 hover:bg-rose-500/15 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Room
                </button>
              </div>
            </div>

          </div>

          {/* Desktop Right Sidebar: Real-time Presence, Chat & Listeners */}
          <div className="hidden lg:flex flex-col space-y-4">

            {/* Room Meta & Live Sync Status Header */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shrink-0"></span>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-on-surface truncate">
                    {room.name || 'Synchronized Room'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    ID: <span className="text-secondary">{room.id}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-tertiary border border-tertiary/20 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
                <span>ALL SYNCED</span>
              </div>
            </div>

            {/* Horizontal Presence Bar (Scroller with connected users) */}
            <div className="p-2.5 rounded-2xl bg-surface-container-low border border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {room.members?.map((member, idx) => {
                const isYou = member.id === currentSocketId;
                return (
                  <div key={member.id || idx} className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer">
                    <div className="relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                          member.isHost
                            ? 'bg-primary text-on-primary ring-2 ring-primary/40'
                            : 'bg-surface-container-highest text-secondary ring-1 ring-white/10'
                        }`}
                      >
                        {member.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-tertiary border-2 border-surface"></span>
                      {member.isHost && (
                        <span className="absolute -top-1 -left-1 px-1 py-0.2 rounded-full bg-on-primary-fixed text-primary-fixed text-[8px] font-bold flex items-center">
                          HOST
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-on-surface-variant truncate max-w-[56px] text-center">
                      {isYou ? 'You' : member.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Segmented View Toggle: Chat vs Listeners */}
            <div className="grid grid-cols-2 p-1 rounded-full bg-surface-container-low border border-white/5">
              <button
                onClick={() => {
                  setSidebarTab('chat');
                  setUnreadChatCount(0);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 ${
                  sidebarTab === 'chat'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_12px_rgba(160,120,255,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat</span>
                {unreadChatCount > 0 && sidebarTab !== 'chat' && (
                  <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[10px]">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab('members')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-semibold transition-all duration-200 ${
                  sidebarTab === 'members'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_2px_12px_rgba(160,120,255,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Listeners</span>
                <span className="px-1.5 py-0.2 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px]">
                  {room.members?.length || 1}
                </span>
              </button>
            </div>

            {/* Tabbed Content */}
            {sidebarTab === 'chat' ? (
              <ChatBox
                roomId={room?.id}
                messages={messages}
                currentSocketId={currentSocketId}
                currentSong={room.currentSong}
                hostName={room.hostName || 'Host'}
              />
            ) : (
              <MemberList
                members={room.members || []}
                currentSocketId={currentSocketId}
              />
            )}

            {/* Room Info */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 text-xs space-y-2.5">
              <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                Room Information
              </h4>

              <div className="flex justify-between py-1 border-b border-white/5 text-on-surface-variant">
                <span>Control Mode</span>
                <span className="text-on-surface font-semibold capitalize">
                  {room.hostMode === 'friendly' ? '🤝 Collaborative (All Can Control)' : '👑 Single Host Only'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-white/5 text-on-surface-variant">
                <span>Vibe / Mood</span>
                <span className="text-on-surface font-semibold">{room.mood || 'Chill'}</span>
              </div>

              <div className="flex justify-between py-1 text-on-surface-variant">
                <span>Protection</span>
                <span className="text-on-surface font-semibold">
                  {room.hasPin ? '🔒 PIN Protected' : '🌐 Open Public'}
                </span>
              </div>
            </div>

            {/* Quick Share & Safe Leave Action Buttons */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-2.5">
              <button
                onClick={handleCopyInvite}
                className="w-full py-2.5 px-4 rounded-full bg-primary text-on-primary hover:bg-primary-container text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
              >
                {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {hasCopied ? 'Link Copied!' : 'Copy Shareable Link'}
              </button>

              <button
                onClick={onLeaveRoom}
                className="w-full py-2 px-4 rounded-full bg-surface-container-high border border-rose-500/20 text-rose-400 hover:bg-rose-500/15 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                Leave Room
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Fixed Mobile Bottom Navigation matching Stitch 7954158057130757842 */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">
        <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
          {/* Lobby button */}
          <button
            onClick={onLeaveRoom}
            className="flex flex-col items-center justify-center gap-1 min-w-[56px] text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <LogOut className="w-5 h-5 rotate-180" />
            <span className="text-[11px] font-medium">Lobby</span>
          </button>

          {/* Player Tab */}
          <button
            onClick={() => setMobileTab('player')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all duration-200 ${
              mobileTab === 'player'
                ? 'text-secondary drop-shadow-[0_0_8px_rgba(76,215,246,0.6)] font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Radio className="w-5 h-5" />
            <span className="text-[11px]">Player</span>
          </button>

          {/* Queue Tab */}
          <button
            onClick={() => setMobileTab('queue')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all duration-200 ${
              mobileTab === 'queue'
                ? 'text-secondary drop-shadow-[0_0_8px_rgba(76,215,246,0.6)] font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <div className="relative">
              <ListMusic className="w-5 h-5" />
              {queue.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary text-on-primary text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </div>
            <span className="text-[11px]">Queue</span>
          </button>

          {/* Chat Tab */}
          <button
            onClick={() => {
              setMobileTab('chat');
              setUnreadChatCount(0);
            }}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all duration-200 ${
              mobileTab === 'chat'
                ? 'text-secondary drop-shadow-[0_0_8px_rgba(76,215,246,0.6)] font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              {unreadChatCount > 0 && mobileTab !== 'chat' && (
                <span className="absolute -top-1 -right-2 bg-primary text-on-primary text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </div>
            <span className="text-[11px]">Chat</span>
          </button>

          {/* Listeners Tab */}
          <button
            onClick={() => setMobileTab('listeners')}
            className={`flex flex-col items-center justify-center gap-1 min-w-[56px] transition-all duration-200 ${
              mobileTab === 'listeners'
                ? 'text-secondary drop-shadow-[0_0_8px_rgba(76,215,246,0.6)] font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[11px]">Listeners</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
