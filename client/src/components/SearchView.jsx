import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Play, 
  Pause, 
  MoreVertical, 
  Clock, 
  Sparkles, 
  Loader2, 
  Heart, 
  Music, 
  Check, 
  Radio, 
  Sliders, 
  Headphones, 
  Volume2, 
  ListPlus, 
  Users, 
  Flame, 
  Compass, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { socket } from '../socket';

function formatDuration(sec) {
  if (!sec) return '3:45';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const CATEGORY_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'artists', label: 'Artists' },
  { id: 'albums', label: 'Albums & EPs' },
  { id: 'lossless', label: 'Lossless Masters (24b/192kHz)', icon: 'graphic_eq' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'live', label: 'Live Rooms / Party', iconPulse: true },
  { id: 'podcasts', label: 'Podcasts & Radio' },
];

const SONIC_TRENDING = [
  { rank: '#01', title: 'Cyberpunk Outrun Synth', delta: '+142% search vol' },
  { rank: '#02', title: 'Analog Modular Eurorack', delta: '+88%' },
  { rank: '#03', title: 'Fred again.. Boiler Room Set', delta: '+64%' },
  { rank: '#04', title: 'Kiasmos Chroma Neo-Classical', delta: '+51%' },
];

const CURATED_SAMPLE_MASTERS = [
  {
    videoId: 'MV_3Dpw-BRY',
    title: 'Nightcall (Lossless 24b/192kHz)',
    channelTitle: 'Kavinsky & Lovefoxxx • OutRun',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBufkkI1LCoP_D36oepmd_5jWmY0jlej44Zzk6sUoQwpPUVViyruULdEd27AuxigTBw4nZrGl-PnndyhLvc-7WzbuCUs1OyasquetUb147G1HyWyUKyxYh5mMnKrQbo_7w0MqwZHZ5HJniZo1s0jrfr473TM20l-nKoP0R-BHDsX5HQl5svzHHDmbguoFpUusIEVozzkQgTCJUs5yyt3_MUsll4tOhm19CA3E5dMdU',
    duration: 258,
    badge: '24b / 192k FLAC'
  },
  {
    videoId: '4lzfqn2FpY0',
    title: 'Pacific Coast Highway',
    channelTitle: 'Kavinsky • OutRun Special Edition',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvhwi6bqrMfzSkK6VXECOnl6msg_qmUZsDndB4wVjlgBPJyMFt7rMmDWz_45tgoqjQUGsve9sjOgABfhhbEsCIVt2m3yY1-W4iDZQtQFh9Y0qevcDOnpax2ra13mLJqXHXKpN10xCCwOkd5g-Dson92B11dUqFkR-vb5czQaDQPNFM2KEIO4BNRYm6WCHo2lf5V1ayBGUKtlxYR2pzKTn8GTX-NZGswegcRImPiCA',
    duration: 383,
    badge: 'Dolby Atmos'
  },
  {
    videoId: '6B2v6hF6l24',
    title: 'Zenith',
    channelTitle: 'Kavinsky ft. Prudence & Morgan Phalen • Reborn',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClgpPIDn0xi1EmgenOuwFy1WgvDFxXNNdC7m-sUPYprP6fXxSZa3fEGCJb5d6nrjPJMukzu5GkTiavLSO54jh41QtKe7Mz-izGOK8vk1UvFlXttht0Gb5Q_BKju8qPcmW2G5fj1nLJoTJFixAXixwXFpOwtbFQYQG2VkcpyPPlpNAGQrM4YhSvsy_I8w0--ks2gDBNkai_TR4DBtgWg-0DwB2oUraPAJosnAhN3-E',
    duration: 220,
    badge: '24b / 96k Studio'
  },
  {
    videoId: 'qFp_3a7l-6g',
    title: 'Roadgame',
    channelTitle: 'Kavinsky • OutRun',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALT0jckjp7FtNTU-5Dse6yjlLqZwTHXSPkr0G7PO6UTrMvTwgK32y7_uV5j2cslSIoXsA2PFVFTpV918Xlgh4Lm0O7rEI-kLTHjcWBVEhhtLWbfjv1M9Fge0JNZkuJtSAfZ4tgVxNCCUAQvFCAnI9hGPj3UbwRjhdAsDhGyg9Ooo5-EsduVZCxNxJFKj-SqfwD92-e3aaiNQ2vxqgtGUIilN8hqmn4zapYg6lm194',
    duration: 229,
    badge: '24b / 192k FLAC'
  }
];

export default function SearchView() {
  const {
    playSong,
    playFromCollection,
    currentSong,
    playback,
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    openSongMenu,
    isLiked,
    toggleLike,
    addToQueue,
    setIsPartyModalOpen
  } = usePlayer();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedKey, setSelectedKey] = useState('4A / Fm');
  const [flacOnly, setFlacOnly] = useState(true);
  const [atmosOnly, setAtmosOnly] = useState(true);
  const [stemsOnly, setStemsOnly] = useState(false);
  const [bpmRange, setBpmRange] = useState('124 - 138 BPM');

  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Global keyboard shortcut ⌘K or Ctrl+K focuses search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(query.trim());
    }, 380);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const executeSearch = (searchTerm) => {
    if (!searchTerm) return;
    setLoading(true);
    setHasSearched(true);
    addRecentSearch?.(searchTerm);

    socket.emit('song:search', { query: searchTerm }, (res) => {
      setLoading(false);
      if (res?.success && res.results) {
        setResults(res.results);
      } else {
        setResults([]);
      }
    });
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  // Determine top spotlight result
  const spotlightItem = results.length > 0 ? results[0] : CURATED_SAMPLE_MASTERS[0];
  const displayTracks = results.length > 0 ? results : CURATED_SAMPLE_MASTERS;

  return (
    <div className="flex flex-col w-full gap-8 pb-32">

      {/* Dynamic Omnibar & Search Input Bar (Hero) */}
      <section className="flex flex-col gap-4">
        {/* Main Expansive Omnibar Container */}
        <div className="relative w-full rounded-2xl bg-surface-container-low p-4 sm:p-5 shadow-2xl backdrop-blur-2xl border border-white/[0.04]">
          <div className="relative flex items-center w-full">
            <span className="material-symbols-outlined text-secondary text-2xl absolute left-4 select-none pointer-events-none">
              search
            </span>
            <input
              ref={inputRef}
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to listen to? Search artists, tracks, stems, 24-bit lossless masters..."
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="w-full h-14 pl-14 pr-28 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline font-body text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-inner transition-all border border-white/[0.04]"
            />
            
            <div className="absolute right-3 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 text-secondary animate-spin" />
              ) : query ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
              
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-code text-xs select-none">
                <span>⌘</span>
                <span>K</span>
              </div>
            </div>
          </div>

          {/* Filter Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 no-scrollbar">
            {CATEGORY_PILLS.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id === 'live') {
                      setIsPartyModalOpen(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-label text-xs sm:text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_14px_rgba(160,120,255,0.4)]'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-bright'
                  }`}
                >
                  {cat.icon && (
                    <span className="material-symbols-outlined text-sm text-secondary">
                      {cat.icon}
                    </span>
                  )}
                  {cat.iconPulse && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
                  )}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recent Searches Quick Pills */}
          {recentSearches && recentSearches.length > 0 && (
            <div className="flex items-center gap-2 pt-4 mt-1 flex-wrap">
              <span className="font-label text-xs text-outline uppercase tracking-wider">
                Recent Searches
              </span>
              {recentSearches.slice(0, 6).map((term, idx) => (
                <div
                  key={`${term}-${idx}`}
                  className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-surface-container text-on-surface font-body text-xs group hover:bg-surface-container-high transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      executeSearch(term);
                    }}
                    className="hover:underline"
                  >
                    {term}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecentSearch ? removeRecentSearch(term) : null}
                    className="text-outline hover:text-on-surface p-0.5 rounded-full"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-outline hover:text-primary font-label text-xs ml-auto transition-colors"
              >
                Clear History
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Top Result Spotlight & Top Masters Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Spotlight Card (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-surface-container-low relative overflow-hidden group hover:shadow-2xl transition-all border border-white/[0.04]">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary-container/20 blur-3xl pointer-events-none group-hover:bg-primary-container/30 transition-all" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-label text-xs text-secondary tracking-widest uppercase font-semibold">
                Top Result
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-code text-xs border border-white/[0.04]">
                <span className="material-symbols-outlined text-secondary text-xs">
                  verified
                </span>
                <span>Studio Master Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="relative w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300 bg-surface-container-highest">
                <img
                  className="w-full h-full object-cover"
                  src={spotlightItem.thumbnail || `https://i.ytimg.com/vi/${spotlightItem.videoId}/hqdefault.jpg`}
                  alt={spotlightItem.title}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>

              <div className="flex flex-col min-w-0">
                <h2 className="font-headline font-bold text-xl sm:text-2xl text-on-surface tracking-tight leading-tight truncate">
                  {spotlightItem.channelTitle || spotlightItem.title}
                </h2>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant pt-1 truncate">
                  {spotlightItem.title}
                </p>
                <div className="flex items-center gap-1.5 pt-2 text-primary font-code text-xs">
                  <span className="material-symbols-outlined text-xs">headphones</span>
                  <span>14,821,904 monthly listeners</span>
                </div>
              </div>
            </div>

            <p className="font-body text-sm text-on-surface-variant line-clamp-2 leading-relaxed mt-2">
              Pioneer soundscape and high-fidelity sonic master. Remastered in 24-bit 192kHz Spatial Studio stems directly synced to your studio DAC.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 pt-6 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (results.length > 0) {
                  playFromCollection(results, 0, `Search: "${query}"`);
                } else {
                  playSong(spotlightItem);
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container font-label text-sm font-semibold shadow-[0_0_20px_rgba(160,120,255,0.45)] hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">play_arrow</span>
              <span>Play Artist Radio</span>
            </button>

            <button
              type="button"
              onClick={() => toggleLike?.(spotlightItem)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-sm transition-colors border border-white/[0.04]"
            >
              <span className={`material-symbols-outlined text-sm ${isLiked(spotlightItem.videoId) ? 'text-tertiary-container' : ''}`}>
                {isLiked(spotlightItem.videoId) ? 'favorite' : 'favorite_border'}
              </span>
              <span>{isLiked(spotlightItem.videoId) ? 'Favorited' : 'Follow'}</span>
            </button>

            <button
              type="button"
              onClick={() => openSongMenu?.(spotlightItem)}
              className="p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors ml-auto"
              title="More Options"
            >
              <span className="material-symbols-outlined text-lg">more_horiz</span>
            </button>
          </div>
        </div>

        {/* Top Tracks Table (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-surface-container-low shadow-xl border border-white/[0.04]">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-lg text-on-surface">
                {results.length > 0 ? `Results for "${query}"` : 'Top Audio Masters'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-secondary font-code text-xs">
                Lossless Stems
              </span>
            </div>
            <span className="font-code text-xs text-outline">
              {displayTracks.length} Masters
            </span>
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            {displayTracks.slice(0, 5).map((track, idx) => {
              const isPlayingThis = currentSong?.videoId === track.videoId && playback.isPlaying;
              const liked = isLiked(track.videoId);

              return (
                <div
                  key={`track-${track.videoId}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-all group border border-transparent hover:border-white/[0.03]"
                >
                  <div
                    onClick={() => {
                      if (results.length > 0) {
                        playFromCollection(results, idx, `Search: "${query}"`);
                      } else {
                        playSong(track);
                      }
                    }}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest shadow-md">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        src={track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`}
                        alt={track.title}
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-on-surface text-xl">
                          {isPlayingThis ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      {isPlayingThis && (
                        <div className="absolute inset-0 bg-violet-950/75 backdrop-blur-xs flex items-center justify-center gap-0.5">
                          <span className="w-0.5 h-3 bg-secondary rounded-full animate-eq-1" />
                          <span className="w-0.5 h-4 bg-primary rounded-full animate-eq-2" />
                          <span className="w-0.5 h-2 bg-secondary rounded-full animate-eq-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-label text-sm text-on-surface truncate group-hover:text-primary transition-colors font-medium">
                        {track.title}
                      </span>
                      <span className="font-body text-xs text-on-surface-variant truncate">
                        {track.channelTitle || 'Studio Master Recording'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-code text-xs hidden sm:inline-block">
                      {track.badge || '24b / 192k FLAC'}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleLike(track)}
                      className="text-outline hover:text-tertiary-container transition-transform active:scale-90"
                      title={liked ? "Liked" : "Like"}
                    >
                      <span className={`material-symbols-outlined text-lg ${liked ? 'text-tertiary-container' : ''}`}>
                        {liked ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>

                    <span className="font-code text-xs text-on-surface-variant w-9 text-right">
                      {formatDuration(track.duration)}
                    </span>

                    <button
                      type="button"
                      onClick={() => addToQueue?.(track)}
                      className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
                      title="Add to Up Next"
                    >
                      <span className="material-symbols-outlined text-lg">queue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openSongMenu?.(track)}
                      className="text-on-surface-variant hover:text-on-surface transition-colors p-1 opacity-0 group-hover:opacity-100"
                      title="More options"
                    >
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sonic Discovery & Audio-Specific Filters Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Precision Acoustic Filter Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col p-5 sm:p-6 rounded-2xl bg-surface-container-low gap-4 border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">tune</span>
              <span className="font-headline font-bold text-base sm:text-lg text-on-surface">
                Search by Audio Profile & Specs
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedKey('4A / Fm');
                setFlacOnly(true);
                setAtmosOnly(true);
                setStemsOnly(false);
                setBpmRange('124 - 138 BPM');
              }}
              className="font-label text-xs text-outline hover:text-secondary uppercase tracking-wider transition-colors"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* BPM Range Control Card */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container border border-white/[0.03]">
              <div className="flex justify-between items-center">
                <span className="font-label text-xs sm:text-sm text-on-surface font-semibold">
                  Tempo / BPM
                </span>
                <span className="font-code text-xs text-secondary bg-surface-container-high px-2 py-0.5 rounded">
                  {bpmRange}
                </span>
              </div>
              
              {/* Minimal Track Bar */}
              <div className="relative w-full h-6 flex items-center">
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden relative">
                  <div className="absolute left-1/4 right-1/4 h-full bg-secondary shadow-[0_0_10px_rgba(76,215,246,0.6)]" />
                </div>
                <div className="absolute left-1/4 w-4 h-4 rounded-full bg-on-surface -ml-2 shadow cursor-pointer hover:scale-110 transition-transform" />
                <div className="absolute right-1/4 w-4 h-4 rounded-full bg-on-surface -mr-2 shadow cursor-pointer hover:scale-110 transition-transform" />
              </div>

              <div className="flex justify-between font-code text-[11px] text-outline">
                <button type="button" onClick={() => setBpmRange('60 - 90 BPM')} className="hover:text-secondary">60 Slow</button>
                <button type="button" onClick={() => setBpmRange('120 - 130 BPM')} className="hover:text-secondary">120 Club</button>
                <button type="button" onClick={() => setBpmRange('160 - 180 BPM')} className="hover:text-secondary">180 DnB</button>
              </div>
            </div>

            {/* Harmonic Key Selector Card */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container border border-white/[0.03]">
              <div className="flex justify-between items-center">
                <span className="font-label text-xs sm:text-sm text-on-surface font-semibold">
                  Harmonic Key (Camelot)
                </span>
                <span className="font-code text-xs text-primary bg-surface-container-high px-2 py-0.5 rounded">
                  {selectedKey}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {['4A / Fm', '5A / Cm', '8A / Am', 'Any Key'].map((keyName) => (
                  <button
                    key={keyName}
                    type="button"
                    onClick={() => setSelectedKey(keyName)}
                    className={`py-1 rounded font-code text-xs transition-colors ${
                      selectedKey === keyName
                        ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
                    }`}
                  >
                    {keyName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Toggles for Lossless & Spatial Hardware Matching */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container cursor-pointer select-none group border border-white/[0.02]">
              <input
                type="checkbox"
                checked={flacOnly}
                onChange={(e) => setFlacOnly(e.target.checked)}
                className="accent-[#4cd7f6] w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-label text-xs sm:text-sm text-on-surface">192kHz Hi-Res FLAC Only</span>
              <span className="material-symbols-outlined text-secondary text-sm">noise_control_off</span>
            </label>

            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container cursor-pointer select-none group border border-white/[0.02]">
              <input
                type="checkbox"
                checked={atmosOnly}
                onChange={(e) => setAtmosOnly(e.target.checked)}
                className="accent-[#a078ff] w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-label text-xs sm:text-sm text-on-surface">Dolby Atmos / 3D Binaural</span>
              <span className="material-symbols-outlined text-primary text-sm">spatial_audio_off</span>
            </label>

            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container cursor-pointer select-none group border border-white/[0.02]">
              <input
                type="checkbox"
                checked={stemsOnly}
                onChange={(e) => setStemsOnly(e.target.checked)}
                className="accent-[#4cd7f6] w-4 h-4 rounded cursor-pointer"
              />
              <span className="font-label text-xs sm:text-sm text-on-surface-variant group-hover:text-on-surface">Instrumental / Stem Masters</span>
            </label>
          </div>
        </div>

        {/* Trending Searches & Sonic Radar (5 cols) */}
        <div className="lg:col-span-5 flex flex-col p-5 sm:p-6 rounded-2xl bg-surface-container-low gap-4 border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container">trending_up</span>
              <span className="font-headline font-bold text-base sm:text-lg text-on-surface">
                Sonic Radar Trending
              </span>
            </div>
            <span className="font-code text-xs text-secondary flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              Live Worldwide
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {SONIC_TRENDING.map((trend) => (
              <div
                key={trend.rank}
                onClick={() => {
                  setQuery(trend.title);
                  executeSearch(trend.title);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-all cursor-pointer group border border-transparent hover:border-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-code text-xs text-primary font-bold">
                    {trend.rank}
                  </span>
                  <span className="font-label text-sm text-on-surface group-hover:text-primary transition-colors">
                    {trend.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-code text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-sm">arrow_upward</span>
                  <span>{trend.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborative & Live Rooms Discovery Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">sensors</span>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Active Live Rooms Matching Your Search
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsPartyModalOpen(true)}
            className="font-label text-xs sm:text-sm text-primary hover:underline"
          >
            Browse All Rooms (142)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Live Room 1 */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all group border border-white/[0.04]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-secondary font-code text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                <span>LIVE SYNC</span>
              </div>
              <span className="font-code text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">group</span> 482 listening
              </span>
            </div>

            <div className="py-4 flex flex-col gap-1">
              <span className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                Kavinsky Midnight Run Session
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                Host: @french_electro • Sub-second Opus Sync
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPartyModalOpen(true)}
              className="w-full py-2.5 rounded-full bg-primary-container text-on-primary-container font-label text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">sensors</span>
              <span>Join Live Room</span>
            </button>
          </div>

          {/* Live Room 2 */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all group border border-white/[0.04]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-secondary font-code text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                <span>LIVE SYNC</span>
              </div>
              <span className="font-code text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">group</span> 219 listening
              </span>
            </div>

            <div className="py-4 flex flex-col gap-1">
              <span className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                Cyberpunk 2077 Night City Drive
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                Host: @netrunner • 24b / 192k Stream
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPartyModalOpen(true)}
              className="w-full py-2.5 rounded-full bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">sensors</span>
              <span>Join Live Room</span>
            </button>
          </div>

          {/* Live Room 3 */}
          <div className="flex flex-col justify-between p-5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all group border border-white/[0.04]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-tertiary font-code text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse" />
                <span>AUX PASSING</span>
              </div>
              <span className="font-code text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">group</span> 94 listening
              </span>
            </div>

            <div className="py-4 flex flex-col gap-1">
              <span className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                Lo-Fi Midnight Coding & Chill
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                Host: @devbeats • Open Collaborative Aux
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsPartyModalOpen(true)}
              className="w-full py-2.5 rounded-full bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">sensors</span>
              <span>Join Live Room</span>
            </button>
          </div>
        </div>
      </section>

      {/* Explore Genres & Sonic Moods (Stitch Original 8-Card Bento Grid) */}
      <section className="flex flex-col gap-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-xl text-on-surface tracking-tight">
              Explore Genres &amp; Sonic Moods
            </h3>
            <p className="font-body text-xs text-on-surface-variant">
              Curated sound spaces, stem archives, and losslessly mastered collections
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Genre Card 1 */}
          <div 
            onClick={() => { setQuery('Synthwave Cyberpunk'); executeSearch('Synthwave Cyberpunk'); }}
            className="relative h-52 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#a078ff]/30 via-[#1a1b24] to-[#4cd7f6]/15 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer border border-white/[0.04]"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-widest font-semibold block mb-1">18,400 Tracks</span>
                <h4 className="font-headline font-bold text-lg text-white leading-tight">Synthwave &amp; Cyberpunk</h4>
              </div>
              <span className="font-mono text-[11px] text-[#cbc3d7]/60">24b / 192kHz Ready</span>
            </div>
            <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-[18deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZ2WkmFrmhkpYUigoKKvBVl2YQ36J7NqnV7cn-JxG26-ayej2F40xY3nv4AH9wiBIsGYCkePdp-6HnDHa2x-ZOpm_uRYquk1r0EsQdTJZXDA7TANRnMA36-WnQ0ZFv4GachB-bHsl7A-Y-idJVxvqGtUL0Z01mCa0bZ5wrCoNnt15JGBzDkx7YTSg4XgUQDo0lG2dXyv8q81JCW1yGKbQ_BNMsm_hsAwcGKyiRtRY" alt="" />
            </div>
          </div>

          {/* Genre Card 2 */}
          <div 
            onClick={() => { setQuery('Deep Ambient Binaural'); executeSearch('Deep Ambient Binaural'); }}
            className="relative h-52 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#1e1f28] via-[#1a1b24] to-[#03b5d3]/20 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer border border-white/[0.04]"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#acedff] uppercase tracking-widest font-semibold block mb-1">9,240 Tracks</span>
                <h4 className="font-headline font-bold text-lg text-white leading-tight">Deep Ambient &amp; Binaural</h4>
              </div>
              <span className="font-mono text-[11px] text-[#cbc3d7]/60">432Hz &amp; 40Hz Waves</span>
            </div>
            <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-[18deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAV7KDE-OSvNZmAgMq6m8f83a8QSRP2M3bVNPDXZKuudw6GsEc-sZ_HIXd_A4X_dJF42NqBl8P-tcy25_5Vpdvj0ccMUmzqq8kLFAqFQFG55bp8HTZeLFUvhW6HQP9R_PfaZKldRhHEgcz1uPdiH11b_C0joaYHXNJDWgLaz5auIhyrf-JgChNLkxcxeruVMvqr7MyLDYrN3nesZNruejwSYUaXfPidwA2pKJsTIe8" alt="" />
            </div>
          </div>

          {/* Genre Card 3 */}
          <div 
            onClick={() => { setQuery('Techno Industrial Warehouse'); executeSearch('Techno Industrial Warehouse'); }}
            className="relative h-52 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#282933] via-[#1a1b24] to-[#ff516a]/20 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer border border-white/[0.04]"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#ffb2b7] uppercase tracking-widest font-semibold block mb-1">31,900 Tracks</span>
                <h4 className="font-headline font-bold text-lg text-white leading-tight">Techno &amp; Industrial</h4>
              </div>
              <span className="font-mono text-[11px] text-[#cbc3d7]/60">Berlin Raw Underground</span>
            </div>
            <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-[18deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtFM5f9YSL6UrZnT1uywUt1ixLyXZLJRhQhPbQemS7KUjCBW3J3RngQhfTJvqvh4voU7mgYF6LWcWDe3lhGMWhnXXPCNAXhrgesnc-FQJ35tdQXnrhx2F8g7rhnnfhmWQlpB7oqfiuiImbUwhtRSF7SbGFjWgQmfLuI-_bHPh4UTM6IWMN-NlnwbZDHtqvpx-S3pMFYls0jrXNh-bMlSbo3VVcVYzpdvGafbIVy8A" alt="" />
            </div>
          </div>

          {/* Genre Card 4 */}
          <div 
            onClick={() => { setQuery('Lo-Fi Tape Beats'); executeSearch('Lo-Fi Tape Beats'); }}
            className="relative h-52 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#1e1f28] via-[#1a1b24] to-[#ffb2b7]/20 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer border border-white/[0.04]"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#ffdadb] uppercase tracking-widest font-semibold block mb-1">12,150 Tracks</span>
                <h4 className="font-headline font-bold text-lg text-white leading-tight">Lo-Fi Tape Beats</h4>
              </div>
              <span className="font-mono text-[11px] text-[#cbc3d7]/60">Vinyl Dust &amp; Rhodes</span>
            </div>
            <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-[18deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBi3qWXwnOcoVnh95XukIljlvIrShiI6_hCv_6FBxd6PwxGxvUk5Vj-A0_6Rh2KeZEf3_nVwFWcYJKgaFBy7Kh4oVuUjicATP37pIiUMWs-ZyDb_xxLv3-OCx2-3-aTiI2hCIyRXMXQfmGu5G1vW10LAiqFsiriG7U5u53Y_Jt0v9A4zMobf8Kf4rwKmXuJ_9BvR3DxNjsnJM2i1oysKvOX8I9tgq7DsTnaPQ-mkzo" alt="" />
            </div>
          </div>

          {/* Genre Card 5 */}
          <div 
            onClick={() => { setQuery('Audiophile 24-Bit FLAC'); executeSearch('Audiophile 24-Bit FLAC'); }}
            className="relative h-52 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#282933] via-[#1a1b24] to-[#a078ff]/20 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer border border-white/[0.04]"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#d0bcff] uppercase tracking-widest font-semibold block mb-1">8,600 Masters</span>
                <h4 className="font-headline font-bold text-lg text-white leading-tight">Audiophile 24-Bit Vault</h4>
              </div>
              <span className="font-mono text-[11px] text-[#cbc3d7]/60">Studio FLAC 192kHz</span>
            </div>
            <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-[18deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwfWIA3I1xByxGIJbUnAl3509A7m5o-6e6UeVqfCl_p_f5vbErxlGzKmHX25X5BaFkIXqrQl5l01n1tKvLZehRtI5aRd0VAUMqiqzQIlis7eZEFJf0XLx5LwO3rYeD0jmc2BYLDoFNwzxdoxACaoLCyqIGRiGztpE4eTM-xRol8lju9-WVbLQGrfDN6p75GFbf9esGW9KryXZDMQQcQp-8iWxMWjbgRJ6OxOjHOfQ" alt="" />
            </div>
          </div>

          {/* Genre Card 6 */}
          <div 
            onClick={() => { setQuery('Hyperpop Future Bass'); executeSearch('Hyperpop Future Bass'); }}
            className="relative h-52 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#1e1f28] via-[#1a1b24] to-[#ff516a]/25 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer border border-white/[0.04]"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#ff516a] uppercase tracking-widest font-semibold block mb-1">14,200 Tracks</span>
                <h4 className="font-headline font-bold text-lg text-white leading-tight">Hyperpop &amp; Future Bass</h4>
              </div>
              <span className="font-mono text-[11px] text-[#cbc3d7]/60">165+ BPM High Voltage</span>
            </div>
            <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-[18deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzAHXQuejxj_eCrFq6abHllE4iWdn1OzqYmOEDS5uiX4e6jkDOXZoBiCqo-rNQtzmuZDXR7QXUiHpP5gG7sga7a8vliUUXViZlnOUde8rMY6yuw58074yPUy-rKI6j05wxODb0tbpW3yWW2Gf1IdNqAYlQQLnAQceW5YSNwJOVl31rYYmy20STOtFTPmXweR2EB9E7vwa7u6-281UpaiESCIK7cp0S42wLB2WU3hI" alt="" />
            </div>
          </div>

          {/* Genre Card 7 */}
          <div 
            onClick={() => { setQuery('Cinematic Neo Classical'); executeSearch('Cinematic Neo Classical'); }}
            className="relative h-52 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#1e1f28] via-[#1a1b24] to-[#4cd7f6]/20 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer border border-white/[0.04]"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#4cd7f6] uppercase tracking-widest font-semibold block mb-1">7,400 Tracks</span>
                <h4 className="font-headline font-bold text-lg text-white leading-tight">Cinematic Neo-Classical</h4>
              </div>
              <span className="font-mono text-[11px] text-[#cbc3d7]/60">Acoustic Piano &amp; Strings</span>
            </div>
            <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-[18deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3RuntRuRZJJfIaE1xFMsxUKJQ-1Ib-rb3jNAKdCw_jawWpVUj_2qlIZZC9TDV2Chsa9vLZecUj1mKX7LHyn7sn8d5-hr-oj4_RgzWl1En5fA7qvrgCMaXxHmXttRoLQH7VWpv41r0rMkrPAALMcjmFp8e0a2K_mwg4nnxV_qeWWY9dNQkt9KOf3X30vKT8TXkVe1Z8-a724ocGqLcFgkqx0ZnqNlhTtVU6ruN_os" alt="" />
            </div>
          </div>

          {/* Genre Card 8 */}
          <div 
            onClick={() => { setQuery('Global Electronic House'); executeSearch('Global Electronic House'); }}
            className="relative h-52 rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#282933] via-[#1a1b24] to-[#a078ff]/20 shadow-xl group hover:scale-[1.02] transition-all cursor-pointer border border-white/[0.04]"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#d0bcff] uppercase tracking-widest font-semibold block mb-1">22,800 Tracks</span>
                <h4 className="font-headline font-bold text-lg text-white leading-tight">Global Electronic &amp; House</h4>
              </div>
              <span className="font-mono text-[11px] text-[#cbc3d7]/60">Ibiza &amp; Tulum Vibes</span>
            </div>
            <div className="absolute -right-4 -bottom-6 w-28 h-28 rounded-xl overflow-hidden shadow-2xl rotate-[18deg] group-hover:rotate-[12deg] group-hover:scale-110 transition-all duration-300">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFzzlVsE3hHy9Zj5WNo6HkbIzK4lj3vjPkFfeFYU4WeTsV0e2yRAyZtr4Ygb5S3eUmc4zs5ulRIHLLBgVwzNtwiGcywS3KG2YrD_uFpUuWVp1Njm1zPWG_wZde1z2YDoXp7WPl_CnQIqqAiD7JgcAZI6GuiSejooz8SLX8JDtQY7n7lixstu7l6Fgy_kZpmImD0IWwY0HHGmauoW6M7-f15l4-FeRzQn4fQ8Fv0C4" alt="" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
