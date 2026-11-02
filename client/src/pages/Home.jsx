import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Users, 
  Sparkles, 
  Radio, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Flame 
} from 'lucide-react';
import { socket } from '../socket';

const LANGUAGES = [
  { id: 'Hindi', label: '🇮🇳 Hindi' },
  { id: 'English', label: '🌐 English' },
  { id: 'Other Languages', label: '🌍 Other Languages' }
];

export default function Home({ onRoomJoined, initialRoomId }) {
  const [tab, setTab] = useState(initialRoomId ? 'join' : 'create');

  // Create Form State
  const [createData, setCreateData] = useState({
    name: '',
    hostName: '',
    pin: '',
    hostMode: 'friendly', // 'friendly' or 'single'
    mood: 'Hindi'
  });

  // Join Form State
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

  // Handle Create Room
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

  // Handle Join Room
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

    // Extract room ID if user pasted full URL
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto">
      
      {/* Hero Header */}
      <div className="text-center mb-8 sm:mb-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Synchronized Music Listening
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Listen to music together, <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">in real-time</span>.
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          No signups, no audio uploads. Create a room in 1-click, send the link to friends on WhatsApp, and hear the same track at the exact same second.
        </p>
      </div>

      {/* Main Tabbed Card */}
      <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/20">
        
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950/80 rounded-2xl mb-6 border border-zinc-800">
          <button
            onClick={() => { setTab('create'); setError(''); }}
            className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              tab === 'create'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => { setTab('join'); setError(''); }}
            className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              tab === 'join'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Join Room
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Tab 1: Create Room */}
        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Your Nickname <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={createData.hostName}
                onChange={(e) => setCreateData({ ...createData, hostName: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Room Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Midnight Vibes"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Language Preference
              </label>
              <select
                value={createData.mood}
                onChange={(e) => setCreateData({ ...createData, mood: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-purple-500 text-sm transition-colors cursor-pointer"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id} className="bg-zinc-900">{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Host Mode Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Room Control Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreateData({ ...createData, hostMode: 'friendly' })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    createData.hostMode === 'friendly'
                      ? 'border-purple-500 bg-purple-950/30 text-white'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Friendly
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">Anyone can control songs</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateData({ ...createData, hostMode: 'single' })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    createData.hostMode === 'single'
                      ? 'border-purple-500 bg-purple-950/30 text-white'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Host Only
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">Only host controls music</p>
                </button>
              </div>
            </div>

            {/* Optional Room PIN */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Optional 4-Digit PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Leave empty for public link"
                  value={createData.pin}
                  onChange={(e) => setCreateData({ ...createData, pin: e.target.value })}
                  className="w-full px-4 py-2.5 pl-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating Room...' : 'Create & Enter Room'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Tab 2: Join Room */
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Room Link or ID <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. a8f3-91cd-77b2"
                value={joinData.roomId}
                onChange={(e) => setJoinData({ ...joinData, roomId: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Your Nickname <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Maya"
                value={joinData.name}
                onChange={(e) => setJoinData({ ...joinData, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Room PIN (if required)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter PIN if host set one"
                  value={joinData.pin}
                  onChange={(e) => setJoinData({ ...joinData, pin: e.target.value })}
                  className="w-full px-4 py-2.5 pl-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-sm transition-colors"
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Joining Room...' : 'Enter Room'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>

      {/* Brave Browser sync tip footer */}
      <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 text-xs">
        <span className="text-purple-400">💡</span>
        <span>Pro-tip: For an ad-free sync experience, open the link in <strong>Brave Browser</strong>.</span>
      </div>

    </div>
  );
}

