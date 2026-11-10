import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

const VIBE_PRESETS = [
  { id: 'Chill', label: 'Chill 🌙' },
  { id: 'Party', label: 'Party 🔥' },
  { id: 'Study', label: 'Study 📚' },
  { id: 'Workout', label: 'Workout ⚡' },
  { id: 'Lo-Fi', label: 'Lo-Fi ☕' },
  { id: 'Hindi', label: 'Hindi 🇮🇳' },
  { id: 'English', label: 'English 🌐' }
];

export default function Home({ onRoomJoined, initialRoomId, userId }) {
  const [tab, setTab] = useState(initialRoomId ? 'join' : 'create');

  const [createData, setCreateData] = useState(() => {
    let savedName = '';
    try {
      savedName = localStorage.getItem('musicroom_user_name') || '';
    } catch {}
    return {
      name: '',
      hostName: savedName,
      pin: '',
      hostMode: 'friendly', // 'friendly' | 'single'
      mood: 'Chill'
    };
  });

  const [joinData, setJoinData] = useState(() => {
    let savedName = '';
    try {
      savedName = localStorage.getItem('musicroom_user_name') || '';
    } catch {}
    return {
      roomId: initialRoomId || '',
      name: savedName,
      pin: ''
    };
  });

  const [hasPinProtection, setHasPinProtection] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ping, setPing] = useState(12);

  const [recentSession, setRecentSession] = useState(() => {
    try {
      const raw = localStorage.getItem('musicroom_recent_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.roomId && Date.now() - (parsed.timestamp || 0) < 24 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    if (initialRoomId) {
      setJoinData(prev => ({ ...prev, roomId: initialRoomId }));
      setTab('join');
    }
  }, [initialRoomId]);

  // Track live socket ping latency
  useEffect(() => {
    const pingInterval = setInterval(() => {
      const start = Date.now();
      socket.volatile.emit('ping_sync', () => {
        setPing(Math.max(8, Date.now() - start));
      });
    }, 10000);
    return () => clearInterval(pingInterval);
  }, []);

  const handleCreate = (e) => {
    if (e) e.preventDefault();
    if (!createData.hostName.trim()) {
      setError('Please enter your nickname');
      return;
    }

    const fullPin = hasPinProtection ? pinDigits.join('') : '';

    try {
      localStorage.setItem('musicroom_user_name', createData.hostName.trim());
    } catch {}

    setLoading(true);
    setError('');

    socket.emit('room:create', {
      ...createData,
      pin: fullPin,
      userId
    }, (res) => {
      setLoading(false);
      if (res?.success && res.room) {
        try {
          localStorage.setItem('musicroom_recent_session', JSON.stringify({
            roomId: res.room.id,
            name: res.room.name,
            mood: res.room.mood,
            hostName: createData.hostName.trim(),
            timestamp: Date.now()
          }));
        } catch {}
        onRoomJoined(res.room, res.room.hostSocketId);
      } else {
        setError(res?.error || 'Failed to create room. Please try again.');
      }
    });
  };

  const handleJoin = (e) => {
    if (e) e.preventDefault();
    if (!joinData.roomId.trim()) {
      setError('Please enter a room code or link');
      return;
    }
    if (!joinData.name.trim()) {
      setError('Please enter your nickname');
      return;
    }

    let parsedRoomId = joinData.roomId.trim();
    if (parsedRoomId.includes('room=')) {
      parsedRoomId = parsedRoomId.split('room=')[1].split('&')[0];
    } else if (parsedRoomId.includes('/room/')) {
      parsedRoomId = parsedRoomId.split('/room/')[1].split('/')[0];
    }

    try {
      localStorage.setItem('musicroom_user_name', joinData.name.trim());
    } catch {}

    setLoading(true);
    setError('');

    socket.emit('room:join', {
      roomId: parsedRoomId,
      name: joinData.name.trim(),
      pin: joinData.pin.trim(),
      userId
    }, (res) => {
      setLoading(false);
      if (res?.success && res.room) {
        try {
          localStorage.setItem('musicroom_recent_session', JSON.stringify({
            roomId: res.room.id,
            name: res.room.name,
            mood: res.room.mood,
            hostName: res.room.hostName || 'Host',
            timestamp: Date.now()
          }));
        } catch {}
        onRoomJoined(res.room, res.socketId);
      } else {
        setError(res?.error || 'Failed to join room. Verify the code or PIN.');
      }
    });
  };

  const handleQuickRejoin = (roomId, defaultRoomName = 'Music Room') => {
    const savedName = localStorage.getItem('musicroom_user_name') || createData.hostName || 'Alex';
    setLoading(true);
    setError('');

    socket.emit('room:join', {
      roomId,
      name: savedName,
      pin: '',
      userId
    }, (res) => {
      setLoading(false);
      if (res?.success && res.room) {
        onRoomJoined(res.room, res.socketId);
      } else {
        // If room expired, auto-create a room with same name
        socket.emit('room:create', {
          name: defaultRoomName,
          hostName: savedName,
          pin: '',
          hostMode: 'friendly',
          mood: 'Chill',
          userId
        }, (createRes) => {
          if (createRes?.success && createRes.room) {
            onRoomJoined(createRes.room, createRes.room.hostSocketId);
          } else {
            setError('Could not join or recreate room. Try creating a new one.');
          }
        });
      }
    });
  };

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const nextDigits = [...pinDigits];
    nextDigits[index] = value.slice(-1);
    setPinDigits(nextDigits);

    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-digit-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen selection:bg-primary-container selection:text-on-primary-container font-sans antialiased">
      
      {/* Fixed Header (Stitch Obsidian Pulse) */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-b border-outline-variant/20">
        <div className="h-16 px-gutter-sm flex items-center justify-between gap-space-sm max-w-4xl mx-auto w-full">
          
          <div className="flex items-center gap-space-sm min-w-0">
            {/* MusicRoom Logo Glyph */}
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(208,188,255,0.3)] shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                speaker_group
              </span>
            </div>
            
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-title-md text-title-md text-on-surface font-bold tracking-tight truncate">
                  SyncVibe
                </span>
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-1 shadow-[0_0_8px_rgba(76,215,246,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  SYNCED
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                Lobby
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            {/* Real-time latency pulse */}
            <div className="h-9 px-space-sm rounded-full bg-surface-container-high/60 backdrop-blur-md flex items-center gap-1.5 text-secondary shadow-[0_0_12px_rgba(76,215,246,0.15)] border border-secondary/20">
              <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">{ping}ms</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-surface-container-high ring-2 ring-primary/40 flex items-center justify-center text-primary text-xs font-bold shadow-[0_0_12px_rgba(208,188,255,0.25)]">
              {(createData.hostName || 'U').charAt(0).toUpperCase()}
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-20 pb-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-gutter-sm space-y-space-lg max-w-lg mx-auto">
          
          {/* Error Banner */}
          {error && (
            <div className="p-space-sm rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] text-error">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Ambient Audio Pulse Backing */}
          <div className="relative w-full rounded-2xl p-space-md bg-surface-container-low shadow-xl overflow-hidden border border-outline-variant/15">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-secondary font-label-sm text-label-sm tracking-wide border border-secondary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                  REAL-TIME ENGINE
                </span>
                <div className="flex items-center gap-1 text-tertiary font-label-sm text-label-sm bg-surface-container-high px-2 py-0.5 rounded-full border border-tertiary/20">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>Zero Drift</span>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-extrabold tracking-tight">
                  Listen Together in Perfect Sync
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Experience ultra-low latency audio sync powered by YouTube stream anchors, drift auto-correction, and bandwidth optimization.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[14px] text-primary">speed</span>
                  <span>&lt;15ms Latency</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[14px] text-secondary">data_saver_on</span>
                  <span>Audio-Only Mode</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Rejoin Recent Rooms */}
          {recentSession && (
            <div className="flex flex-col space-y-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
                  <h3 className="font-title-md text-title-md text-on-surface font-bold">Quick Rejoin</h3>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Recent Session</span>
              </div>

              <div className="flex items-center justify-between p-space-md rounded-2xl bg-surface-container shadow-md border border-outline-variant/15 transition-all duration-200">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high shrink-0 border border-outline-variant/20">
                    <img
                      className="w-full h-full object-cover"
                      src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                    <div className="absolute bottom-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-surface-container-lowest/80 text-secondary">
                      <span className="material-symbols-outlined text-[10px]">equalizer</span>
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-title-md text-title-md text-on-surface font-bold truncate">
                      {recentSession.name || 'Last Room'}
                    </span>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                      <span className="text-primary font-mono font-medium">#{recentSession.roomId}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                        Host: @{recentSession.hostName || 'Host'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickRejoin(recentSession.roomId, recentSession.name)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-[0_0_16px_rgba(160,120,255,0.4)] shrink-0 active:scale-95 transition-transform"
                >
                  <span>Rejoin</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Interactive Action Tabs (Create / Join) */}
          <div className="flex flex-col space-y-space-md p-space-md rounded-2xl bg-surface-container shadow-xl border border-outline-variant/15">
            
            {/* Segment Switcher */}
            <div className="flex items-center p-1 rounded-full bg-surface-container-lowest border border-outline-variant/20">
              <button
                type="button"
                id="tabBtnCreate"
                onClick={() => { setTab('create'); setError(''); }}
                className={`flex-1 py-2 rounded-full text-center font-label-md text-label-md font-bold transition-all duration-200 ${
                  tab === 'create'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Room
              </button>
              <button
                type="button"
                id="tabBtnJoin"
                onClick={() => { setTab('join'); setError(''); }}
                className={`flex-1 py-2 rounded-full text-center font-label-md text-label-md font-bold transition-all duration-200 ${
                  tab === 'join'
                    ? 'bg-secondary text-on-secondary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Join by Code
              </button>
            </div>

            {/* Create Room View */}
            {tab === 'create' ? (
              <form onSubmit={handleCreate} className="flex flex-col space-y-space-md" id="createRoomPanel">
                
                {/* Nickname */}
                <div className="space-y-space-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Your Nickname *
                  </label>
                  <div className="flex items-center px-space-md py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/25 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">badge</span>
                    <input
                      className="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-outline"
                      placeholder="e.g. Alex"
                      type="text"
                      value={createData.hostName}
                      onChange={(e) => setCreateData({ ...createData, hostName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Room Name */}
                <div className="space-y-space-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Room Name (Optional)
                  </label>
                  <div className="flex items-center px-space-md py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/25 focus-within:border-primary transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">speaker_group</span>
                    <input
                      className="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-outline"
                      placeholder="e.g. Midnight Beats"
                      type="text"
                      value={createData.name}
                      onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Vibe Preset */}
                <div className="space-y-space-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Vibe Preset
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {VIBE_PRESETS.map((preset) => {
                      const isActive = createData.mood === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setCreateData({ ...createData, mood: preset.id })}
                          className={`mood-pill px-3 py-1.5 rounded-full font-label-md text-label-md shrink-0 transition-all active:scale-95 ${
                            isActive
                              ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(160,120,255,0.3)]'
                              : 'bg-surface-container-lowest text-on-surface-variant hover:text-on-surface border border-outline-variant/20 font-semibold'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Playback Permissions Policy */}
                <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest space-y-2 border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Playback Permissions
                      </span>
                    </div>
                    <span className={`font-label-sm text-label-sm font-semibold ${createData.hostMode === 'friendly' ? 'text-secondary' : 'text-primary'}`}>
                      {createData.hostMode === 'friendly' ? 'Collaborative' : 'Host-Only DJ'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-container-high/60">
                    <button
                      type="button"
                      onClick={() => setCreateData({ ...createData, hostMode: 'friendly' })}
                      className={`flex flex-col items-start p-2.5 rounded-lg text-left transition-all ${
                        createData.hostMode === 'friendly'
                          ? 'bg-surface-container text-secondary ring-1 ring-secondary/40 shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-label-md text-label-md font-bold">
                        <span className="material-symbols-outlined text-[18px]">groups</span>
                        <span>Friendly Mode</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                        All listeners can queue & skip
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreateData({ ...createData, hostMode: 'single' })}
                      className={`flex flex-col items-start p-2.5 rounded-lg text-left transition-all ${
                        createData.hostMode === 'single'
                          ? 'bg-primary-container/20 text-primary ring-1 ring-primary/40 shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-label-md text-label-md font-bold">
                        <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                        <span>Host-Only DJ</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant mt-0.5 leading-tight">
                        Strict host & DJ privileges
                      </span>
                    </button>
                  </div>

                  <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 pt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-secondary">info</span>
                    {createData.hostMode === 'friendly'
                      ? 'Anyone can add, reorder, and skip tracks together in real-time.'
                      : 'Strict DJ room: only host and verified co-hosts can alter playback or queue.'}
                  </p>
                </div>

                {/* Room PIN Code Protection Toggle */}
                <div className="flex flex-col p-space-sm rounded-xl bg-surface-container-lowest space-y-2 border border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-primary text-[22px]">lock</span>
                      <div className="flex flex-col">
                        <span className="font-title-md text-title-md text-on-surface font-semibold text-sm">
                          PIN Code Protection
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Require 4-digit passkey to join
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={hasPinProtection}
                        onChange={(e) => setHasPinProtection(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary-container after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-on-surface after:rounded-full after:h-5 after:w-5 after:transition-all" />
                    </label>
                  </div>

                  {hasPinProtection && (
                    <div className="pt-2 flex items-center justify-between animate-in fade-in">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Set 4-Digit Passcode
                      </span>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((idx) => (
                          <input
                            key={idx}
                            id={`pin-digit-${idx}`}
                            type="password"
                            maxLength={1}
                            placeholder="•"
                            value={pinDigits[idx]}
                            onChange={(e) => handlePinChange(idx, e.target.value)}
                            className="w-9 h-10 text-center rounded-lg bg-surface-container-high text-on-surface font-bold text-lg focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Create Room Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-primary font-headline-md text-headline-md text-on-primary font-bold shadow-[0_0_24px_rgba(208,188,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span>{loading ? 'Creating Room...' : 'Start Session'}</span>
                </button>

              </form>
            ) : (
              /* Join Room by Code Panel */
              <form onSubmit={handleJoin} className="flex flex-col space-y-space-md" id="joinRoomPanel">
                
                <div className="space-y-space-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Room Code or Invite Link
                  </label>
                  <div className="flex items-center px-space-md py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/25 focus-within:border-secondary transition-colors">
                    <span className="material-symbols-outlined text-secondary text-[22px] mr-2">link</span>
                    <input
                      className="w-full bg-transparent text-on-surface font-body-md text-body-md font-mono focus:outline-none placeholder:text-outline"
                      placeholder="e.g. 78ba-449e or paste full URL"
                      type="text"
                      value={joinData.roomId}
                      onChange={(e) => setJoinData({ ...joinData, roomId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Auto Detection Badge */}
                {joinData.roomId && (
                  <div className="flex items-center gap-2 p-space-sm rounded-xl bg-secondary-container/15 text-secondary border border-secondary/20">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md font-bold">Room Target Loaded</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant truncate font-mono">
                        Code: {joinData.roomId}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-space-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Your Display Alias
                  </label>
                  <div className="flex items-center px-space-md py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/25 focus-within:border-secondary transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">person</span>
                    <input
                      className="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-outline"
                      placeholder="Enter your name"
                      type="text"
                      value={joinData.name}
                      onChange={(e) => setJoinData({ ...joinData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-space-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Room Passcode (If Protected)
                  </label>
                  <div className="flex items-center px-space-md py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/25 focus-within:border-secondary transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px] mr-2">lock</span>
                    <input
                      className="w-full bg-transparent text-on-surface font-body-md text-body-md focus:outline-none placeholder:text-outline"
                      placeholder="Leave empty if open room"
                      type="password"
                      maxLength={6}
                      value={joinData.pin}
                      onChange={(e) => setJoinData({ ...joinData, pin: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-secondary font-headline-md text-headline-md text-on-secondary font-bold shadow-[0_0_24px_rgba(76,215,246,0.35)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  <span>{loading ? 'Joining Room...' : 'Enter Session'}</span>
                </button>

              </form>
            )}

          </div>



        </div>
      </main>

    </div>
  );
}
