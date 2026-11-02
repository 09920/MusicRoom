import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  KeyRound, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Music, 
  Layers, 
  Sparkles,
  Wifi,
  Headphones,
  ListMusic
} from 'lucide-react';
import { socket } from '../socket';
import FadingVideo from '../components/FadingVideo';
import BlurText from '../components/BlurText';

const LANGUAGES = [
  { id: 'Hindi', label: '🇮🇳 Hindi' },
  { id: 'English', label: '🌐 English' },
  { id: 'Other Languages', label: '🌍 Other Languages' }
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
      hostMode: 'friendly',
      mood: 'Hindi'
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

    try {
      localStorage.setItem('musicroom_user_name', createData.hostName.trim());
    } catch {}

    setLoading(true);
    setError('');

    socket.emit('room:create', { ...createData, userId }, (res) => {
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

    try {
      localStorage.setItem('musicroom_user_name', joinData.name.trim());
    } catch {}

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
      name: joinData.name.trim(),
      pin: joinData.pin,
      userId
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
    <div className="relative bg-black text-white selection:bg-white selection:text-black overflow-hidden font-body">
      
      {/* ======================================================== */}
      {/* SECTION 1: HERO PORTAL (Looping Golden Orb Video)        */}
      {/* ======================================================== */}
      <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-black z-10 pt-20 sm:pt-24 pb-12">
        
        {/* Background Looping Video (120% scale, centered top) */}
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
          className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0 pointer-events-none"
          style={{ width: "120%", height: "120%" }}
        />

        {/* Hero Content Layer */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto my-auto w-full">
          
          {/* Animated Badge Chip (delay 0.4s) */}
          <motion.div
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="liquid-glass rounded-full p-1 pr-3.5 flex items-center gap-2.5 mb-6 shadow-2xl"
          >
            <span className="bg-white text-black px-3 py-1 text-xs font-semibold rounded-full">
              New
            </span>
            <span className="text-xs sm:text-sm text-white/90 font-medium">
              Synchronized Music Rooms • No Signups Needed
            </span>
          </motion.div>

          {/* Headline with Word-by-Word Blur Animation */}
          <BlurText
            text="Listen Together Across The Universe"
            className="text-5xl sm:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85] max-w-2xl justify-center tracking-[-3px] sm:tracking-[-4px]"
          />

          {/* Subheading (delay 0.8s) */}
          <motion.p
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
            className="mt-6 text-sm sm:text-base text-white/80 max-w-2xl font-body font-light leading-snug"
          >
            Discover shared listening in ways once unimaginable. Create a private room in 1-click, send the link to friends, and hear every beat at the exact same millisecond.
          </motion.p>

          {/* Main Liquid-Glass Session Card */}
          <motion.div
            initial={{ filter: 'blur(10px)', opacity: 0, y: 30 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0, ease: 'easeOut' }}
            className="w-full max-w-md liquid-glass-strong rounded-[2rem] p-6 sm:p-7 shadow-2xl mt-8 text-left relative"
          >
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 liquid-glass rounded-full mb-5">
              <button
                type="button"
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
                type="button"
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

            {/* Create Room Form */}
            {tab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1 font-body">
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
                  <label className="block text-xs font-medium text-white/80 mb-1 font-body">
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
                  <label className="block text-xs font-medium text-white/80 mb-1 font-body">
                    Language Vibe
                  </label>
                  <select
                    value={createData.mood}
                    onChange={(e) => setCreateData({ ...createData, mood: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-full liquid-glass text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all cursor-pointer bg-black/95"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.id} value={lang.id} className="bg-black text-white">{lang.label}</option>
                    ))}
                  </select>
                </div>

                {/* Host Mode Selection */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1 font-body">
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

                {/* Optional Room PIN */}
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1 font-body">
                    Room PIN (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Leave empty for open link"
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
              /* Join Room Form */
              <form onSubmit={handleJoin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-1 font-body">
                    Room Link or Code <span className="text-white/40">*</span>
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
                  <label className="block text-xs font-medium text-white/80 mb-1 font-body">
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
                  <label className="block text-xs font-medium text-white/80 mb-1 font-body">
                    Room PIN (if protected)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter PIN if host set one"
                      value={joinData.pin}
                      onChange={(e) => setJoinData({ ...joinData, pin: e.target.value })}
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
                  {loading ? 'Joining Room...' : 'Enter Session'}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>

          {/* Stats Row (delay 1.2s) */}
          <motion.div
            initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
            animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}
            className="flex items-stretch gap-4 mt-8"
          >
            <div className="liquid-glass p-5 w-[180px] sm:w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between shadow-2xl">
              <Wifi className="w-6 h-6 text-white/70" />
              <div className="mt-4">
                <p className="font-heading italic text-3xl sm:text-4xl text-white tracking-[-1px] leading-none">
                  0s Drift
                </p>
                <p className="text-xs text-white/60 font-body font-light mt-1.5">
                  Live WebSocket Pulse
                </p>
              </div>
            </div>

            <div className="liquid-glass p-5 w-[180px] sm:w-[220px] rounded-[1.25rem] text-left flex flex-col justify-between shadow-2xl">
              <Headphones className="w-6 h-6 text-white/70" />
              <div className="mt-4">
                <p className="font-heading italic text-3xl sm:text-4xl text-white tracking-[-1px] leading-none">
                  100% Free
                </p>
                <p className="text-xs text-white/60 font-body font-light mt-1.5">
                  No Subscriptions Needed
                </p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Partners / Ecosystem Row (delay 1.4s) */}
        <motion.div
          initial={{ filter: 'blur(10px)', opacity: 0, y: 20 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center gap-3 pt-6"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white shadow-xl">
            Powered by modern streaming & real-time protocols
          </div>
          <div className="flex items-center gap-8 md:gap-14 font-heading italic text-white/80 text-xl md:text-2xl tracking-tight">
            <span>YouTube</span>
            <span>·</span>
            <span>Spotify</span>
            <span>·</span>
            <span>Socket.IO</span>
            <span>·</span>
            <span>Brave</span>
          </div>
        </motion.div>

      </section>

      {/* ======================================================== */}
      {/* SECTION 2: CAPABILITIES (Looping Crystal Asteroid Video) */}
      {/* ======================================================== */}
      <section className="relative min-h-screen w-full flex flex-col bg-black overflow-hidden z-10">
        
        {/* Full Bleed Background Video */}
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        <div className="relative z-10 px-6 sm:px-12 lg:px-20 pt-28 pb-16 flex flex-col min-h-screen max-w-7xl mx-auto w-full">
          
          {/* Section 2 Header */}
          <div className="mb-auto">
            <p className="text-sm font-body text-white/80 mb-4 tracking-wide">
              // Capabilities
            </p>
            <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">
              Listening<br />evolved
            </h2>
          </div>

          {/* Three Liquid-Glass Capability Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            
            {/* Card 1: Instant Sync */}
            <div className="liquid-glass rounded-[1.5rem] p-6 min-h-[340px] flex flex-col justify-between shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center text-white shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {['Sub-Second Sync', 'Late Joiners', 'Drift Correction', 'Mobile Ready'].map((tag) => (
                    <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                  Instant Sync
                </h3>
                <p className="mt-3 text-sm text-white/80 font-body font-light leading-snug max-w-[32ch]">
                  Late joiners immediately jump to the exact current second of the playing track. Continuous heartbeats keep all browsers matched.
                </p>
              </div>
            </div>

            {/* Card 2: Auto Mode (Radio) */}
            <div className="liquid-glass rounded-[1.5rem] p-6 min-h-[340px] flex flex-col justify-between shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center text-white shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {['Language Lock', '50-Song Memory', 'Non-Stop', 'Zero Quota Waste'].map((tag) => (
                    <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                  Auto Mode (Radio)
                </h3>
                <p className="mt-3 text-sm text-white/80 font-body font-light leading-snug max-w-[32ch]">
                  Never suffer awkward silence. When the queue finishes, the server automatically picks matching tracks without repeating the last 50 songs.
                </p>
              </div>
            </div>

            {/* Card 3: Playlist Import */}
            <div className="liquid-glass rounded-[1.5rem] p-6 min-h-[340px] flex flex-col justify-between shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-[0.75rem] liquid-glass flex items-center justify-center text-white shrink-0">
                  <ListMusic className="w-5 h-5" />
                </div>
                <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
                  {['YouTube Playlists', 'Spotify Import', '1-Click Queues', 'In-Room Search'].map((tag) => (
                    <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
                  Import Anything
                </h3>
                <p className="mt-3 text-sm text-white/80 font-body font-light leading-snug max-w-[32ch]">
                  Paste any public or unlisted YouTube or Spotify link to instantly load 50+ songs directly into the shared room queue.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
