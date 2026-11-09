import React, { useState } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  LogOut, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  X, 
  MessageSquare, 
  Radio, 
  ArrowRight,
  Headphones
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

export default function PartyModal() {
  const {
    isPartyModalOpen,
    setIsPartyModalOpen,
    activeRoom,
    joinPartyRoom,
    leavePartyRoom,
    roomMembers,
    currentSong,
    setIsChatDrawerOpen
  } = usePlayer();

  const [tab, setTab] = useState('create'); // 'create' | 'join'
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create Form State
  const [createData, setCreateData] = useState(() => {
    let name = '';
    try { name = localStorage.getItem('musicroom_user_name') || ''; } catch {}
    return {
      name: '',
      hostName: name,
      pin: '',
      hostMode: 'friendly',
      mood: 'Hindi'
    };
  });

  // Join Form State
  const [joinData, setJoinData] = useState(() => {
    let name = '';
    try { name = localStorage.getItem('musicroom_user_name') || ''; } catch {}
    return {
      roomId: '',
      name: name,
      pin: ''
    };
  });

  if (!isPartyModalOpen) return null;

  const handleCopyLink = () => {
    if (!activeRoom) return;
    const url = `${window.location.origin}/?room=${activeRoom.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!createData.hostName.trim()) {
      setError('Please enter your name');
      return;
    }
    try { localStorage.setItem('musicroom_user_name', createData.hostName.trim()); } catch {}

    setLoading(true);
    setError('');

    let userId = '';
    try { userId = localStorage.getItem('musicroom_user_id') || ''; } catch {}

    socket.emit('room:create', {
      ...createData,
      userId,
      currentSong: currentSong || null
    }, (res) => {
      setLoading(false);
      if (res?.success && res.room) {
        joinPartyRoom(res.room, res.room.hostSocketId);
      } else {
        setError(res?.error || 'Failed to create party room');
      }
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinData.roomId.trim()) {
      setError('Please enter a room code');
      return;
    }
    if (!joinData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    try { localStorage.setItem('musicroom_user_name', joinData.name.trim()); } catch {}

    setLoading(true);
    setError('');

    let userId = '';
    try { userId = localStorage.getItem('musicroom_user_id') || ''; } catch {}

    // Extract room id from full URL if pasted
    let cleanRoomId = joinData.roomId.trim();
    if (cleanRoomId.includes('room=')) {
      cleanRoomId = cleanRoomId.split('room=')[1].split('&')[0];
    } else if (cleanRoomId.includes('/room/')) {
      cleanRoomId = cleanRoomId.split('/room/')[1].split('?')[0];
    }

    socket.emit('room:join', {
      roomId: cleanRoomId,
      name: joinData.name.trim(),
      pin: joinData.pin.trim(),
      userId
    }, (res) => {
      setLoading(false);
      if (res?.success && res.room) {
        joinPartyRoom(res.room, res.yourSocketId || socket.id);
      } else if (res?.needPin) {
        setError('PIN required. Please enter room PIN.');
      } else {
        setError(res?.error || 'Could not join room. Check the code.');
      }
    });
  };

  return (
    <div
      onClick={() => setIsPartyModalOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl liquid-glass-strong border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading italic text-lg sm:text-xl text-white">
                {activeRoom ? 'Party Room Active' : 'Listen with Friends'}
              </h3>
              <p className="text-[11px] text-white/50 font-body">
                {activeRoom ? `Connected: ${activeRoom.id}` : 'Synchronized real-time listening room'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPartyModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ACTIVE ROOM VIEW */}
        {activeRoom ? (
          <div className="space-y-4 pt-1">
            {/* Room Info Box */}
            <div className="p-3.5 rounded-2xl liquid-glass border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-body">Room Code</span>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-600/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  {activeRoom.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-body">Active Listeners</span>
                <span className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {roomMembers.length} connected
                </span>
              </div>

              {/* Copy Invite Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-semibold flex items-center justify-center gap-2 shadow transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Friend Invite Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Member List Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-white/40 block">In Room Roster</span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {roomMembers.map((m) => (
                  <div
                    key={m.socketId}
                    className="flex items-center justify-between p-2 rounded-xl liquid-glass text-xs"
                  >
                    <span className="text-white/90 font-medium truncate">
                      {m.name} {m.isHost ? '👑' : ''}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Live</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Open Chat Drawer / Leave Room */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsPartyModalOpen(false);
                  setIsChatDrawerOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl liquid-glass hover:bg-white/10 text-xs font-medium text-purple-300 flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Room Chat</span>
              </button>

              <button
                type="button"
                onClick={leavePartyRoom}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 border border-rose-500/30 active:scale-95 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            </div>
          </div>
        ) : (
          /* CREATE OR JOIN ROOM VIEW */
          <div className="space-y-4 pt-1">
            {/* Create vs Join Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl liquid-glass border border-white/5">
              <button
                type="button"
                onClick={() => { setTab('create'); setError(''); }}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  tab === 'create'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Host a Room
              </button>
              <button
                type="button"
                onClick={() => { setTab('join'); setError(''); }}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  tab === 'join'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Join with Code
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {tab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={createData.hostName}
                    onChange={(e) => setCreateData({ ...createData, hostName: e.target.value })}
                    placeholder="e.g. Alex"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Room Name (Optional)</label>
                  <input
                    type="text"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    placeholder="e.g. Midnight Chill Lounge"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">Room Mode</label>
                    <select
                      value={createData.hostMode}
                      onChange={(e) => setCreateData({ ...createData, hostMode: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl liquid-glass text-white text-xs border border-white/10 focus:outline-none"
                    >
                      <option value="friendly" className="bg-slate-900">Anyone can DJ</option>
                      <option value="hostOnly" className="bg-slate-900">Host Only DJ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">PIN (Optional)</label>
                    <input
                      type="password"
                      maxLength={8}
                      value={createData.pin}
                      onChange={(e) => setCreateData({ ...createData, pin: e.target.value })}
                      placeholder="Optional PIN"
                      className="w-full px-3 py-2 rounded-xl liquid-glass text-white text-xs border border-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                {currentSong && (
                  <p className="text-[11px] text-purple-300 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Current song will seamlessly carry into the room!</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Starting Room...' : 'Start Party Room'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-3">
                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Room Code or Invite Link</label>
                  <input
                    type="text"
                    required
                    value={joinData.roomId}
                    onChange={(e) => setJoinData({ ...joinData, roomId: e.target.value })}
                    placeholder="e.g. 53a4-c019-5ae3"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={joinData.name}
                    onChange={(e) => setJoinData({ ...joinData, name: e.target.value })}
                    placeholder="e.g. Rohan"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Room PIN (if required)</label>
                  <input
                    type="password"
                    value={joinData.pin}
                    onChange={(e) => setJoinData({ ...joinData, pin: e.target.value })}
                    placeholder="Leave empty if none"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-white/90 font-semibold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Joining Room...' : 'Join Room'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

