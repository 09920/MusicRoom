import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ChevronDown, 
  ListMusic, 
  Heart, 
  Plus, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Radio, 
  Video, 
  Headphones, 
  Trash2, 
  Music2,
  Mic2,
  Disc3,
  Image as ImageIcon,
  BookmarkPlus,
  Check,
  Sparkles,
  Sliders,
  Share2,
  Maximize2,
  Minimize2,
  Download
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const EQ_PRESETS = [
  { name: 'Club Warmth', bands: [4.5, 2.0, 0.0, 3.2, 1.8] },
  { name: 'Vocal Clarity', bands: [-1.0, 1.0, 3.5, 4.0, 2.0] },
  { name: 'Studio Flat', bands: [0.0, 0.0, 0.0, 0.0, 0.0] },
  { name: 'Immersive Atmos', bands: [3.0, 1.5, 2.0, 3.8, 4.2] },
];

export default function FullScreenPlayer() {
  const {
    currentSong,
    playback,
    isFullScreen,
    setIsFullScreen,
    togglePlayPause,
    seekTo,
    nextSong,
    prevSong,
    isLiked,
    toggleLike,
    openAddToPlaylistModal,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    isAudioOnly,
    toggleAudioOnly,
    radioMode,
    toggleRadio,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    queue,
    removeFromQueue,
    clearQueue,
    playSong,
    lyricsState,
    fetchLyrics,
    playingFrom,
    createPlaylist,
    addSongToPlaylist,
    playFromCollection
  } = usePlayer();

  // Desktop active tab: 'lyrics' | 'queue' | 'specs'
  const [activeTab, setActiveTab] = useState('lyrics');
  // Visual style for album stage: 'art' (square sleeve) | 'vinyl' (holographic spinning vinyl)
  const [stageStyle, setStageStyle] = useState('art');
  // Lyrics text scale
  const [lyricsScale, setLyricsScale] = useState(1);
  // Equalizer preset
  const [selectedEqPreset, setSelectedEqPreset] = useState('Club Warmth');
  const [showEqModal, setShowEqModal] = useState(false);
  // Related recommendations
  const [relatedTracks, setRelatedTracks] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [isSavedPlaylist, setIsSavedPlaylist] = useState(false);

  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Fetch related tracks when tab is 'specs'
  useEffect(() => {
    if (activeTab === 'specs' && currentSong?.videoId) {
      setLoadingRelated(true);
      socket.emit('radio:get_tracks', { song: currentSong }, (res) => {
        setLoadingRelated(false);
        if (res?.success && Array.isArray(res.tracks)) {
          setRelatedTracks(res.tracks.filter((t) => t.videoId !== currentSong.videoId).slice(0, 12));
        }
      });
    }
  }, [activeTab, currentSong?.videoId]);

  // Compute active lyric based on playback.currentTime
  const activeLyricIndex = useMemo(() => {
    if (!lyricsState?.lines || lyricsState.lines.length === 0) return -1;
    const curTime = playback.currentTime;
    let active = -1;
    for (let i = 0; i < lyricsState.lines.length; i++) {
      if (lyricsState.lines[i].time <= curTime) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  }, [lyricsState?.lines, playback.currentTime]);

  // Auto-scroll active lyric into view
  useEffect(() => {
    if (activeTab === 'lyrics' && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex, activeTab]);

  if (!isFullScreen || !currentSong) return null;

  const liked = isLiked(currentSong.videoId);

  const handleSeekChange = (e) => {
    const newTime = Number(e.target.value);
    seekTo(newTime);
  };

  const handleSaveQueueAsPlaylist = () => {
    if (!createPlaylist || !addSongToPlaylist) return;
    const playlistName = playingFrom?.name || `Queue Vault (${new Date().toLocaleDateString()})`;
    const newPl = createPlaylist(playlistName);
    if (newPl) {
      if (currentSong) addSongToPlaylist(newPl.id, currentSong);
      queue.forEach((s) => addSongToPlaylist(newPl.id, s));
      setIsSavedPlaylist(true);
      setTimeout(() => setIsSavedPlaylist(false), 2500);
    }
  };

  const progressPercent = playback.duration > 0
    ? Math.min(100, Math.max(0, (playback.currentTime / playback.duration) * 100))
    : 0;

  const remainingTime = playback.duration > playback.currentTime
    ? playback.duration - playback.currentTime
    : 0;

  const currentEqPresetObj = EQ_PRESETS.find(p => p.name === selectedEqPreset) || EQ_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e16]/98 backdrop-blur-3xl flex flex-col justify-between overflow-hidden text-on-surface font-body animate-in slide-in-from-bottom duration-300 select-none">
      
      {/* Ambient Atmospheric Glow Backdrop */}
      <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[420px] h-[420px] bg-secondary/15 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-tertiary-container/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ───────────────────────────────────────────────────────── */}
      {/* TOP CONTEXT & MODE BAR                                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-b border-white/[0.06] shrink-0 bg-surface-container-lowest/80 backdrop-blur-xl">
        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-inner border border-white/[0.05]">
          <button
            type="button"
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-label text-xs sm:text-sm transition-all ${
              activeTab === 'lyrics'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(160,120,255,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">graphic_eq</span>
            <span>Now Playing & Lyrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-label text-xs sm:text-sm transition-all ${
              activeTab === 'queue'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(160,120,255,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">queue_music</span>
            <span>Up Next ({queue.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-label text-xs sm:text-sm transition-all ${
              activeTab === 'specs'
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_16px_rgba(160,120,255,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">info</span>
            <span>Master Specs</span>
          </button>
        </div>

        {/* Center Hi-Res Specs Pill */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface-container-low/90 backdrop-blur-xl shadow-sm border border-white/[0.04]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
            <span className="font-code text-xs uppercase tracking-wider text-secondary font-medium">
              Master Spatial FLAC
            </span>
          </div>
          <span className="text-outline font-code text-xs">•</span>
          <span className="font-code text-xs text-on-surface-variant">24-Bit / 192kHz</span>
          <span className="text-outline font-code text-xs">•</span>
          <span className="flex items-center gap-1 font-code text-xs text-primary">
            <span className="material-symbols-outlined text-xs">surround_sound</span> Dolby Atmos
          </span>
          <button
            type="button"
            onClick={() => setShowEqModal(!showEqModal)}
            className={`ml-1 flex items-center justify-center w-6 h-6 rounded-full transition-all ${
              showEqModal ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-secondary hover:bg-surface-bright'
            }`}
            title="Toggle DSP Equalizer"
          >
            <span className="material-symbols-outlined text-xs">tune</span>
          </button>
        </div>

        {/* Right Immersive Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openAddToPlaylistModal(currentSong)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all shadow-sm border border-white/[0.04]"
            title="Add to Playlist"
          >
            <span className="material-symbols-outlined text-base">playlist_add</span>
          </button>

          <button
            type="button"
            onClick={() => setStageStyle(s => s === 'art' ? 'vinyl' : 'art')}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all shadow-sm border border-white/[0.04]"
            title="Toggle Vinyl Record vs Album Sleeve"
          >
            <span className="material-symbols-outlined text-base">{stageStyle === 'art' ? 'album' : 'image'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all shadow-sm border border-white/[0.04]"
            title="Minimize"
          >
            <span className="material-symbols-outlined text-base">expand_more</span>
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 12-COLUMN RESPONSIVE AUDIO CANVAS                         */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start px-6 lg:px-10 py-5 overflow-y-auto no-scrollbar">
        
        {/* ── LEFT & CENTER-LEFT: THE ALBUM & VISUALIZER HUB (5 Columns) ── */}
        <section className="lg:col-span-5 flex flex-col gap-5 bg-surface-container-lowest/60 backdrop-blur-2xl rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden border border-white/[0.04]">
          {/* Top Track Accent Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-code text-xs uppercase tracking-wider">
                Aether Ultra Audio
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-code text-xs">
                DR14 Dynamic
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-sm">wifi_tethering</span>
              <span className="font-code text-xs">Acoustic Space: 3D Wide</span>
            </div>
          </div>

          {/* Vinyl & Album Art Showcase Stage */}
          <div className="relative w-full aspect-square max-w-[380px] mx-auto flex items-center justify-center group my-2">
            {/* Colored Light Bleed Ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/40 via-secondary/30 to-tertiary-container/30 rounded-2xl blur-3xl transform group-hover:scale-105 transition-all duration-700 pointer-events-none" />

            {/* Peeking Vinyl Holographic Disc (or full Vinyl Mode) */}
            <div className={`absolute right-0 top-3 bottom-3 w-4/5 rounded-full bg-surface-container-lowest shadow-2xl flex items-center justify-center transform ${
              stageStyle === 'vinyl' ? 'translate-x-0 w-full z-20' : 'translate-x-7 group-hover:translate-x-12'
            } transition-transform duration-500 overflow-hidden pointer-events-none`}>
              <div className={`w-full h-full rounded-full bg-gradient-to-tr from-surface-container-lowest via-surface-container-highest to-surface-container-lowest opacity-90 p-4 flex items-center justify-center ${
                playback.isPlaying ? 'animate-[spin_18s_linear_infinite]' : ''
              }`}>
                <div className="w-full h-full rounded-full bg-surface-container-lowest/80 p-8 flex items-center justify-center shadow-inner">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary via-secondary to-tertiary p-1 flex items-center justify-center shadow-[0_0_20px_rgba(208,188,255,0.6)]">
                    <div className="w-6 h-6 rounded-full bg-surface-container-lowest shadow-inner" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Album Sleeve */}
            {stageStyle === 'art' && (
              <div className="relative w-4/5 aspect-square rounded-xl overflow-hidden shadow-2xl bg-surface-container-high z-10 transform group-hover:-translate-x-3 transition-transform duration-500 border border-white/[0.08]">
                <img
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                  alt={currentSong.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" />

                {/* Floating Play Overlay Pill */}
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="absolute bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(160,120,255,0.6)] hover:scale-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl">
                    {playback.isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                {/* Holographic Decal Badge */}
                <div className="absolute top-4 left-4 px-2 py-1 rounded bg-surface-container-lowest/70 backdrop-blur-md text-on-surface font-code text-xs flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-xs text-primary">album</span>
                  <span>DELUXE STEREO</span>
                </div>
              </div>
            )}
          </div>

          {/* Track Information & Artist Metadata */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <h1 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface tracking-tight leading-tight truncate">
                  {currentSong.title}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-headline font-medium text-base text-primary inline-flex items-center gap-1">
                    {currentSong.channelTitle || 'Artist'}
                    <span className="material-symbols-outlined text-sm text-secondary" title="Verified Artist">
                      verified
                    </span>
                  </span>
                </div>
                <p className="font-body text-xs text-on-surface-variant mt-1">
                  Aether Sound Studio Vault • 2026 Master • Spatial Engine
                </p>
              </div>

              {/* Favorite & Quick Save Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleLike(currentSong)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high transition-all ${
                    liked ? 'text-tertiary-container shadow-[0_0_12px_rgba(255,81,106,0.3)]' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  title={liked ? "Unlike" : "Like"}
                >
                  <span className={`material-symbols-outlined ${liked ? 'fill-1' : ''}`}>
                    {liked ? 'favorite' : 'favorite_border'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleAudioOnly}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isAudioOnly ? 'bg-secondary text-surface-container-lowest' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                  title={isAudioOnly ? "Audio Only Mode Active" : "Standard Mode"}
                >
                  <Headphones className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audio Enhancer Quick Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <button
                type="button"
                onClick={() => setShowEqModal(true)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-xs text-secondary">tune</span>
                <span>DSP: {selectedEqPreset}</span>
              </button>

              <button
                type="button"
                onClick={toggleRadio}
                className={`flex items-center gap-1 px-3 py-1 rounded-full font-label text-xs transition-colors ${
                  radioMode ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Radio {radioMode ? 'ON' : 'OFF'}</span>
              </button>

              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-label text-xs">
                <span className="material-symbols-outlined text-xs">spatial_audio_off</span>
                <span>Head Tracking: Active</span>
              </div>
            </div>
          </div>

          {/* Spectrum Audio Visualizer Graph */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-on-surface-variant font-code text-xs">
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                Live Real-time FFT Visualizer
              </span>
              <span className="text-outline">60 FPS Core Audio Engine</span>
            </div>

            {/* Detailed Animated Waveform Graphic */}
            <div className="relative w-full h-16 bg-surface-container-lowest/80 rounded-xl p-2 flex items-end justify-between gap-1 overflow-hidden shadow-inner border border-white/[0.04]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-container/10 to-transparent pointer-events-none" />
              
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 400 48">
                <defs>
                  <linearGradient id="spectrumGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#4cd7f6" />
                    <stop offset="40%" stopColor="#a078ff" />
                    <stop offset="70%" stopColor="#d0bcff" />
                    <stop offset="100%" stopColor="#ff516a" />
                  </linearGradient>
                </defs>
                <path
                  className={`opacity-90 ${playback.isPlaying ? 'animate-pulse' : ''}`}
                  d="M4,48 L4,28 M12,48 L12,20 M20,48 L20,38 M28,48 L28,14 M36,48 L36,8 M44,48 L44,22 M52,48 L52,32 M60,48 L60,10 M68,48 L68,6 M76,48 L76,18 M84,48 L84,30 M92,48 L92,12 M100,48 L100,4 M108,48 L108,16 M116,48 L116,24 M124,48 L124,10 M132,48 L132,18 M140,48 L140,32 M148,48 L148,14 M156,48 L156,6 M164,48 L164,22 M172,48 L172,34 M180,48 L180,8 M188,48 L188,2 M196,48 L196,18 M204,48 L204,30 M212,48 L212,12 M220,48 L220,6 M228,48 L228,26 M236,48 L236,36 M244,48 L244,14 M252,48 L252,10 M260,48 L260,20 M268,48 L268,34 M276,48 L276,8 M284,48 L284,4 M292,48 L292,16 M300,48 L300,28 M308,48 L308,12 M316,48 L316,24 M324,48 L324,36 M332,48 L332,18 M340,48 L340,10 M348,48 L348,22 M356,48 L356,32 M364,48 L364,14 M372,48 L372,28 M380,48 L380,18 M388,48 L388,38 M396,48 L396,26"
                  stroke="url(#spectrumGradient)"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] text-outline font-code">
              <span>20 Hz (Sub-Bass)</span>
              <span>500 Hz (Warmth)</span>
              <span>4 kHz (Presence)</span>
              <span>20 kHz (Air)</span>
            </div>
          </div>

          {/* Scrubber & Primary Stage Transport */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="relative group cursor-pointer py-1">
              <input
                type="range"
                min="0"
                max={playback.duration || 100}
                value={playback.currentTime || 0}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-[#4cd7f6]"
              />
            </div>

            <div className="flex items-center justify-between font-code text-xs text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="text-secondary font-medium">{formatTime(playback.currentTime)}</span>
                <span className="text-outline">/</span>
                <span>{formatTime(playback.duration)}</span>
              </div>
              <span className="text-outline text-xs">-{formatTime(remainingTime)} Remaining</span>
            </div>

            {/* Stage Transport Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`p-2 transition-colors ${isShuffled ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={prevSong}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:scale-110 active:scale-90 transition-all"
                  title="Previous Track"
                >
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-container text-on-primary-container hover:scale-105 active:scale-95 shadow-[0_0_24px_rgba(160,120,255,0.5)] transition-all"
                  title={playback.isPlaying ? "Pause" : "Play"}
                >
                  {playback.isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={nextSong}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:scale-110 active:scale-90 transition-all"
                  title="Next Track"
                >
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>
              </div>

              <button
                type="button"
                onClick={cycleRepeat}
                className={`p-2 transition-colors ${repeatMode !== 'off' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                title="Repeat"
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </section>

        {/* ── CENTER-RIGHT: SYNCHRONIZED KINETIC KARAOKE LYRICS (4 Columns) ── */}
        <section className={`lg:col-span-4 flex flex-col h-[740px] bg-surface-container-lowest/60 backdrop-blur-2xl rounded-2xl p-6 shadow-xl relative overflow-hidden border border-white/[0.04] ${
          activeTab !== 'lyrics' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Lyrics Header Toolbar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">mic</span>
              <span className="font-headline font-bold text-lg text-on-surface">Kinetic Lyrics</span>
              {lyricsState.synced && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-code font-bold">
                  SYNCED
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-surface-container rounded-full p-0.5 border border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setLyricsScale(s => Math.max(0.8, s - 0.1))}
                  className="w-6 h-6 rounded-full hover:bg-surface-container-high text-xs text-on-surface flex items-center justify-center font-bold"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setLyricsScale(s => Math.min(1.4, s + 0.1))}
                  className="w-6 h-6 rounded-full hover:bg-surface-container-high text-xs text-on-surface flex items-center justify-center font-bold"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Sync Status & Auto-Scroll Info */}
          <div className="flex items-center justify-between py-2 text-xs text-outline font-label">
            <span className="text-secondary font-medium">Original Stream Synchronized</span>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-xs">sync</span>
              <span className="font-code text-xs">Auto-Scroll: ON</span>
            </div>
          </div>

          {/* The Kinetic Scrolling Lyrics Column */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto no-scrollbar pr-2 flex flex-col gap-6 py-8 relative selection:bg-primary selection:text-on-primary scroll-smooth"
            style={{ fontSize: `${lyricsScale}rem` }}
          >
            {/* Top Fade */}
            <div className="sticky top-0 left-0 right-0 h-10 bg-gradient-to-b from-surface-container-lowest via-surface-container-lowest/70 to-transparent pointer-events-none -mt-8 mb-2 z-10" />

            {lyricsState.loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-outline gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs font-code animate-pulse">Syncing acoustic timecodes...</p>
              </div>
            ) : lyricsState.lines && lyricsState.lines.length > 0 ? (
              lyricsState.lines.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                const isPast = idx < activeLyricIndex;

                return (
                  <div
                    key={`line-${idx}`}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => seekTo(line.time)}
                    className={`flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'p-4 rounded-xl bg-surface-container-high/60 backdrop-blur-xl shadow-[0_0_24px_rgba(160,120,255,0.25)] scale-[1.02] border border-primary/20'
                        : isPast
                        ? 'opacity-40 hover:opacity-75'
                        : 'opacity-65 hover:opacity-100'
                    }`}
                  >
                    {isActive && (
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-code text-xs text-secondary font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                          [{formatTime(line.time)}] • ACTIVE CHORUS
                        </span>
                        <span className="material-symbols-outlined text-sm text-primary">equalizer</span>
                      </div>
                    )}

                    {!isActive && (
                      <span className="font-code text-[11px] text-outline">
                        [{formatTime(line.time)}]
                      </span>
                    )}

                    <p className={`font-headline font-semibold tracking-tight leading-snug ${
                      isActive
                        ? 'text-lg sm:text-xl text-on-surface text-secondary drop-shadow-[0_0_12px_rgba(76,215,246,0.8)] font-bold'
                        : 'text-base sm:text-lg text-on-surface'
                    }`}>
                      {line.text}
                    </p>
                  </div>
                );
              })
            ) : (
              /* Fallback Atmospheric Lyrics Preview if API response pending */
              <div className="flex flex-col gap-6 py-6 text-left">
                <div className="opacity-35">
                  <span className="font-code text-xs text-outline">[00:24]</span>
                  <p className="font-headline font-semibold text-lg text-on-surface">
                    Chrome horizons bleeding into the purple dusk
                  </p>
                </div>
                <div className="opacity-50">
                  <span className="font-code text-xs text-outline">[00:48]</span>
                  <p className="font-headline font-semibold text-lg text-on-surface">
                    Neon lights reflect across the asphalt rain
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-high/60 backdrop-blur-xl shadow-[0_0_24px_rgba(160,120,255,0.25)] border border-primary/20">
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-code text-xs text-secondary font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                      ACTIVE RESONANCE
                    </span>
                    <span className="material-symbols-outlined text-sm text-primary">equalizer</span>
                  </div>
                  <p className="font-headline font-bold text-xl text-secondary drop-shadow-[0_0_12px_rgba(76,215,246,0.8)]">
                    {currentSong.title}
                  </p>
                  <p className="font-body text-xs text-on-surface-variant italic pt-1">
                    "Tracing signals through the midnight frequency"
                  </p>
                </div>
                <div className="opacity-65">
                  <span className="font-code text-xs text-outline">[01:52]</span>
                  <p className="font-headline font-medium text-lg text-on-surface">
                    We accelerate into the infinite static
                  </p>
                </div>
                <div className="opacity-45">
                  <span className="font-code text-xs text-outline">[02:18]</span>
                  <p className="font-headline font-medium text-lg text-on-surface">
                    Hold the signal till the morning breaks the grid
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Fade */}
            <div className="sticky bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-transparent pointer-events-none -mb-8 mt-2" />
          </div>

          <div className="pt-3 flex items-center justify-between text-outline font-code text-xs border-t border-white/[0.04]">
            <span>Synced with Timecode Engine</span>
            <button
              type="button"
              onClick={() => {
                if (activeLineRef.current) {
                  activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="text-primary hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">my_location</span>
              <span>Recenter</span>
            </button>
          </div>
        </section>

        {/* ── RIGHT PANEL: QUEUE & STUDIO DSP ACOUSTICS (3 Columns) ── */}
        <aside className={`lg:col-span-3 flex flex-col gap-4 ${
          activeTab === 'lyrics' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Widget 1: Studio DSP Equalizer */}
          <div className="flex flex-col gap-3 bg-surface-container-lowest/60 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 shadow-xl border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">tune</span>
                <span className="font-headline font-bold text-base text-on-surface">Studio DSP EQ</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-code text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            {/* Preset Selection Chips */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {EQ_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSelectedEqPreset(preset.name)}
                  className={`px-2 py-1 rounded-lg font-label text-xs font-semibold truncate transition-all ${
                    selectedEqPreset === preset.name
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* 5-Band Vertical Slider Stage */}
            <div className="flex items-end justify-between gap-2 h-32 pt-3 pb-2 px-3 bg-surface-container-low/70 rounded-xl border border-white/[0.02]">
              {['32Hz', '120Hz', '1kHz', '4kHz', '16kHz'].map((hz, idx) => {
                const val = currentEqPresetObj.bands[idx];
                const heightPercent = Math.min(100, Math.max(20, (val + 6) * 8.3));
                return (
                  <div key={hz} className="flex flex-col items-center gap-1.5 h-full justify-end flex-1">
                    <span className="font-code text-[10px] text-primary font-semibold">
                      {val > 0 ? `+${val}` : `${val}`}
                    </span>
                    <div className="relative w-2 h-16 bg-surface-container-highest rounded-full overflow-hidden flex items-end">
                      <div
                        className="w-full bg-primary rounded-full shadow-[0_0_8px_rgba(208,188,255,0.7)] transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="font-code text-[9px] text-outline truncate">{hz}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Widget 2: Up Next Queue Stream */}
          <div className="flex flex-col gap-3 bg-surface-container-lowest/60 backdrop-blur-2xl rounded-2xl p-4 sm:p-5 shadow-xl border border-white/[0.04] flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">queue_music</span>
                <span className="font-headline font-bold text-base text-on-surface">Up Next</span>
              </div>
              <span className="text-outline font-code text-xs">{queue.length} Tracks</span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto no-scrollbar">
              {queue.length === 0 ? (
                <div className="py-8 text-center text-outline text-xs">
                  <p>Queue is empty</p>
                  <p className="text-[11px] text-white/30 mt-1">Playing related radio stations</p>
                </div>
              ) : (
                queue.slice(0, 8).map((qSong, idx) => (
                  <div
                    key={`q-${qSong.videoId}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container transition-all group"
                  >
                    <div
                      onClick={() => playSong(qSong)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest">
                        <img
                          src={qSong.thumbnail || `https://i.ytimg.com/vi/${qSong.videoId}/hqdefault.jpg`}
                          alt={qSong.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                          {qSong.title}
                        </p>
                        <p className="text-[10px] text-on-surface-variant truncate">
                          {qSong.channelTitle || 'Artist'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromQueue?.(idx)}
                      className="text-outline hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {queue.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={handleSaveQueueAsPlaylist}
                  className="font-label text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{isSavedPlaylist ? 'Saved to Library!' : 'Save as Playlist'}</span>
                </button>
                <button
                  type="button"
                  onClick={clearQueue}
                  className="font-code text-xs text-outline hover:text-rose-400 transition-colors"
                >
                  Clear Queue
                </button>
              </div>
            )}
          </div>
        </aside>

      </div>

    </div>
  );
}
