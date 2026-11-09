import React, { useState, useEffect } from 'react';
import { 
  Play, 
  MoreVertical, 
  Heart, 
  Sparkles, 
  Music2, 
  Disc3, 
  Trophy, 
  ListMusic, 
  Radio, 
  Share2, 
  Bookmark, 
  TrendingUp, 
  Activity, 
  Volume2, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';
import { isCompilationOrMix, TOP_100_HITS, INSTAGRAM_TRENDING_HITS, INDIE_HINDI_HITS, BOLLYWOOD_ROMANTIC_HITS, PUNJABI_VIRAL_HITS } from '../data/topHitsData';

const MOODS = [
  { id: 'Trending', label: '🔥 Trending' },
  { id: 'Hindi Hits', label: '🎧 Hindi Hits' },
  { id: 'Chill Lo-Fi', label: '☕ Chill Lo-Fi' },
  { id: 'Punjabi', label: '⚡ Punjabi' },
  { id: 'Romantic', label: '🌹 Romantic' },
  { id: 'English Pop', label: '✨ English Pop' },
  { id: 'Workout', label: '💪 Workout' }
];

function getDynamicGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Late night vibes';
}

// 2x4 Quick Jump Hub Items (Combining Stitch Mockup items + MusicRoom Curated Playlists)
const QUICK_JUMP_CARDS = [
  {
    id: 'top100',
    title: 'Top 100 Hits Spotify',
    subtitle: 'JsVibes Music • 100 Songs',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
    isPlaylist: true,
    playlistData: TOP_100_HITS
  },
  {
    id: 'instagram',
    title: 'Trending Instagram Mashup',
    subtitle: 'Voxwaves • Viral Reels 2026',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
    isPlaylist: true,
    playlistData: INSTAGRAM_TRENDING_HITS
  },
  {
    id: 'indie-hindi',
    title: 'Indie Hindi Hits',
    subtitle: 'Rochit Bansal • 35 Tracks',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
    isPlaylist: true,
    playlistData: INDIE_HINDI_HITS
  },
  {
    id: 'romantic',
    title: 'Bollywood Romantic',
    subtitle: 'Grow Music • Love Vibes',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
    isPlaylist: true,
    playlistData: BOLLYWOOD_ROMANTIC_HITS
  },
  {
    id: 'punjabi',
    title: 'Punjabi Viral Hits',
    subtitle: 'Desi Beats • High Energy',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80',
    isPlaylist: true,
    playlistData: PUNJABI_VIRAL_HITS
  },
  {
    id: 'daily1',
    title: 'Daily Mix 1',
    subtitle: 'Bonobo, Four Tet, Tycho',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80',
    videoId: 'hBCrkxP6L4A',
    isPlaylist: false
  },
  {
    id: 'synthwave',
    title: 'Synthwave Essentials',
    subtitle: 'Gunship, The Midnight',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80',
    videoId: 'k70n_2Z2w-g',
    isPlaylist: false
  },
  {
    id: 'lofi',
    title: 'Late Night Lofi',
    subtitle: 'Chillhop, Kudasa, Nujabes',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80',
    videoId: 'LK7-_dgAVQE',
    isPlaylist: false
  }
];

// Curated Soundscape Mixes ("Made for You")
const CURATED_MIXES = [
  {
    id: 'mix-1',
    tag: 'DAILY',
    tagColor: 'text-[#d0bcff]',
    title: 'Daily Mix 1',
    artists: 'Jon Hopkins, Bonobo, Rival Consoles',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
    videoId: 'hBCrkxP6L4A'
  },
  {
    id: 'mix-2',
    tag: 'WEEKLY',
    tagColor: 'text-[#4cd7f6]',
    title: 'Discover Weekly',
    artists: 'Fresh underground electronic & indie',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    videoId: 'k70n_2Z2w-g'
  },
  {
    id: 'mix-3',
    tag: '165 BPM',
    tagColor: 'text-[#ff516a]',
    title: 'Hyperpop Energy',
    artists: 'High voltage futuristic pop & bass',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
    videoId: 'LK7-_dgAVQE'
  },
  {
    id: 'mix-4',
    tag: 'FOCUS',
    tagColor: 'text-[#cbc3d7]',
    title: 'Deep Focus Flow',
    artists: 'Binaural drone, generative synthesis',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    videoId: 'ElZfdU54Cp8'
  },
  {
    id: 'mix-5',
    tag: 'LOFI',
    tagColor: 'text-[#4cd7f6]',
    title: 'Afterhours Lofi',
    artists: 'Warm vinyl dust, mellow Fender Rhodes',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    videoId: 'hBCrkxP6L4A'
  }
];

// Trending Top Worldwide tracks
const TRENDING_TOP_5 = [
  {
    rank: '01',
    title: 'Solaris (Extended Mix)',
    artist: 'Lane 8 & Arctic Lake',
    album: 'Reviver Echoes',
    streams: '142.5M',
    duration: '6:12',
    videoId: 'hBCrkxP6L4A',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80'
  },
  {
    rank: '02',
    title: 'Neon Genesis',
    artist: 'Fred again.. & Skrillex',
    album: 'USB Sessions 04',
    streams: '118.2M',
    duration: '3:44',
    videoId: 'k70n_2Z2w-g',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&q=80'
  },
  {
    rank: '03',
    title: 'Subterranean',
    artist: 'Bicep feat. Clara La San',
    album: 'Chroma 003',
    streams: '96.8M',
    duration: '4:51',
    videoId: 'LK7-_dgAVQE',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80'
  },
  {
    rank: '04',
    title: 'Elysium Pulse',
    artist: 'RÜFÜS DU SOL',
    album: 'Inhale / Exhale',
    streams: '88.4M',
    duration: '5:18',
    videoId: 'ElZfdU54Cp8',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'
  },
  {
    rank: '05',
    title: 'Starlight Echoes',
    artist: 'Tourist',
    album: 'Memory Shore',
    streams: '74.1M',
    duration: '4:07',
    videoId: 'hBCrkxP6L4A',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80'
  }
];

export default function DiscoverView({ onOpenAiTheme }) {
  const {
    selectedMood,
    setSelectedMood,
    playSong,
    currentSong,
    playback,
    history,
    openSongMenu,
    isLiked,
    toggleLike,
    addToQueue,
    playFromCollection,
    openPlaylist
  } = usePlayer();

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('Alex');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('musicroom_user_name');
      if (stored) setUserName(stored);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    socket.emit('song:trending', { mood: selectedMood }, (res) => {
      setLoading(false);
      if (res?.success && res.songs) {
        setTrendingSongs(res.songs);
      }
    });
  }, [selectedMood]);

  const greeting = getDynamicGreeting();

  const handleQuickJumpClick = (card) => {
    if (card.isPlaylist && card.playlistData) {
      openPlaylist(card.playlistData);
    } else {
      playSong({
        videoId: card.videoId || 'hBCrkxP6L4A',
        title: card.title,
        channelTitle: card.subtitle,
        thumbnail: card.thumbnail
      });
    }
  };

  const handleSpotlightPlay = () => {
    // Play featured album / top hits
    openPlaylist(TOP_100_HITS);
  };

  return (
    <div className="relative w-full space-y-8 pb-32 select-none overflow-x-hidden">
      
      {/* Dynamic Top Ambient Aura from Stitch Design System */}
      <div className="absolute -top-32 left-1/4 w-[620px] h-[340px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute -top-20 right-1/4 w-[480px] h-[280px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* =========================================================================
          SECTION 1: Top Greeting & Quick Jump Hub (2 rows x 4 columns)
      ========================================================================= */}
      <section className="flex flex-col gap-4 pt-1">
        
        {/* Top Header Row: Session Active Indicator & Greeting */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] text-[#4cd7f6] uppercase tracking-widest font-medium">
                Acoustic Session Active
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#282933] text-[#4cd7f6]">
                <span className="w-1 h-2.5 bg-[#4cd7f6] rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-[#4cd7f6] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-3 bg-[#4cd7f6] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <span className="w-1 h-1.5 bg-[#4cd7f6] rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              </span>
            </div>
            
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-[#e3e1ee] tracking-tight">
              {greeting}, {userName}
            </h1>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0d0e16]/80 backdrop-blur-xl border border-white/[0.06]">
            <button 
              type="button" 
              onClick={() => setSelectedMood('Trending')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedMood === 'Trending'
                  ? 'bg-[#383843] text-white shadow-sm'
                  : 'text-[#cbc3d7] hover:text-white'
              }`}
            >
              All Audio
            </button>
            <button 
              type="button"
              onClick={() => setSelectedMood('Chill Lo-Fi')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedMood === 'Chill Lo-Fi'
                  ? 'bg-[#383843] text-white shadow-sm'
                  : 'text-[#cbc3d7] hover:text-white'
              }`}
            >
              Spatial Mixes
            </button>
            <button 
              type="button"
              onClick={() => setSelectedMood('Hindi Hits')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedMood === 'Hindi Hits'
                  ? 'bg-[#383843] text-white shadow-sm'
                  : 'text-[#cbc3d7] hover:text-white'
              }`}
            >
              Master Tracks
            </button>
          </div>
        </div>

        {/* 2x4 Quick Jump Cards Grid (From Stitch Screen 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-2">
          {QUICK_JUMP_CARDS.map((card) => (
            <div
              key={card.id}
              onClick={() => handleQuickJumpClick(card)}
              className="group relative flex items-center justify-between p-2 rounded-xl bg-[#1a1b24]/90 hover:bg-[#1e1f28] border border-white/[0.06] hover:border-violet-500/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 bg-[#282933] shadow-md border border-white/5">
                  <img
                    src={card.thumbnail}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline text-xs sm:text-sm font-semibold text-[#e3e1ee] group-hover:text-white truncate">
                    {card.title}
                  </span>
                  <span className="font-body text-[11px] text-[#cbc3d7]/70 truncate mt-0.5">
                    {card.subtitle}
                  </span>
                </div>
              </div>

              {/* Floating Violet Play Pill on hover */}
              <button
                type="button"
                aria-label={`Play ${card.title}`}
                className="opacity-0 group-hover:opacity-100 mr-1 w-9 h-9 rounded-full bg-[#a078ff] text-[#340080] flex items-center justify-center shadow-lg transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 hover:scale-105 shrink-0"
              >
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: Featured Hero Spotlight Banner (Chroma / Deluxe Edition)
      ========================================================================= */}
      <section className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#1a1b24] via-[#1e1f28] to-[#282933] p-6 sm:p-8 shadow-2xl border border-white/[0.08]">
        {/* Glow Refraction Layers */}
        <div className="absolute -right-16 -top-24 w-96 h-96 bg-[#a078ff]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-[#4cd7f6]/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Left: Text Meta & Player Controls */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#ff516a] text-[#5b0017] font-semibold text-[11px] uppercase tracking-wider font-mono">
                Exclusive Premiere
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#33343e] text-[#4cd7f6] font-mono text-[11px] tracking-wider flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5" />
                <span>24-Bit / 192kHz Spatial FLAC</span>
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs text-[#d0bcff] tracking-widest uppercase font-semibold">
                Featured Album of the Week
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                CHROMA - Deluxe Edition
              </h2>
              <p className="font-body text-base text-[#cbc3d7] font-normal">
                Kiasmos &amp; Ólafur Arnalds
              </p>
            </div>

            <p className="font-body text-xs sm:text-sm text-[#cbc3d7]/80 max-w-xl line-clamp-2">
              A crystalline fusion of ambient neo-classical piano and minimalist micro-techno rhythms, mastered entirely in discrete 7.1.4 Dolby Atmos for boundless spatial immersion.
            </p>

            {/* Waveform Visualizer Preview */}
            <div className="w-full max-w-lg flex flex-col gap-1 p-3 rounded-xl bg-[#0d0e16]/60 backdrop-blur-md border border-white/[0.06]">
              <div className="flex items-center justify-between font-mono text-[11px] text-[#958ea0]">
                <span>Preview: "Stasis Stream"</span>
                <span className="text-[#4cd7f6]">0:45 / 5:32</span>
              </div>
              
              <div className="flex items-end gap-1.5 h-7 w-full pt-1 px-1">
                <span className="flex-1 bg-[#33343e] rounded-full h-3" />
                <span className="flex-1 bg-[#33343e] rounded-full h-5" />
                <span className="flex-1 bg-[#4cd7f6] rounded-full h-7 animate-pulse" />
                <span className="flex-1 bg-[#4cd7f6] rounded-full h-6 animate-pulse" style={{ animationDelay: '100ms' }} />
                <span className="flex-1 bg-[#d0bcff] rounded-full h-6" />
                <span className="flex-1 bg-[#d0bcff] rounded-full h-4" />
                <span className="flex-1 bg-[#33343e] rounded-full h-6" />
                <span className="flex-1 bg-[#33343e] rounded-full h-5" />
                <span className="flex-1 bg-[#33343e] rounded-full h-3" />
                <span className="flex-1 bg-[#33343e] rounded-full h-4" />
                <span className="flex-1 bg-[#4cd7f6] rounded-full h-7 animate-pulse" style={{ animationDelay: '200ms' }} />
                <span className="flex-1 bg-[#33343e] rounded-full h-5" />
                <span className="flex-1 bg-[#33343e] rounded-full h-2" />
                <span className="flex-1 bg-[#33343e] rounded-full h-6" />
                <span className="flex-1 bg-[#d0bcff] rounded-full h-4" />
                <span className="flex-1 bg-[#33343e] rounded-full h-3" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleSpotlightPlay}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#a078ff] text-[#340080] font-headline font-semibold text-xs sm:text-sm hover:scale-105 transition-transform shadow-[0_0_24px_rgba(160,120,255,0.4)] active:scale-95"
              >
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
                <span>Play Album</span>
              </button>

              <button
                type="button"
                onClick={() => openPlaylist(TOP_100_HITS)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#383843]/80 hover:bg-[#383843] text-[#e3e1ee] font-semibold text-xs sm:text-sm transition-all border border-white/10"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save to Library</span>
              </button>

              <button
                type="button"
                aria-label="Share Album"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="w-10 h-10 rounded-full bg-[#383843]/70 hover:bg-[#383843] text-white flex items-center justify-center transition-colors border border-white/10 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: 3D Floating Layered Vinyl & Artwork */}
          <div className="lg:col-span-5 flex items-center justify-center relative min-h-[260px] sm:min-h-[280px]">
            {/* Spinning Vinyl Disc Sticking Out */}
            <div 
              className="absolute right-4 sm:right-10 w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-[#0a0a0f] shadow-[0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center animate-spin border border-white/10" 
              style={{ animationDuration: '22s' }}
            >
              <div className="w-40 h-40 sm:w-46 sm:h-46 rounded-full border border-white/10 flex items-center justify-center opacity-60">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#03b5d3] flex items-center justify-center shadow-lg">
                    <div className="w-4 h-4 rounded-full bg-[#090a0f]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Album Sleeve Front Layer */}
            <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] group border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80"
                alt="Chroma Deluxe Edition Artwork"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f]/90 via-transparent to-transparent flex items-end p-4">
                <span className="font-mono text-xs text-[#d0bcff] tracking-widest uppercase font-semibold">
                  Edition 01 // 12 Tracks
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Personalized 'Made For You' Curated Soundscapes
      ========================================================================= */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-[#958ea0] uppercase tracking-wider font-semibold">
              Curated Soundscapes
            </span>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#e3e1ee] tracking-tight">
              Made for You
            </h2>
            <span className="font-body text-xs text-[#cbc3d7]/70">
              Intelligently shaped by your listening habits &amp; auditory focus
            </span>
          </div>

          <button
            type="button"
            onClick={() => openPlaylist(TOP_100_HITS)}
            className="flex items-center gap-1 font-body text-xs font-semibold text-[#4cd7f6] hover:text-[#d0bcff] transition-colors"
          >
            <span>Explore All Mixes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {CURATED_MIXES.map((mix) => (
            <div
              key={mix.id}
              onClick={() => {
                playSong({
                  videoId: mix.videoId,
                  title: mix.title,
                  channelTitle: mix.artists,
                  thumbnail: mix.thumbnail
                });
              }}
              className="group flex flex-col p-3 rounded-xl bg-[#1a1b24]/90 hover:bg-[#1e1f28] border border-white/[0.06] hover:border-violet-500/30 transition-all cursor-pointer shadow-sm"
            >
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#282933] mb-2.5 shadow-md">
                <img
                  src={mix.thumbnail}
                  alt={mix.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#0d0e16]/80 backdrop-blur-md font-mono text-[9px] font-bold ${mix.tagColor}`}>
                  {mix.tag}
                </div>
                
                <button
                  type="button"
                  aria-label={`Play ${mix.title}`}
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#a078ff] text-[#340080] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-[0_4px_16px_rgba(160,120,255,0.4)]"
                >
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                </button>
              </div>

              <span className="font-headline text-xs sm:text-sm font-semibold text-[#e3e1ee] group-hover:text-white truncate">
                {mix.title}
              </span>
              <span className="font-body text-[11px] text-[#cbc3d7]/60 truncate mt-0.5">
                {mix.artists}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Split Layout - Trending Worldwide & Mood Clusters
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left (Col 8): Trending Top 5 Chart Table */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-xs text-[#4cd7f6] uppercase tracking-widest font-semibold">
                Global Top 50 Metrics
              </span>
              <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#e3e1ee] tracking-tight">
                Trending Worldwide
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#1e1f28] text-xs text-[#cbc3d7] font-medium border border-white/5">
              Real-time Velocity
            </span>
          </div>

          <div className="w-full flex flex-col gap-1 bg-[#0d0e16]/60 rounded-2xl p-2.5 backdrop-blur-xl border border-white/[0.06]">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-3 py-1.5 font-mono text-[11px] text-[#958ea0] uppercase tracking-wider">
              <span className="col-span-1">#</span>
              <span className="col-span-6 sm:col-span-5">Title &amp; Artist</span>
              <span className="col-span-3 hidden sm:block">Album</span>
              <span className="col-span-3 sm:col-span-2 text-right">Streams</span>
              <span className="col-span-2 sm:col-span-1 text-right">Time</span>
            </div>

            {/* Track Rows */}
            {TRENDING_TOP_5.map((track) => {
              const isPlayingThis = currentSong?.videoId === track.videoId && playback.isPlaying;
              const liked = isLiked(track.videoId);

              return (
                <div
                  key={track.rank}
                  onClick={() => playSong({
                    videoId: track.videoId,
                    title: track.title,
                    channelTitle: track.artist,
                    thumbnail: track.thumbnail
                  })}
                  className={`group grid grid-cols-12 items-center px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isPlayingThis 
                      ? 'bg-[#1e1f28] border border-violet-500/30 shadow-md'
                      : 'hover:bg-[#1a1b24] border border-transparent'
                  }`}
                >
                  <div className="col-span-1 flex items-center">
                    <span className={`group-hover:hidden font-mono text-xs font-semibold ${isPlayingThis ? 'text-[#4cd7f6]' : 'text-[#958ea0]'}`}>
                      {track.rank}
                    </span>
                    <button className="hidden group-hover:flex text-[#d0bcff]" type="button">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="col-span-6 sm:col-span-5 flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#282933]">
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-headline text-xs font-semibold truncate flex items-center gap-1.5 ${isPlayingThis ? 'text-[#d0bcff]' : 'text-[#e3e1ee] group-hover:text-white'}`}>
                        {track.title}
                        {isPlayingThis && <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />}
                      </span>
                      <span className="font-body text-[10px] text-[#cbc3d7]/60 truncate">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 hidden sm:flex items-center min-w-0 pr-2">
                    <span className="font-body text-[11px] text-[#cbc3d7]/70 truncate">
                      {track.album}
                    </span>
                  </div>

                  <div className="col-span-3 sm:col-span-2 flex items-center justify-end font-mono text-[11px] text-[#cbc3d7]/80">
                    {track.streams}
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2 font-mono text-[11px] text-[#cbc3d7]/80">
                    <span>{track.duration}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike({ videoId: track.videoId, title: track.title, channelTitle: track.artist, thumbnail: track.thumbnail });
                      }}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-[#ff516a] text-[#ff516a]' : 'text-white/30 hover:text-white'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (Col 4): Sonic Radar & Weekly Resonance */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-[#d0bcff] uppercase tracking-widest font-semibold">
              Sonic Radar
            </span>
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#e3e1ee] tracking-tight">
              Moods &amp; Genres
            </h2>
          </div>

          <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#1a1b24]/90 border border-white/[0.06] backdrop-blur-xl">
            {/* Ambient Moods Cloud */}
            <div className="flex flex-wrap gap-2">
              <span 
                onClick={() => setSelectedMood('Trending')} 
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#a078ff] to-[#6d3bd7] text-white font-medium text-xs cursor-pointer hover:scale-105 transition-transform shadow-[0_0_12px_rgba(160,120,255,0.3)]"
              >
                ⚡ Melodic Techno
              </span>
              <span 
                onClick={() => setSelectedMood('Chill Lo-Fi')} 
                className="px-3.5 py-1.5 rounded-full bg-[#282933] hover:bg-[#383843] text-[#e3e1ee] text-xs cursor-pointer transition-colors"
              >
                🌆 Synthwave 80s
              </span>
              <span 
                onClick={() => setSelectedMood('English Pop')} 
                className="px-3.5 py-1.5 rounded-full bg-[#282933] hover:bg-[#383843] text-[#4cd7f6] text-xs cursor-pointer transition-colors"
              >
                🦾 Cyberpunk Dark
              </span>
              <span 
                onClick={() => setSelectedMood('Romantic')} 
                className="px-3.5 py-1.5 rounded-full bg-[#282933] hover:bg-[#383843] text-[#e3e1ee] text-xs cursor-pointer transition-colors"
              >
                ☁️ Dream Pop
              </span>
              <span 
                onClick={() => setSelectedMood('Punjabi')} 
                className="px-3.5 py-1.5 rounded-full bg-[#282933] hover:bg-[#383843] text-[#ffb2b7] text-xs cursor-pointer transition-colors"
              >
                🔊 UK Garage / 2-Step
              </span>
              <span 
                onClick={() => setSelectedMood('Hindi Hits')} 
                className="px-3.5 py-1.5 rounded-full bg-[#282933] hover:bg-[#383843] text-[#cbc3d7] text-xs cursor-pointer transition-colors"
              >
                🌙 Deep House Midnight
              </span>
            </div>

            {/* Mini Listening Analytics Sparkline Widget */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-[#cbc3d7]">
                <span>Your Weekly Resonance</span>
                <span className="text-[#4cd7f6] font-mono">+24% electronic</span>
              </div>
              
              {/* SVG Audio Sparkline Chart */}
              <div className="w-full h-14 bg-[#0d0e16]/80 rounded-xl p-2 flex items-center border border-white/5">
                <svg className="w-full h-full text-[#4cd7f6]" fill="none" preserveAspectRatio="none" viewBox="0 0 200 40">
                  <path d="M0,28 Q15,5 30,22 T60,12 T90,32 T120,8 T150,20 T180,4 T200,18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                  <path d="M0,28 Q15,5 30,22 T60,12 T90,32 T120,8 T150,20 T180,4 T200,18 L200,40 L0,40 Z" fill="currentColor" fillOpacity="0.1" />
                </svg>
              </div>

              <div className="flex items-center justify-between font-mono text-[10px] text-[#958ea0]">
                <span>Peak: 140 BPM</span>
                <span>Total: 34.6 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Real-Time Trending Now in {selectedMood} Grid
      ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="font-headline text-lg sm:text-xl font-bold text-white tracking-wide">
              Trending Now in {selectedMood}
            </h3>
            <span className="text-xs text-[#cbc3d7]/60">Real-Time Sync Ready</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-[#1a1b24] border border-white/5 p-3 h-52 animate-pulse flex flex-col justify-between">
                <div className="w-full aspect-square bg-white/5 rounded-lg mb-2" />
                <div className="w-3/4 h-3 bg-white/10 rounded mb-1.5" />
                <div className="w-1/2 h-2.5 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
            {trendingSongs.map((song) => {
              const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
              const liked = isLiked(song.videoId);
              const isMix = isCompilationOrMix(song.title);

              const handleSongClick = () => {
                if (isMix) {
                  openPlaylist(song);
                } else {
                  playFromCollection(trendingSongs, trendingSongs.indexOf(song), `${selectedMood} Trending`);
                }
              };

              return (
                <div
                  key={`trending-${song.videoId}`}
                  className="group relative rounded-xl p-3 flex flex-col justify-between bg-[#1a1b24]/90 hover:bg-[#1e1f28] border border-white/[0.06] hover:border-violet-500/40 transition-all shadow-sm"
                >
                  {/* Artwork & Play Overlay */}
                  <div
                    onClick={handleSongClick}
                    className="relative aspect-square rounded-lg overflow-hidden mb-2.5 bg-[#0d0e16] shadow cursor-pointer"
                  >
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {isMix && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#4cd7f6] text-[#003640] text-[9px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1 z-10">
                        <ListMusic className="w-2.5 h-2.5" />
                        <span>Playlist Tracks</span>
                      </div>
                    )}

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px] gap-1.5">
                      {isMix ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-[#4cd7f6] text-[#003640] flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                            <ListMusic className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded-full">
                            View Playlist Songs
                          </span>
                        </>
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#a078ff] text-[#340080] flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
                          <Play className="w-4 h-4 fill-current translate-x-0.5" />
                        </div>
                      )}
                    </div>

                    {isPlayingThis && (
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#a078ff] text-[10px] font-bold text-[#340080] shadow-lg flex items-center gap-1.5 z-10">
                        <span className="flex items-center gap-0.5">
                          <span className="w-1 h-2 bg-current rounded-full animate-eq-1" />
                          <span className="w-1 h-3 bg-current rounded-full animate-eq-2" />
                          <span className="w-1 h-2 bg-current rounded-full animate-eq-3" />
                        </span>
                        <span>Playing</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1 mb-1.5">
                    <h4
                      onClick={handleSongClick}
                      className="font-headline text-xs sm:text-sm font-semibold text-white truncate leading-tight group-hover:text-[#d0bcff] cursor-pointer transition-colors"
                      title={song.title}
                    >
                      {song.title}
                    </h4>
                    <p className="font-body text-[11px] text-[#cbc3d7]/60 truncate mt-0.5">
                      {song.channelTitle || 'YouTube Music'}
                    </p>
                  </div>

                  {/* Card Bottom Row: Heart, Play Mix direct & 3-Dot Menu */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] mt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleLike(song)}
                      className="text-white/40 hover:text-[#ff516a] transition-colors active:scale-90 p-1"
                      title={liked ? "Liked" : "Like"}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          liked ? 'fill-[#ff516a] text-[#ff516a] scale-110' : ''
                        }`}
                      />
                    </button>

                    <div className="flex items-center gap-1">
                      {isMix && (
                        <button
                          type="button"
                          onClick={() => openPlaylist(song)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/30 hover:bg-[#4cd7f6]/25 transition-colors"
                          title="Open playlist page"
                        >
                          View Songs
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openSongMenu(song)}
                        className="text-white/40 hover:text-white p-1 rounded-full transition-colors active:scale-90"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
