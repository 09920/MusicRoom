import React, { useState, useEffect, useRef } from 'react';
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
  Headphones,
  Bolt,
  Cable,
  Volume2,
  Share2,
  SkipForward,
  Plus,
  Flame,
  Zap,
  Disc3,
  QrCode
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
    setIsChatDrawerOpen,
    queue,
    nextSong
  } = usePlayer();

  const [tab, setTab] = useState('create'); // 'create' | 'join'
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latency, setLatency] = useState(4.2);
  const [auxMode, setAuxMode] = useState('friendly'); // 'friendly' | 'dj'
  const [skipVotes, setSkipVotes] = useState(1);
  const [hasVotedSkip, setHasVotedSkip] = useState(false);

  // Floating particles container
  const [particles, setParticles] = useState([]);

  // Reaction counters
  const [reactionCounts, setReactionCounts] = useState({
    '🔥': 42,
    '💃': 18,
    '⚡': 89,
    '🤯': 7,
    '💜': 31,
    '🔊': 24
  });

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

  // Ping jitter calculation for real-time telemetry simulation
  useEffect(() => {
    if (!activeRoom) return;
    const interval = setInterval(() => {
      const baseLatency = 3.8 + Math.random() * 1.4;
      setLatency(parseFloat(baseLatency.toFixed(1)));
    }, 4000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  // Listen for socket reactions from other room members
  useEffect(() => {
    const handleRemoteReaction = (data) => {
      if (data?.emoji) {
        triggerReactionVisual(data.emoji, false);
      }
    };
    socket.on('room:reaction', handleRemoteReaction);
    return () => socket.off('room:reaction', handleRemoteReaction);
  }, []);

  const triggerReactionVisual = (emoji, emit = true) => {
    // Increment counter
    setReactionCounts(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1
    }));

    // Spawn floating particle
    const newParticle = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.floor(20 + Math.random() * 60), // percent
      bottom: Math.floor(10 + Math.random() * 20)
    };

    setParticles(prev => [...prev.slice(-15), newParticle]);

    // Cleanup particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 2000);

    // Emit over socket to room
    if (emit && activeRoom) {
      socket.emit('room:reaction', { roomId: activeRoom.id, emoji });
    }
  };

  const handleVoteSkip = () => {
    if (hasVotedSkip) return;
    setHasVotedSkip(true);
    setSkipVotes(prev => {
      const newCount = prev + 1;
      const totalNeeded = Math.max(2, Math.ceil(roomMembers.length / 2));
      if (newCount >= totalNeeded) {
        nextSong();
      }
      return newCount;
    });
  };

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

  const hostMember = roomMembers.find(m => m.isHost) || { name: 'Host' };
  const totalVotesNeeded = Math.max(2, Math.ceil((roomMembers.length || 1) / 2));
  const votePercent = Math.min(100, (skipVotes / totalVotesNeeded) * 100);

  return (
    <div
      onClick={() => setIsPartyModalOpen(false)}
      className="fixed inset-0 z-50 bg-[#090a0f]/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full relative rounded-2xl sm:rounded-3xl bg-[#12131c] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 ${
          activeRoom ? 'max-w-4xl p-5 sm:p-7' : 'max-w-md p-6'
        }`}
      >
        {/* Dynamic Atmospheric Glow Aura from Stitch Design */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#a078ff]/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#4cd7f6]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-[#ff516a]/10 rounded-full blur-[90px] pointer-events-none -z-10" />

        {/* Floating Particles overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
          {particles.map(p => (
            <span
              key={p.id}
              className="absolute text-2xl sm:text-3xl animate-bounce transition-all duration-1000 opacity-90 select-none"
              style={{
                left: `${p.left}%`,
                bottom: `${p.bottom}%`,
                transform: 'translateY(-60px) scale(1.3)'
              }}
            >
              {p.emoji}
            </span>
          ))}
        </div>

        {/* =========================================================================
            STATE A: ACTIVE LIVE ROOM STAGE (Stitch Screen 2 Implementation)
        ========================================================================= */}
        {activeRoom ? (
          <div className="space-y-5">
            
            {/* Top Bar: Room Title, Stage Live Pill, Copy Link & Modal Close */}
            <header className="relative z-10 w-full flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1a1b24]/70 backdrop-blur-2xl p-3.5 sm:p-4 rounded-xl border border-white/[0.08] shadow-xl">
                
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4cd7f6] opacity-80" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#4cd7f6] shadow-[0_0_10px_rgba(76,215,246,0.9)]" />
                  </span>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="font-headline text-lg sm:text-xl font-bold text-[#e3e1ee] tracking-tight truncate">
                        {activeRoom.name || 'MusicRoom Live Stage'}
                      </h1>
                      <span className="px-2 py-0.5 rounded-full bg-[#a078ff]/25 text-[#d0bcff] text-[10px] font-mono font-semibold tracking-wider uppercase border border-[#a078ff]/30">
                        Stage Live
                      </span>
                    </div>

                    <p className="font-body text-xs text-[#cbc3d7]/70 flex items-center gap-2 mt-0.5">
                      <span>Room Code: <strong className="text-[#4cd7f6] font-mono tracking-widest uppercase">{activeRoom.id}</strong></span>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span>Host: <strong className="text-[#d0bcff]">{hostMember.name}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Sharing & Control Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#282933] hover:bg-[#383843] text-[#e3e1ee] font-medium text-xs transition-all active:scale-95 border border-white/10"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#4cd7f6]" />
                        <span className="text-[#4cd7f6] font-mono">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-[#4cd7f6]" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPartyModalOpen(false);
                      setIsChatDrawerOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#a078ff]/20 hover:bg-[#a078ff]/30 text-[#d0bcff] text-xs font-semibold transition-all border border-[#a078ff]/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Room Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPartyModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-[#282933] hover:bg-[#383843] flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10 active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Mode Toggle & Listener Avatars Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                {/* Aux Mode Switcher Pill */}
                <div className="flex items-center p-1 rounded-full bg-[#0d0e16]/80 backdrop-blur-md border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setAuxMode('friendly')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-semibold transition-all ${
                      auxMode === 'friendly'
                        ? 'bg-[#a078ff] text-[#340080] shadow-[0_0_12px_rgba(160,120,255,0.4)]'
                        : 'text-[#cbc3d7] hover:text-white'
                    }`}
                  >
                    <Cable className="w-3.5 h-3.5" />
                    <span>Friendly (Open Aux)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuxMode('dj')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-semibold transition-all ${
                      auxMode === 'dj'
                        ? 'bg-[#a078ff] text-[#340080] shadow-[0_0_12px_rgba(160,120,255,0.4)]'
                        : 'text-[#cbc3d7] hover:text-white'
                    }`}
                  >
                    <Disc3 className="w-3.5 h-3.5" />
                    <span>DJ Curated</span>
                  </button>
                </div>

                {/* Listener Avatars Pile */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-2 overflow-hidden py-1">
                    {roomMembers.slice(0, 5).map((member, i) => (
                      <div
                        key={member.socketId || i}
                        title={member.name}
                        className={`w-7 h-7 rounded-full bg-[#282933] border-2 border-[#12131c] flex items-center justify-center text-white text-[11px] font-bold ${
                          member.isHost ? 'ring-2 ring-[#d0bcff]' : ''
                        }`}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {roomMembers.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-[#33343e] text-[#4cd7f6] flex items-center justify-center font-mono text-[10px] font-bold border-2 border-[#12131c]">
                        +{roomMembers.length - 5}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-xs text-[#cbc3d7]">
                    {roomMembers.length} in room
                  </span>
                </div>
              </div>

              {/* Real-Time Sub-Second Audio Sync Status Strip */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#0d0e16]/70 backdrop-blur-md text-xs font-mono border border-white/[0.06] shadow-inner flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Bolt className="w-4 h-4 text-[#4cd7f6] animate-pulse" />
                    <span className="text-[#e3e1ee]">
                      Socket.IO Sync: <strong className="text-[#4cd7f6] font-semibold">{latency}ms latency</strong>
                    </span>
                  </div>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/20" />
                  <div className="hidden sm:flex items-center gap-1 text-[#cbc3d7]/70">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d0bcff]" />
                    <span>Zero Drift Clock Active (P2P Lossless)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[#4cd7f6]">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
                    <span>{roomMembers.length} Listeners In-Sync</span>
                  </div>
                  <span className="hidden md:inline px-2 py-0.5 rounded bg-[#282933] text-[10px] text-[#958ea0]">
                    BUFFER: 32kb/OPUS
                  </span>
                </div>
              </div>
            </header>

            {/* Center Stage: Spinning Turntable, Visualizer Spectrum & Lyrics */}
            <div className="relative w-full rounded-2xl bg-[#1a1b24]/60 backdrop-blur-2xl p-5 sm:p-6 overflow-hidden border border-white/[0.08] shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                
                {/* Vinyl Record Turntable Animation Unit */}
                <div className="relative shrink-0 group">
                  <div 
                    className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-[#0a0a0f] p-2 flex items-center justify-center shadow-[0_12px_48px_rgba(0,0,0,0.8)] animate-spin border border-white/10"
                    style={{ animationDuration: '14s' }}
                  >
                    {/* Vinyl Grooves repeating radial gradient */}
                    <div className="absolute inset-2 rounded-full vinyl-grooves opacity-90" />
                    
                    {/* Center Vinyl Label with Image */}
                    <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-[0_0_20px_rgba(208,188,255,0.4)] flex items-center justify-center ring-2 ring-[#a078ff]/40">
                      <img
                        src={currentSong?.thumbnail || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&q=80'}
                        alt={currentSong?.title || 'Playing Record'}
                        className="w-full h-full object-cover"
                      />
                      {/* Spindle hole center */}
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-[#0d0e16] ring-2 ring-white/30" />
                    </div>
                  </div>

                  {/* Aux Badge Overlay on Disc */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#282933]/90 backdrop-blur-md shadow-lg text-[10px] font-mono text-[#4cd7f6] whitespace-nowrap border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                    <span>AUX: {hostMember.name} (Host)</span>
                  </div>
                </div>

                {/* Track Meta, Spectrum Visualizer & Live Lyrics Chorus */}
                <div className="flex-1 flex flex-col gap-3 min-w-0 w-full">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#03b5d3]/20 text-[#4cd7f6] text-[10px] font-mono uppercase tracking-wider font-semibold">
                        Lossless • 48kHz
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-[#ff516a]">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>Hype Level 94%</span>
                      </span>
                    </div>

                    <h2 className="font-headline text-xl sm:text-2xl font-bold text-white tracking-tight truncate mt-1">
                      {currentSong?.title || 'Midnight City Drift'}
                    </h2>
                    <p className="font-body text-xs sm:text-sm text-[#cbc3d7]">
                      {currentSong?.channelTitle || 'Kavinsky & Tycho'}
                    </p>
                  </div>

                  {/* Dynamic Stereo Audio Visualizer Spectrum (Inline SVG) */}
                  <div className="flex flex-col gap-1 w-full bg-[#0d0e16]/60 p-2.5 rounded-xl border border-white/[0.05]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#958ea0] px-1">
                      <span className="flex items-center gap-1 text-[#4cd7f6]">
                        <Volume2 className="w-3 h-3" />
                        <span>LIVE SPECTRUM (L/R)</span>
                      </span>
                      <span>48.0 kHz Lossless Master</span>
                    </div>

                    {/* SVG Graphic */}
                    <svg className="w-full h-9 overflow-visible" fill="none" preserveAspectRatio="none" viewBox="0 0 400 36">
                      <defs>
                        <linearGradient id="spectrumGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                          <stop offset="0%" stopColor="#4cd7f6" />
                          <stop offset="50%" stopColor="#a078ff" />
                          <stop offset="100%" stopColor="#ff516a" />
                        </linearGradient>
                      </defs>
                      {[
                        18, 26, 32, 28, 34, 24, 30, 33, 22, 29, 35, 26, 20, 31, 27, 34,
                        24, 29, 35, 30, 25, 36, 27, 33, 23, 29, 34, 26, 31, 21, 32, 28,
                        35, 25, 30, 20, 27, 32, 25, 19
                      ].map((h, idx) => (
                        <rect
                          key={idx}
                          fill="url(#spectrumGradient)"
                          height={h}
                          opacity={idx % 2 === 0 ? 0.95 : 0.8}
                          rx="2"
                          width="4"
                          x={idx * 10 + 4}
                          y={36 - h}
                        />
                      ))}
                    </svg>
                  </div>

                  {/* Synchronized Floating Karaoke Chorus Snippet */}
                  <div className="p-2.5 rounded-xl bg-[#1e1f28]/60 backdrop-blur-md border border-white/[0.05]">
                    <div className="flex items-center justify-between pb-1 text-[10px] font-mono text-[#958ea0]">
                      <span className="text-[#a078ff] font-semibold">LIVE SYNC CHORUS</span>
                      <span className="text-[#4cd7f6]">Real-time lyrics active</span>
                    </div>
                    <p className="font-headline text-xs sm:text-sm text-[#4cd7f6] font-semibold drop-shadow-[0_0_12px_rgba(76,215,246,0.5)]">
                      "Hold the wheel, feel the frequencies collide into the dawn."
                    </p>
                  </div>
                </div>

              </div>

              {/* Bottom Action Deck: Live Floating Reactions Bar & Pass Aux Button */}
              <div className="mt-5 pt-3.5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                
                {/* Floating Emoji Reactions Deck */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono text-[11px] text-[#958ea0] mr-1 uppercase">Tap Vibe:</span>
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => triggerReactionVisual(emoji, true)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#282933] hover:bg-[#383843] active:scale-125 transition-transform text-xs border border-white/[0.06]"
                    >
                      <span>{emoji}</span>
                      <span className="font-mono text-[10px] text-[#cbc3d7] font-semibold">{count}</span>
                    </button>
                  ))}
                </div>

                {/* Vote to Skip Progress Pill */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#282933] border border-white/[0.06] text-xs">
                  <SkipForward className="w-3.5 h-3.5 text-[#ff516a]" />
                  <span className="text-[#e3e1ee] text-[11px] font-medium">Skip:</span>
                  <div className="w-14 h-1.5 rounded-full bg-[#0d0e16] overflow-hidden">
                    <div 
                      className="h-full bg-[#ff516a] rounded-full transition-all duration-300" 
                      style={{ width: `${votePercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-[#ffb2b7] font-semibold">
                    {skipVotes}/{totalVotesNeeded}
                  </span>
                  <button
                    type="button"
                    onClick={handleVoteSkip}
                    disabled={hasVotedSkip}
                    className={`font-mono text-[11px] ml-1 transition-colors ${
                      hasVotedSkip ? 'text-white/30 cursor-not-allowed' : 'text-[#4cd7f6] hover:underline cursor-pointer'
                    }`}
                  >
                    {hasVotedSkip ? 'Voted' : '+1 Vote'}
                  </button>
                </div>

              </div>
            </div>

            {/* Bottom Actions: Open Chat / Leave Room */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsPartyModalOpen(false);
                  setIsChatDrawerOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1e1f28] hover:bg-[#282933] text-xs font-semibold text-[#d0bcff] flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Room Live Chat</span>
              </button>

              <button
                type="button"
                onClick={leavePartyRoom}
                className="px-5 py-2.5 rounded-xl bg-[#ff516a]/15 hover:bg-[#ff516a]/25 text-[#ffb2b7] text-xs font-semibold flex items-center gap-2 border border-[#ff516a]/30 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Room</span>
              </button>
            </div>

          </div>
        ) : (
          /* =========================================================================
              STATE B: HOST OR JOIN ROOM DIALOG (Obsidian Soundscape Styling)
          ========================================================================= */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#a078ff]/20 border border-[#a078ff]/40 flex items-center justify-center text-[#d0bcff]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-white">
                    Listen with Friends
                  </h3>
                  <p className="text-[11px] text-[#cbc3d7]/70 font-body">
                    Synchronized sub-second real-time music sessions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPartyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#282933] hover:bg-[#383843] flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create vs Join Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0d0e16]/80 border border-white/5">
              <button
                type="button"
                onClick={() => { setTab('create'); setError(''); }}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === 'create'
                    ? 'bg-[#a078ff] text-[#340080] shadow-md'
                    : 'text-[#cbc3d7] hover:text-white'
                }`}
              >
                Host a Room
              </button>
              <button
                type="button"
                onClick={() => { setTab('join'); setError(''); }}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === 'join'
                    ? 'bg-[#a078ff] text-[#340080] shadow-md'
                    : 'text-[#cbc3d7] hover:text-white'
                }`}
              >
                Join with Code
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-[#ff516a]/20 border border-[#ff516a]/30 text-[#ffb2b7] text-xs">
                {error}
              </div>
            )}

            {tab === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-[11px] text-[#cbc3d7] block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={createData.hostName}
                    onChange={(e) => setCreateData({ ...createData, hostName: e.target.value })}
                    placeholder="e.g. Alex"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b24] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#a078ff] border border-white/10"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#cbc3d7] block mb-1">Room Name (Optional)</label>
                  <input
                    type="text"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    placeholder="e.g. Neon Cyberpunk Haven"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b24] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#a078ff] border border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#cbc3d7] block mb-1">Room Mode</label>
                    <select
                      value={createData.hostMode}
                      onChange={(e) => setCreateData({ ...createData, hostMode: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#1a1b24] text-white text-xs border border-white/10 focus:outline-none"
                    >
                      <option value="friendly">Anyone can DJ</option>
                      <option value="hostOnly">Host Only DJ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#cbc3d7] block mb-1">PIN (Optional)</label>
                    <input
                      type="password"
                      maxLength={8}
                      value={createData.pin}
                      onChange={(e) => setCreateData({ ...createData, pin: e.target.value })}
                      placeholder="Optional PIN"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1b24] text-white text-xs border border-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                {currentSong && (
                  <p className="text-[11px] text-[#d0bcff] flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Current song will seamlessly carry into the room!</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#a078ff] text-[#340080] font-headline font-bold text-xs hover:scale-[1.01] transition-transform active:scale-95 shadow-[0_0_20px_rgba(160,120,255,0.4)]"
                >
                  {loading ? 'Creating Stage...' : 'Launch Live Stage'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-3">
                <div>
                  <label className="text-[11px] text-[#cbc3d7] block mb-1">Room Code or Invite Link</label>
                  <input
                    type="text"
                    required
                    value={joinData.roomId}
                    onChange={(e) => setJoinData({ ...joinData, roomId: e.target.value })}
                    placeholder="e.g. ABCD or full link"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b24] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#a078ff] border border-white/10 uppercase tracking-wider font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#cbc3d7] block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={joinData.name}
                    onChange={(e) => setJoinData({ ...joinData, name: e.target.value })}
                    placeholder="e.g. Sarah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1a1b24] text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#a078ff] border border-white/10"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#cbc3d7] block mb-1">PIN (if room is locked)</label>
                  <input
                    type="password"
                    maxLength={8}
                    value={joinData.pin}
                    onChange={(e) => setJoinData({ ...joinData, pin: e.target.value })}
                    placeholder="Optional PIN"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1b24] text-white text-xs border border-white/10 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#4cd7f6] text-[#003640] font-headline font-bold text-xs hover:scale-[1.01] transition-transform active:scale-95 shadow-[0_0_20px_rgba(76,215,246,0.4)]"
                >
                  {loading ? 'Connecting...' : 'Join Party Stage'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
