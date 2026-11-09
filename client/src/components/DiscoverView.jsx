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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';
import { 
  isCompilationOrMix, 
  TOP_100_HITS, 
  INSTAGRAM_TRENDING_HITS, 
  INDIE_HINDI_HITS, 
  BOLLYWOOD_ROMANTIC_HITS, 
  PUNJABI_VIRAL_HITS,
  DAILY_MIX_1,
  DISCOVER_WEEKLY,
  FAST_165BPM_DRIVING,
  DEEP_FOCUS_NEURAL,
  LATE_NIGHT_LOFI
} from '../data/topHitsData';

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
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOAjK1YTT5fxrH325Zf648-xr5bwJ0RDIHY1YeV0S3yczppb_DsGRIlFX6YRpqwyMG1niJPwZTvRpV37lAmhXbmrHDDyseyniTFq0fDve9ZBZaueMdcmKmo54YyTMeWgdfcq3o-I2S3psdvedL8CydpHjk9sK9RpNLihv54BLTnh6PldbPW9CJGmB8PrWbihiZKhNANtlNRHfNP5LC0iPfHlXuFHyoM0fs-ujYVhs',
    isPlaylist: true,
    playlistData: TOP_100_HITS
  },
  {
    id: 'instagram',
    title: 'Trending Instagram Mashup',
    subtitle: 'Voxwaves • Viral Reels 2026',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8ZEwTBm-NQDVM-LGIdRXoCA9NNyHjFB-KOlxv2le9THxTbTSWNuTQIlCJ36Ct0yIlb0NJnRGHQhQVkUnxCaq1XiqJCCbrJdv104K6UPEikssm_kVfzVh0vpjtT4_epxzqWCibGbXLlG3wzuV0sNinmDjuKcNJY6bUs_sizIlt_nInEl55cESvP9S2npaHWsirpvARMpqWUTJ5ujO6Cre6DRTclg-7fYqvbUeCCAY',
    isPlaylist: true,
    playlistData: INSTAGRAM_TRENDING_HITS
  },
  {
    id: 'indie-hindi',
    title: 'Indie Hindi Hits',
    subtitle: 'Rochit Bansal • 35 Tracks',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5z-XlVYJXzimuqy0R7A59vThAVIBT3Ptv41_y-wDJQ6_KXKm-B3hm46eyha_CvEHz43iFdnJTFs5pm8NHJWkFgfrzxCnh8f_mrnBYyTdn-7G4I4RG_uYGk1xzl6Vk6cmvF8qt8RCrh4h5Isll2WYMQW3bDbxZIhFJG6eeaugPKo3K-N9UindHlkN74MCL0hyi-FO8ciQ8Q5esQYTXOUaTMc1_78umvm9wsenOeJA',
    isPlaylist: true,
    playlistData: INDIE_HINDI_HITS
  },
  {
    id: 'romantic',
    title: 'Bollywood Romantic',
    subtitle: 'Grow Music • Love Vibes',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq-Ot3cF8LHqNzo3bxic0M0WKJfIYB0WCz4fgbK9Hif4VMIHrhEQYrpdJRHCMgWN-brimWfZM1dL7r5xjlNFOmFSSnPIjQsfOtkIS_v65h5jRyw3piRuyB_Q0ye8H0uCLNEcybgxWudxpeya2JKKw8bSWSKQ7i2_VBWIeap4cqedlcHLYal-KkEVcpXJnSX8cDAbuKhaKdVEj0uzoJjANCpkNCF3jKIQQDMK53iW8',
    isPlaylist: true,
    playlistData: BOLLYWOOD_ROMANTIC_HITS
  },
  {
    id: 'punjabi',
    title: 'Punjabi Viral Hits',
    subtitle: 'Desi Beats • High Energy',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6mRiJ8DM55Bv4uop8V3FaK7YFsEbDr9Zx5GP_9KbIHw35CjEsgVENB3jnkd0UX1_B3IZJ5Ao1sVQH5zarxKQYVAA3I_9D6F8zJc80kApK6s9vD6cz-zl1eITe39DAGYUH0Cj6n-H0ZCwr3fuK3EA8IMJ3jnhYPuwt6hcN5m6IBFn7Wb-sX5_6ALlXuvZXjCy-9-ym8yu4aIfkpZ6Ycr3AZDKhm87z5O7sBMGD3IY',
    isPlaylist: true,
    playlistData: PUNJABI_VIRAL_HITS
  },
  {
    id: 'daily1',
    title: 'Daily Mix 1',
    subtitle: 'Bonobo, Jon Hopkins, Tycho',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjye0Let52bzvmPjLVezPrVXh28CGKsndCk0GXPaHQtnVRAoxsD6kc_dSQIZsny0kA1jhqM0_45cW44OzbA8RljZAk73YnJgwW9qNCla-x-g-JACzdmD5goyXwaC6Wz6mko-injvp8btpFFNROY8SmjdLwJb5qjEcipf-6xzvmmSbdvToygB0gmg21uVwciCl0q8qYqODfX08u35fa_16wUSav23bw5z0YZjtgAFg',
    isPlaylist: true,
    playlistData: DAILY_MIX_1
  },
  {
    id: 'synthwave',
    title: 'Synthwave Essentials',
    subtitle: 'Kavinsky, The Weeknd',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVuURaNxu_eyfalbUAQU7vzWR1h3bbEGmaHENvk1tsfs8np5tw4QflVbTfO0jpk2o3q2XIhO6dwoicTeFLdZEHuDkssJvpj__Y3jNyKDjXRF_JxJalz-NQQKjqYeb7ZrcLhwcbDkTd1tUee8M2cdLGnMxPiMseJXhY3Ws5cpS2vNYBvMmKyWTfrAQ4BSsgFkyH53wilxzlhELv5kyIlyDI2VXEE7Bbkt07zXKXUNs',
    isPlaylist: true,
    playlistData: FAST_165BPM_DRIVING
  },
  {
    id: 'lofi',
    title: 'Release Radar',
    subtitle: 'Lofi Girl, Bonobo, Innerbloom',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBg1YPy_iFSOLmv-MXzURt9-3iAT6Z35Z15ZtNCWRJ2saNl0WTgSvvkGn-K_47wG_T6M0NnUQEfVnoBsNKyxNn_Uuo2LA-vHDt-JQDyIWimlolUiP2GpN-jCSwIPFXly9EQD9JqCq4eZw72gnQkSv_oJR2Rw1a9pO2j-cs7xu3oKfeplhEPMLa_Y-RHJw6LPd1mFsmKGOx7nUWDvre4QmxU54wzDuo7ROYzLfvUSk',
    isPlaylist: true,
    playlistData: LATE_NIGHT_LOFI
  }
];

// Curated Soundscape Mixes ("Made for You")
const CURATED_MIXES = [
  {
    id: 'mix-1',
    tag: 'DAILY',
    tagColor: 'text-[#d0bcff]',
    title: 'Daily Mix 1',
    artists: 'Bonobo, Jon Hopkins, Tycho, RÜFÜS DU SOL',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU4NtcYuU5EEfElmt87geZWJ4CPTv_xD0SNs-IkZ0ZB6wQrLfp3fiVhJW2O_gzkQe9PTnKPGE56cGtiOI6P2-Cu9Y5nsSgL0TQoBA8sEu-XiCpg6wvCSY-BQaODb4xIkG1Yq_-Nz03fPXajfUV1cU74PlL-TJMj19swi-HFLbOjUGtuf_wjK71zeXrzkQ78PSZ7be0Yt4WN1lhLpwzvGOQ69PqJlo_FDUrsXOh4K4',
    songs: DAILY_MIX_1
  },
  {
    id: 'mix-2',
    tag: 'WEEKLY',
    tagColor: 'text-[#4cd7f6]',
    title: 'Discover Weekly',
    artists: 'Lady Gaga, Sabrina Carpenter, The Weeknd, Karan Aujla',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvpsD41O2HhnYj8lm30-CjSvQErCbkjQXUsEX9LjkE2m7rk1jp9iSEmcAb6ppVUDIIdg06mkY4ubCMIiKQFT7PhTmLoLnWxIVEgb5ZI6mFz6JBgXdJXWTFLeuwok5y4bbd2_TvUGan4_iPG14IaGTKN3B48pvCcXyrEYBBfTD8I39v_eZk4izDCLWBPBEfI3AaQy7LSUW_W74WhmfhDhzkHbXH2zqkM8aIpuXbx3w',
    songs: DISCOVER_WEEKLY
  },
  {
    id: 'mix-3',
    tag: '165 BPM',
    tagColor: 'text-[#ff516a]',
    title: '165 BPM Driving Fast',
    artists: 'Kavinsky, The Weeknd, Hanumankind',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvVirDmK0wQTOpxJiNjyEBV-WwplGWQeYdFsT_kDgT0NpZh9WwkqVGTVYZLqg9vpOW1xsdS5ic4Q90Z3E1vb8cj9VaWko7YKxb5N5dibwINee--9Vd4nyqBOql5Zqqs5JGd6NELAYoKBiNe1kupa5pvV3rqQ6hj_EdDa4Xe-jQCgOCI2rZP46Eml9aJdt4Uc3Vj7oaBu7Bpt57iNMQQC49RNQ9rU_V3dm4UCwg7qE',
    songs: FAST_165BPM_DRIVING
  },
  {
    id: 'mix-4',
    tag: 'FOCUS',
    tagColor: 'text-[#cbc3d7]',
    title: 'Deep Focus Neural',
    artists: 'Lofi Girl, Jon Hopkins, Tycho',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL8FHciEzJX-HYbQjywyvEfDo4oCIlcOkr6rreai1FXnSUvf0dM_a494q5qNNSgEJ3KYL3ORG8jglBQZcqVGZOEXH9BUqucWYpIiXd2fUj6crj1j_d8HomcdqBL8b_r_nCvDQYWUR33TcFh5ZjFufB_XYvD4HBG6rjh5kibpkl2u6QEtBqweEQrEuhbJ2K1pZAFBucpi0jsDVNiG8rULdKG9WdMOKkEo7aWtJIf04',
    songs: DEEP_FOCUS_NEURAL
  },
  {
    id: 'mix-5',
    tag: 'LOFI',
    tagColor: 'text-[#4cd7f6]',
    title: 'Late Night Lofi Drift',
    artists: 'Lofi Girl, Bonobo, RÜFÜS DU SOL',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCEqms7JQGCRfu9ULMRYJv4x0AQZvTi-OkSEFExE4XFM2OQP8E-Dl007MtiHmIeDvyQa54rZvQ6HUcHy7d6A3rKuGfQPY4wLJ4D4jwqr9s0Vmddq-Bx1GN8ePHJ7aqShYkI6oGEtO8uHMQovm7q_5amjljjdytdfF8KpzF-HF8I-KP6L2Zy4o0aPfDTQ2MdFy7vMzu4k-eYTioJbdHEGMO1uoaFIWOUE8WT54i3r8',
    songs: LATE_NIGHT_LOFI
  }
];

// Trending Top Worldwide tracks
const TRENDING_TOP_5 = [
  {
    rank: '01',
    title: 'Neon Horizons',
    artist: 'Kavinsky & The Weeknd',
    album: 'OutRun Redux',
    streams: '142.5M',
    duration: '4:12',
    videoId: 'MV_3Dpw-BRY',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaGyPQ5Zrj51v00Vz7niB9gap-6Aq1y4_HfidLCbu5FwvN27cyIolXNmtuWybKqWB9Jnz0ykuvs5M-lXPc7cxcONbGpMDakGFVVPOmg1w8-iQoCaVg7KH8hL5OEqCKWZEl8bnxyQASySnVxchm9YfQYSnap13ziaBI9AbYqGmSipl6lTuJVBGnCkmKGPkDl5SjUDiBzV6MAoCNTFqWs6FiltbINRNs4G7cljlvQRA'
  },
  {
    rank: '02',
    title: 'Breathe Into Life',
    artist: 'Kiasmos',
    album: 'II Deluxe',
    streams: '118.2M',
    duration: '5:44',
    videoId: 'F91YsVxz9bA',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt_xZ8o52noraVvkZH4f8-X75EJc_Q7h81mmvTWAGfFpQlea1V0jOtQFvrIV0lfsE6_GWBmK6OUTSBjLt2e6j0CSJBxx8gSkfHCbnnSjw_YHb0RbFkvocCfOnZxqXlDWt0VvitQJPfe6jpYwTVxGZsOHI1P8IemdDZyyZT8JBikVsl0y7uOJBrmvYjOJuDqpsw7C2Ts3nxHXnPAf3m7A9HZC0CufIv2iPVDR6jYJM'
  },
  {
    rank: '03',
    title: 'Singularity',
    artist: 'Jon Hopkins',
    album: 'Singularity',
    streams: '96.8M',
    duration: '6:29',
    videoId: 'LK7-_dgAVQE',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC28w8dKDPKEpSxXTx0hJEsjkrx6XS1QQSNNHQCKXq0guwUeb4kOPHJaeb9i47tjoEIIK-lMCa4gdSNRErYfAgUQE7HDuoia0n9FjssHRQI6FnO0NdV8UK65iPgqozqJ9TKF-lNpytMbXrV29Wx_G035e2tEOIvh5xAzvFyrKkeQJdhXWLHMAYkHn-W5wZkBVdFwRnrKt08n7B4844jz9HykVN-j3M2j-xwsw9n5E'
  },
  {
    rank: '04',
    title: 'Subterranean',
    artist: 'Stephan Bodzin',
    album: 'Boavista',
    streams: '88.4M',
    duration: '7:18',
    videoId: 'ElZfdU54Cp8',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYIwtPVJr28Os48tndKhLTnLHSpdlWy4txoFCtYpYvmM-uM4i-3pWztyDm8Y_FPdBTseP3YuqZwZBEUShxknXUVFb6UZGGSTks3ChzQvpzXVsy5vgXQQyYyGyPN78ek_IeqC0k5Q5tgu8cnm5ULDS5I_uhWuWs8G6VJblw81wjaX-6OipVxrbV9ddqyTGCidfRiDGbkMZy4otB0UnDo4-2AqA6L7AfMi4Qz5n7NTM'
  },
  {
    rank: '05',
    title: 'Ascension',
    artist: 'Max Cooper',
    album: 'Yearning for the Infinite',
    streams: '74.1M',
    duration: '4:52',
    videoId: 'MV_3Dpw-BRY',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiVhxpAVioEJLrI5XFiOq6zCCa0S40vnutB8MI09RpenR-a68Pu0iSdnkfhc1FVDnuO656Sq-MTuG3qxq0iq_4g5RhnOYg3THs-2w7bkPo_G96oTHNAmo8FXTZUS-TG1FmDXaYzr-578QWEaEQAT_48luMRl93Mgna5PpX0fkuTZFxXvGvNWSdTy7qCyBcUATnP5JXDvX13Hll5F6EoalnBW-aull47mja2hEQpRA'
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
      if (card.id === 'daily1' || card.id === 'synthwave' || card.id === 'lofi') {
        playFromCollection(card.playlistData, 0, card.title);
      } else {
        openPlaylist(card.playlistData);
      }
    } else if (card.videoId) {
      playSong({
        videoId: card.videoId,
        title: card.title,
        channelTitle: card.subtitle,
        thumbnail: card.thumbnail
      }, true);
    }
  };

  const handleMixClick = (mix) => {
    if (mix.songs && mix.songs.length > 0) {
      playFromCollection(mix.songs, 0, mix.title);
    } else if (mix.videoId) {
      playSong({
        videoId: mix.videoId,
        title: mix.title,
        channelTitle: mix.artists || mix.subtitle,
        thumbnail: mix.thumbnail
      }, true);
    }
  };

  const handleSpotlightPlay = () => {
    playFromCollection(DAILY_MIX_1, 0, 'CHROMA - Deluxe Edition');
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.isPlaylist && card.playlistData) {
                    playFromCollection(card.playlistData, 0, card.title);
                  } else if (card.videoId) {
                    playSong({
                      videoId: card.videoId,
                      title: card.title,
                      channelTitle: card.subtitle,
                      thumbnail: card.thumbnail
                    }, true);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 mr-1 w-9 h-9 rounded-full bg-[#a078ff] text-[#340080] flex items-center justify-center shadow-lg transition-all duration-200 transform translate-x-1 group-hover:translate-x-0 hover:scale-110 active:scale-95 shrink-0"
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
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgOU3aR9pRjtwLaRIYdMerrVtvHA5XPG0rzVbNNry74cvIdQoWH8D8wlUeOmxE-75OPpnD5iasb1GS0TIRBup76-Cijb821-RcMluJc1N5rHEM_e52IdqJSNvpSQV4_ad6-JORJ4uJcdyfo-UbNgtZ5Mtx8JCJADN4B77fxYc_lNy3goWkZYykqNM0XS-Ogzy866eELZ1wI-0-S_555Bu_meWLlNAhjj143KD_e1k"
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
              onClick={() => handleMixClick(mix)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMixClick(mix);
                  }}
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#a078ff] text-[#340080] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-[0_4px_16px_rgba(160,120,255,0.4)] hover:scale-110 active:scale-90"
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
            {TRENDING_TOP_5.map((track, trackIdx) => {
              const isPlayingThis = currentSong?.videoId === track.videoId && playback.isPlaying;
              const liked = isLiked(track.videoId);

              return (
                <div
                  key={track.rank}
                  onClick={() => playFromCollection(
                    TRENDING_TOP_5.map(t => ({
                      videoId: t.videoId,
                      title: t.title,
                      channelTitle: t.artist,
                      thumbnail: t.thumbnail,
                      duration: t.duration
                    })),
                    trackIdx,
                    'Trending Worldwide'
                  )}
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
          SECTION 5: Live Audio Sessions & Radio Broadcasts (Stitch Original)
      ========================================================================= */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff516a] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff516a]" />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#e3e1ee] tracking-tight">
                  Live Audio Sessions
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#ff516a] text-[#5b0017] font-mono text-[10px] font-bold uppercase">
                  On Air
                </span>
              </div>
              <span className="font-body text-xs text-[#cbc3d7]/70">
                Real-time uncompressed master radio streams curated by world-class producers
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              aria-label="Previous live stream" 
              type="button"
              className="w-8 h-8 rounded-full bg-[#1e1f28] hover:bg-[#282933] text-[#e3e1ee] flex items-center justify-center transition-colors border border-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              aria-label="Next live stream" 
              type="button"
              className="w-8 h-8 rounded-full bg-[#1e1f28] hover:bg-[#282933] text-[#e3e1ee] flex items-center justify-center transition-colors border border-white/5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Live Card 1: Berlin */}
          <div className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1b24] to-[#0d0e16] hover:bg-[#1e1f28] transition-all p-5 flex flex-col justify-between h-56 shadow-lg border border-white/[0.06]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e16] via-[#0d0e16]/40 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff516a]/90 backdrop-blur-md text-[#5b0017] font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5b0017] animate-pulse" /> LIVE NOW
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#0d0e16]/80 backdrop-blur-md font-mono text-[11px] text-[#4cd7f6] border border-white/5">
                24.8k listening
              </span>
            </div>
            <div className="relative z-10 flex items-end justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-base font-bold text-white truncate">
                  Berlin Underground Lab
                </span>
                <span className="font-body text-xs text-[#cbc3d7]/70 truncate">
                  Hosted by Marcel Dettmann • Berghain Archival Mix
                </span>
              </div>
              <button
                type="button"
                onClick={() => playSong({
                  videoId: 'Tx9zMFodNtA',
                  title: 'Berlin Underground Lab (Live)',
                  channelTitle: 'Marcel Dettmann • Berghain Archival Mix',
                  thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU4NtcYuU5EEfElmt87geZWJ4CPTv_xD0SNs-IkZ0ZB6wQrLfp3fiVhJW2O_gzkQe9PTnKPGE56cGtiOI6P2-Cu9Y5nsSgL0TQoBA8sEu-XiCpg6wvCSY-BQaODb4xIkG1Yq_-Nz03fPXajfUV1cU74PlL-TJMj19swi-HFLbOjUGtuf_wjK71zeXrzkQ78PSZ7be0Yt4WN1lhLpwzvGOQ69PqJlo_FDUrsXOh4K4'
                }, true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#a078ff] text-[#340080] font-headline text-xs font-bold hover:scale-105 transition-transform shadow-[0_0_16px_rgba(160,120,255,0.35)]"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Tune In</span>
              </button>
            </div>
          </div>

          {/* Live Card 2: Tokyo */}
          <div className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1b24] to-[#0d0e16] hover:bg-[#1e1f28] transition-all p-5 flex flex-col justify-between h-56 shadow-lg border border-white/[0.06]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e16] via-[#0d0e16]/40 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff516a]/90 backdrop-blur-md text-[#5b0017] font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5b0017] animate-pulse" /> LIVE NOW
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#0d0e16]/80 backdrop-blur-md font-mono text-[11px] text-[#4cd7f6] border border-white/5">
                18.3k listening
              </span>
            </div>
            <div className="relative z-10 flex items-end justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-base font-bold text-white truncate">
                  Tokyo Modular Frequencies
                </span>
                <span className="font-body text-xs text-[#cbc3d7]/70 truncate">
                  Hosted by Ken Ishii • Shibuya FM Live Wire
                </span>
              </div>
              <button
                type="button"
                onClick={() => playSong({
                  videoId: 'MV_3Dpw-BRY',
                  title: 'Tokyo Modular Frequencies (Live)',
                  channelTitle: 'Ken Ishii • Shibuya FM Live Wire',
                  thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvpsD41O2HhnYj8lm30-CjSvQErCbkjQXUsEX9LjkE2m7rk1jp9iSEmcAb6ppVUDIIdg06mkY4ubCMIiKQFT7PhTmLoLnWxIVEgb5ZI6mFz6JBgXdJXWTFLeuwok5y4bbd2_TvUGan4_iPG14IaGTKN3B48pvCcXyrEYBBfTD8I39v_eZk4izDCLWBPBEfI3AaQy7LSUW_W74WhmfhDhzkHbXH2zqkM8aIpuXbx3w'
                }, true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#383843] hover:bg-[#a078ff] text-[#e3e1ee] hover:text-[#340080] font-headline text-xs font-bold transition-all shadow-md"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Tune In</span>
              </button>
            </div>
          </div>

          {/* Live Card 3: NTS Sanctuary */}
          <div className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1b24] to-[#0d0e16] hover:bg-[#1e1f28] transition-all p-5 flex flex-col justify-between h-56 shadow-lg border border-white/[0.06]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e16] via-[#0d0e16]/40 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4cd7f6]/20 backdrop-blur-md text-[#4cd7f6] font-mono text-[10px] font-bold border border-[#4cd7f6]/30">
                SCHEDULED
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#0d0e16]/80 backdrop-blur-md font-mono text-[11px] text-[#cbc3d7]/60 border border-white/5">
                Starts in 42m
              </span>
            </div>
            <div className="relative z-10 flex items-end justify-between gap-3">
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-base font-bold text-white truncate">
                  NTS Ambient Sanctuary
                </span>
                <span className="font-body text-xs text-[#cbc3d7]/70 truncate">
                  Hosted by Tim Hecker • Infinite Harmonics
                </span>
              </div>
              <button
                type="button"
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#383843] hover:bg-[#a078ff] text-[#e3e1ee] hover:text-[#340080] font-headline text-xs font-bold transition-all shadow-md"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notify</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: Real-Time Trending Now in {selectedMood} Grid
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
