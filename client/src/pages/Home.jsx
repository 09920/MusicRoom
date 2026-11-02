import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  KeyRound, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Music2, 
  Users 
} from 'lucide-react';
import { socket } from '../socket';

const LANGUAGES = [
  { id: 'Hindi', label: '🇮🇳 Hindi' },
  { id: 'English', label: '🌐 English' },
  { id: 'Other Languages', label: '🌍 Other Languages' }
];

export default function Home({ onRoomJoined, initialRoomId }) {
  const [tab, setTab] = useState(initialRoomId ? 'join' : 'create');

  const [createData, setCreateData] = useState({
    name: '',
    hostName: '',
    pin: '',
    hostMode: 'friendly',
    mood: 'Hindi'
  });

  const [joinData, setJoinData] = useState({
    roomId: initialRoomId || '',
    name: '',
    pin: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRoomId) {
      setJoinData(prev => ({ ...prev, roomId: initialRoomId }));
      setTab('join');
    }
  }, [initialRoomId]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!createData.hostName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit('room:create', createData, (res) => {
      setLoading(false);
      if (res?.success && res.room) {
        onRoomJoined(res.room, res.room.hostSocketId);
      } else {
        setError(res?.error || 'Failed to create room. Please try again.');
      }
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinData.roomId.trim()) {
      setError('Please enter a room code or link');
      return;
    }
    if (!joinData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    let cleanRoomId = joinData.roomId.trim();
    if (cleanRoomId.includes('/')) {
      const parts = cleanRoomId.split('/');
      cleanRoomId = parts[parts.length - 1];
    }
    if (cleanRoomId.includes('=')) {
      cleanRoomId = cleanRoomId.split('=').pop();
    }

    setLoading(true);
    setError('');

    socket.emit('room:join', {
      roomId: cleanRoomId,
      name: joinData.name,
      pin: joinData.pin
    }, (res) => {
      setLoading(false);
      if (res?.success && res.room) {
        onRoomJoined(res.room, res.yourSocketId);
      } else {
        setError(res?.error || 'Failed to join room. Check code or PIN.');
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center px-4 py-12 max-w-5xl mx-auto">
      
      {/* Cinematic Badge Chip */}
      <div className="liquid-glass rounded-full px-1.5 py-1 pr-4 inline-flex items-center gap-2.5 mb-6 shadow-2xl">
        <span className="bg-white text-black text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          Live Sync
        </span>
        <span className="text-xs text-white/90 font-medium">
          Collaborative Music Sessions with Friends
        </span>
      </div>

      {/* Hero Headline in Instrument Serif */}
      <div className="text-center mb-8 max-w-3xl">
        <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.9] tracking-[-3px] mb-4">
          Listen together, in perfect sync.
        </h1>
        <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto font-body font-light leading-relaxed">
          No signups, no audio uploads. Create a private room in 1-click, share the link with friends, and hear every beat at the exact same second.
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md liquid-glass-strong rounded-[2rem] p-6 sm:p-8 shadow-2xl relative">
        
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 liquid-glass rounded-full mb-6">
          <button
            onClick={() => { setTab('create'); setError(''); }}
            className={`py-2 text-xs sm:text-sm font-medium rounded-full transition-all ${
              tab === 'create'
                ? 'bg-white text-black shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => { setTab('join'); setError(''); }}
            className={`py-2 text-xs sm:text-sm font-medium rounded-full transition-all ${
              tab === 'join'
                ? 'bg-white text-black shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Join Room
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Tab 1: Create Room */}
        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
                Your Nickname <span className="text-white/40">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={createData.hostName}
                onChange={(e) => setCreateData({ ...createData, hostName: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-full liquid-glass text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
                Room Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Midnight Sessions"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-full liquid-glass text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
                Language Preference
              </label>
              <select
                value={createData.mood}
                onChange={(e) => setCreateData({ ...createData, mood: e.target.value })}
                className="w-full px-4 py-2.5 rounded-full liquid-glass text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all cursor-pointer bg-black/90"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id} className="bg-black text-white">{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Host Mode Selection */}
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
                Control Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreateData({ ...createData, hostMode: 'friendly' })}
                  className={`p-2.5 rounded-2xl text-left transition-all ${
                    createData.hostMode === 'friendly'
                      ? 'liquid-glass bg-white/10 ring-1 ring-white/50 text-white'
                      : 'liquid-glass text-white/60 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-white" />
                    Friendly
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5 leading-tight font-body">Anyone can control</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateData({ ...createData, hostMode: 'single' })}
                  className={`p-2.5 rounded-2xl text-left transition-all ${
                    createData.hostMode === 'single'
                      ? 'liquid-glass bg-white/10 ring-1 ring-white/50 text-white'
                      : 'liquid-glass text-white/60 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    Host Only
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5 leading-tight font-body">Only host controls</p>
                </button>
              </div>
            </div>

            {/* Room PIN */}
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
                Room PIN (Optional)
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Leave empty for public link"
                  value={createData.pin}
                  onChange={(e) => setCreateData({ ...createData, pin: e.target.value })}
                  className="w-full px-4 py-2.5 pl-9 rounded-full liquid-glass text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all"
                />
                <KeyRound className="w-4 h-4 text-white/40 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-white text-black hover:bg-white/90 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating Room...' : 'Start Session'}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Tab 2: Join Room */
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
                Room Link or ID <span className="text-white/40">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. a8f3-91cd-77b2"
                value={joinData.roomId}
                onChange={(e) => setJoinData({ ...joinData, roomId: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-full liquid-glass text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
                Your Nickname <span className="text-white/40">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Maya"
                value={joinData.name}
                onChange={(e) => setJoinData({ ...joinData, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-full liquid-glass text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
                Room PIN (if required)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter PIN if host set one"
                  value={joinData.pin}
                  onChange={(e) => setJoinData({ ...joinData, pin: e.target.value })}
                  className="w-full px-4 py-2.5 pl-9 rounded-full liquid-glass text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-purple-500 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all"
                />
                <KeyRound className="w-4 h-4 text-white/40 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-white text-black hover:bg-white/90 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Joining Room...' : 'Enter Session'}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>

      {/* Stats / Highlight row */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-center">
        <div className="liquid-glass rounded-2xl p-4 w-[160px]">
          <p className="font-heading italic text-2xl text-white">0s Latency</p>
          <p className="text-[11px] text-white/60 font-body mt-1">Live WebSocket Sync</p>
        </div>
        <div className="liquid-glass rounded-2xl p-4 w-[160px]">
          <p className="font-heading italic text-2xl text-white">Ad-Free</p>
          <p className="text-[11px] text-white/60 font-body mt-1">Optimized for Brave</p>
        </div>
        <div className="liquid-glass rounded-2xl p-4 w-[160px]">
          <p className="font-heading italic text-2xl text-white">Auto Radio</p>
          <p className="text-[11px] text-white/60 font-body mt-1">Continuous Playback</p>
        </div>
      </div>

    </div>
  );
}
