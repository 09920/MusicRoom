import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  Shuffle,
  BookmarkPlus,
  Check,
  MoreVertical,
  Heart,
  Plus,
  Search,
  Music2,
  Share2,
  SlidersHorizontal,
  Clock,
  Sparkles,
  ListMusic,
  Download,
  Users,
  Compass,
  Radio
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTracksForCompilation } from '../data/topHitsData';

function formatDuration(val) {
  if (typeof val === 'string' && val.includes(':')) return val;
  const sec = Number(val);
  if (isNaN(sec) || !sec) return '3:45';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function calculateTotalDuration(tracks) {
  let totalSecs = 0;
  tracks.forEach((t) => {
    if (typeof t.duration === 'number') {
      totalSecs += t.duration;
    } else {
      totalSecs += 215; // ~3.5 mins default
    }
  });
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} minutes`;
}

export default function PlaylistView() {
  const {
    selectedPlaylist,
    setActiveTab,
    playSong,
    playFromCollection,
    currentSong,
    playback,
    togglePlayPause,
    isLiked,
    toggleLike,
    addToQueue,
    createPlaylist,
    addSongToPlaylist,
    openSongMenu
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const [activeDiscographyTab, setActiveDiscographyTab] = useState('all');

  // If no playlist selected, return to discover
  if (!selectedPlaylist) {
    return (
      <div className="py-24 text-center text-on-surface-variant flex flex-col items-center gap-3">
        <p className="text-base font-medium">No playlist or album selected</p>
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-label text-xs font-semibold shadow-md active:scale-95 transition-all"
        >
          Return to Discover
        </button>
      </div>
    );
  }

  // Resolve tracks: custom user playlist or curated collection
  const allTracks = useMemo(() => {
    if (Array.isArray(selectedPlaylist.songs) && selectedPlaylist.songs.length > 0) {
      return selectedPlaylist.songs;
    }
    return getTracksForCompilation(selectedPlaylist);
  }, [selectedPlaylist]);

  // Filter tracks by query
  const filteredTracks = useMemo(() => {
    let list = [...allTracks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          ((t.artist || t.channelTitle) && (t.artist || t.channelTitle).toLowerCase().includes(q))
      );
    }
    return list;
  }, [allTracks, searchQuery]);

  const playlistTitle = selectedPlaylist.title || selectedPlaylist.name || 'Featured Master Collection';
  const creatorName = selectedPlaylist.channelTitle || 'Aether Studio';
  const totalDurationStr = calculateTotalDuration(allTracks);
  const bannerImage = selectedPlaylist.thumbnail || (allTracks[0] && allTracks[0].thumbnail) || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80';

  // Play All
  const handlePlayAll = () => {
    if (allTracks.length === 0) return;
    playFromCollection(
      allTracks.map((t) => ({
        videoId: t.videoId,
        title: t.title,
        channelTitle: t.artist || t.channelTitle,
        thumbnail: t.thumbnail,
        duration: t.duration
      })),
      0,
      playlistTitle
    );
  };

  // Shuffle Play
  const handleShufflePlay = () => {
    if (allTracks.length === 0) return;
    const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
    playFromCollection(
      shuffled.map((t) => ({
        videoId: t.videoId,
        title: t.title,
        channelTitle: t.artist || t.channelTitle,
        thumbnail: t.thumbnail,
        duration: t.duration
      })),
      0,
      `${playlistTitle} (Shuffled)`
    );
  };

  // Play specific track in playlist
  const handlePlayTrack = (track, idx) => {
    const songIndex = allTracks.findIndex((t) => t.videoId === track.videoId);
    const targetIdx = songIndex >= 0 ? songIndex : idx;

    playFromCollection(
      allTracks.map((t) => ({
        videoId: t.videoId,
        title: t.title,
        channelTitle: t.artist || t.channelTitle,
        thumbnail: t.thumbnail,
        duration: t.duration
      })),
      targetIdx,
      playlistTitle
    );
  };

  const handleSavePlaylist = () => {
    if (!createPlaylist || !addSongToPlaylist) return;
    const newPl = createPlaylist(playlistTitle);
    if (newPl && allTracks.length > 0) {
      allTracks.forEach((t) => addSongToPlaylist(newPl.id, t));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const isCurrentPlayingFromThis = currentSong && allTracks.some((t) => t.videoId === currentSong.videoId);

  return (
    <div className="flex flex-col w-full gap-8 pb-32">

      {/* Dynamic Atmospheric Glow Underlay */}
      <div className="relative w-full">
        <div className="absolute -top-16 left-1/4 w-[540px] h-[320px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[420px] h-[280px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        {/* 1. Immersive Hero Banner Section */}
        <section className="relative w-full rounded-2xl overflow-hidden bg-surface-container-lowest shadow-2xl mb-8 border border-white/[0.04]">
          {/* Background Cyberpunk Scrim & Artwork */}
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-lighten opacity-30 transform scale-105 transition-transform duration-1000"
            style={{ backgroundImage: `url('${bannerImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-surface-container-lowest/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/60 to-transparent" />

          {/* Hero Content Inner Grid */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[380px]">
            {/* Top Navigation & Metadata Chips */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('discover')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high/80 hover:bg-surface-bright text-on-surface font-label text-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary font-label text-xs shadow-[0_0_12px_rgba(208,188,255,0.2)]">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Verified Studio Master
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high/80 text-secondary font-code text-xs">
                  <span className="material-symbols-outlined text-xs">graphic_eq</span>
                  24-Bit / 192kHz Spatial Master Catalog
                </span>
              </div>

              <div className="flex items-center gap-2 bg-surface-container-high/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.04]">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-code text-xs text-on-surface-variant">Global Soundscape #42</span>
              </div>
            </div>

            {/* Center Typographic Impact */}
            <div className="my-6 max-w-4xl">
              <div className="flex items-baseline gap-2 text-on-surface-variant font-label text-xs sm:text-sm uppercase tracking-wider mb-2">
                <span>{creatorName}</span>
                <span className="text-outline">/</span>
                <span>Original Master</span>
                <span className="text-outline">/</span>
                <span className="text-secondary font-code">Audiophile Pure Direct</span>
              </div>

              <h1 className="font-headline font-bold text-3xl sm:text-4xl md:text-5xl text-on-surface tracking-tight uppercase leading-tight drop-shadow-md">
                {playlistTitle}
              </h1>

              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-2 flex items-center gap-2">
                <span className="font-semibold text-on-surface">{allTracks.length} acoustic masters</span>
                <span className="text-outline">•</span>
                <span className="text-outline">{totalDurationStr}</span>
                <span className="text-outline">•</span>
                <span className="text-secondary font-medium">Paris / Global Direct DAC</span>
              </p>
            </div>

            {/* Action Control Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Glow Violet Play Button */}
              <button
                type="button"
                onClick={handlePlayAll}
                className="group flex items-center gap-2 px-7 py-3 rounded-full bg-primary-container text-on-primary-container font-label text-sm font-semibold shadow-[0_0_24px_rgba(160,120,255,0.45)] hover:shadow-[0_0_32px_rgba(160,120,255,0.7)] hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-2xl">play_arrow</span>
                <span>Play All Masters</span>
              </button>

              {/* Shuffle Button */}
              <button
                type="button"
                onClick={handleShufflePlay}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-surface-container-high/90 hover:bg-surface-bright text-on-surface font-label text-sm transition-all shadow-sm border border-white/[0.04]"
              >
                <Shuffle className="w-4 h-4 text-secondary" />
                <span>Shuffle</span>
              </button>

              {/* Follow / Saved Pill */}
              <button
                type="button"
                onClick={() => setIsFollowing(!isFollowing)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label text-sm transition-all border border-white/[0.04]"
              >
                <span className="material-symbols-outlined text-sm">
                  {isFollowing ? 'check' : 'person_add'}
                </span>
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>

              {/* Save Playlist Button */}
              <button
                type="button"
                onClick={handleSavePlaylist}
                className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label text-sm transition-all border border-white/[0.04]"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{isSaved ? 'Saved to Vault!' : 'Save Playlist'}</span>
              </button>

              {/* Live Tour Alert Tag */}
              <div className="ml-auto hidden xl:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface-container-high/50 backdrop-blur-md border border-white/[0.03]">
                <span className="material-symbols-outlined text-secondary text-base">confirmation_number</span>
                <div className="flex flex-col">
                  <span className="font-label text-xs text-on-surface leading-tight font-medium">
                    OutRun Electro Arena Tour
                  </span>
                  <span className="font-code text-[11px] text-secondary">3 Dates Scheduled • Tickets Live</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Split Grid: 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          {/* 2. Featured Release Spotlight (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-surface-container-low shadow-lg relative overflow-hidden group border border-white/[0.04]">
            {/* Ambient Color Burst */}
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-secondary/15 rounded-full blur-3xl pointer-events-none group-hover:bg-secondary/25 transition-all" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-label text-xs uppercase tracking-widest text-outline">
                  Latest Studio Release
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-code text-xs">
                  Dolby Atmos • 2026
                </span>
              </div>

              {/* Album Vinyl Display Peek */}
              <div className="relative flex items-center justify-center my-4 py-2">
                {/* Simulated Vinyl peeking from sleeve */}
                <div className="absolute w-44 h-44 rounded-full bg-surface-container-lowest shadow-2xl right-6 top-4 flex items-center justify-center transform group-hover:translate-x-6 transition-transform duration-500 ease-out border border-white/[0.06]">
                  <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-secondary-container/40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-surface-container-lowest" />
                    </div>
                  </div>
                </div>

                {/* Sleeve Front Cover Image */}
                <div className="relative z-10 w-52 h-52 rounded-xl overflow-hidden shadow-2xl shadow-black/80 shrink-0 border border-white/[0.08]">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={bannerImage}
                    alt={playlistTitle}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md text-primary font-code text-xs">
                    24-Bit / 96kHz
                  </div>
                </div>
              </div>

              {/* Album Details Metadata */}
              <div className="flex flex-col gap-1 mt-2">
                <h2 className="font-headline font-bold text-xl text-on-surface tracking-tight">
                  {playlistTitle}
                </h2>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant">
                  {creatorName} • Remastered by Metropolis Studio
                </p>
                <div className="flex items-center gap-2 text-outline font-label text-xs mt-1">
                  <span>{allTracks.length} Tracks</span>
                  <span>•</span>
                  <span>{totalDurationStr}</span>
                  <span>•</span>
                  <span className="text-secondary font-medium">Master FLAC & Binaural</span>
                </div>
              </div>
            </div>

            {/* Featured Album CTA Footer */}
            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                onClick={handlePlayAll}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label text-xs sm:text-sm transition-all shadow-sm border border-white/[0.04]"
              >
                <span className="material-symbols-outlined text-primary text-xl">play_circle</span>
                <span>Listen Snippet</span>
              </button>

              <button
                type="button"
                onClick={handleShufflePlay}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-surface-container-highest hover:bg-primary-container hover:text-on-primary-container text-on-surface font-label text-xs sm:text-sm transition-all"
              >
                <span>Shuffle Mix</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* 3. Popular Tracks Table / Audiophile Metrics (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col p-6 rounded-2xl bg-surface-container-low shadow-lg border border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">equalizer</span>
                <h2 className="font-headline font-bold text-lg text-on-surface">Popular Audio Master Tracks</h2>
              </div>

              {/* Filter within playlist */}
              <div className="relative flex items-center min-w-[160px]">
                <Search className="w-3.5 h-3.5 text-outline absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tracks..."
                  className="w-full h-8 pl-8 pr-3 rounded-full bg-surface-container text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary border border-white/[0.03]"
                />
              </div>
            </div>

            {/* Precision Tracklist Table */}
            <div className="w-full flex flex-col gap-1 overflow-x-auto">
              {filteredTracks.map((track, idx) => {
                const isPlayingThis = currentSong?.videoId === track.videoId && playback.isPlaying;
                const liked = isLiked(track.videoId);

                return (
                  <div
                    key={`track-${track.videoId}-${idx}`}
                    className="group flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-high/70 transition-colors border border-transparent hover:border-white/[0.03]"
                  >
                    <div
                      onClick={() => handlePlayTrack(track, idx)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                    >
                      <span className="w-6 text-center font-code text-xs text-primary font-bold group-hover:hidden">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        className="w-6 hidden group-hover:flex items-center justify-center text-primary"
                      >
                        <span className="material-symbols-outlined text-xl">
                          {isPlayingThis ? 'pause' : 'play_arrow'}
                        </span>
                      </button>

                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest shadow-sm">
                        <img
                          className="w-full h-full object-cover"
                          src={track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`}
                          alt={track.title}
                          loading="lazy"
                        />
                        {isPlayingThis && (
                          <div className="absolute inset-0 bg-violet-950/75 flex items-center justify-center gap-0.5">
                            <span className="w-0.5 h-2.5 bg-secondary rounded-full animate-eq-1" />
                            <span className="w-0.5 h-3 bg-primary rounded-full animate-eq-2" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-label text-sm text-on-surface truncate font-semibold group-hover:text-primary transition-colors">
                            {track.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-secondary font-code text-[10px]">
                            Hi-Res
                          </span>
                        </div>
                        <span className="font-body text-xs text-on-surface-variant truncate">
                          {track.artist || track.channelTitle || creatorName}
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center justify-end w-28 px-2 text-right">
                      <span className="font-code text-xs text-on-surface-variant font-medium">
                        {(180 - idx * 12 + 420).toLocaleString()}k plays
                      </span>
                    </div>

                    <div className="hidden md:flex items-center justify-center w-24 px-2">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-code text-[11px]">
                        24b / 192k
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pl-2">
                      <span className="font-code text-xs text-on-surface-variant">
                        {formatDuration(track.duration)}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleLike(track)}
                        className="text-outline hover:text-tertiary-container transition-colors"
                        title={liked ? "Liked" : "Like"}
                      >
                        <span className={`material-symbols-outlined text-base ${liked ? 'text-tertiary-container' : ''}`}>
                          {liked ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => addToQueue?.(track)}
                        className="text-outline hover:text-on-surface transition-colors p-1"
                        title="Add to queue"
                      >
                        <span className="material-symbols-outlined text-base">queue</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openSongMenu?.(track)}
                        className="text-outline hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="More options"
                      >
                        <span className="material-symbols-outlined text-base">more_vert</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Discography Carousel & Categorized Tabs */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <h2 className="font-headline font-bold text-xl text-on-surface">Discography</h2>
              <span className="font-code text-xs text-outline">32 Studio Masters</span>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full overflow-x-auto border border-white/[0.03]">
              {['All Releases', 'Albums (3)', 'EPs & Singles (8)', 'Remixes & Collabs', 'Live Masters'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveDiscographyTab(tab)}
                  className={`px-3.5 py-1 rounded-full font-label text-xs transition-colors whitespace-nowrap ${activeDiscographyTab === tab
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              {
                title: 'OutRun (Deluxe)',
                year: '2013 • Album',
                tracks: '13 Tracks',
                badge: 'FLAC 192k',
                cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80'
              },
              {
                title: 'Reborn Master Remaster',
                year: '2022 • Studio',
                tracks: '12 Tracks',
                badge: 'Spatial 3D',
                cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80'
              },
              {
                title: 'Nightcall (Live Stems)',
                year: '2024 • EP',
                tracks: '4 Tracks',
                badge: 'Pure Master',
                cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'
              },
              {
                title: 'Pacific Drift Sessions',
                year: '2025 • Collab',
                tracks: '8 Tracks',
                badge: '24b FLAC',
                cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80'
              },
              {
                title: 'Subterranean Neon Horizon',
                year: '2026 • Live',
                tracks: '15 Tracks',
                badge: 'Dolby Atmos',
                cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'
              }
            ].map((item, idx) => (
              <div
                key={item.title}
                onClick={handlePlayAll}
                className="group flex flex-col p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer border border-white/[0.04]"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-highest mb-2.5 shadow-md">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={item.cover}
                    alt={item.title}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-surface-container-lowest/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(160,120,255,0.6)]"
                    >
                      <span className="material-symbols-outlined text-xl">play_arrow</span>
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface-container-lowest/80 text-secondary font-code text-[10px]">
                    {item.badge}
                  </div>
                </div>

                <span className="font-label text-sm text-on-surface font-semibold truncate group-hover:text-primary transition-colors">
                  {item.title}
                </span>
                <div className="flex items-center justify-between text-outline font-body text-xs mt-0.5">
                  <span>{item.year}</span>
                  <span className="font-code text-[11px]">{item.tracks}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}
