import React, { useState } from 'react';
import { 
  Heart, 
  ListMusic, 
  History as HistoryIcon, 
  Plus, 
  Upload, 
  Play, 
  Pause, 
  Shuffle, 
  MoreVertical, 
  Trash2, 
  Music, 
  FolderPlus,
  Sparkles,
  Clock,
  Download,
  Users,
  Search,
  Check,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
  if (!sec) return '3:30';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const PINNED_HERO_CARDS = [
  {
    id: 'pinned-1',
    title: 'Hyperpop Hologram',
    subtitle: 'Curated weekly by Aether AI Lab',
    badge: '24-BIT FLAC',
    tag: '#160BPM',
    tracksCount: '48 Tracks • 2h 44m',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    accent: 'secondary'
  },
  {
    id: 'pinned-2',
    title: 'Deep Focus Neural',
    subtitle: 'Ambient & Binaural Gamma 40Hz',
    badge: 'OFFLINE READY',
    tag: '#Binaural',
    tracksCount: '72 Tracks • 6h 18m',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    accent: 'primary'
  },
  {
    id: 'pinned-3',
    title: 'Late Night Lofi Drift',
    subtitle: 'Warm SP-404 Analog Master Tapes',
    badge: 'TAPE SATURATION',
    tag: '#LateNight',
    tracksCount: '95 Tracks • 4h 12m',
    cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    accent: 'tertiary'
  },
  {
    id: 'pinned-4',
    title: 'Techno Bunker Vault',
    subtitle: 'Peak-time Berlin Berghain sound',
    badge: 'DOLBY ATMOS',
    tag: '#142BPM',
    tracksCount: '64 Tracks • 5h 08m',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    collab: true
  }
];

export default function LibraryView() {
  const {
    librarySubTab,
    setLibrarySubTab,
    likedSongs,
    playlists,
    history,
    playSong,
    playPlaylist,
    playFromCollection,
    openPlaylist,
    currentSong,
    playback,
    openSongMenu,
    setPlaylistModalMode,
    setIsImportModalOpen,
    deletePlaylist,
    removeSongFromPlaylist,
    isLiked,
    toggleLike,
    setIsPartyOpen
  } = usePlayer();

  const [activeCollectionTab, setActiveCollectionTab] = useState('all'); // 'all' | 'playlists' | 'liked' | 'masters' | 'history'
  const [filterQuery, setFilterQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedCustomPlaylist, setSelectedCustomPlaylist] = useState(null);

  // Total tracks calculation
  const totalCatalogedTracks = likedSongs.length + playlists.reduce((acc, p) => acc + (p.songs?.length || 0), 0) + 420;

  return (
    <div className="flex flex-col w-full gap-8 pb-32">

      {/* Top Ambient Luminous Halo */}
      <div className="relative w-full">
        <div className="absolute -top-16 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-10 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Page Title & Header Actions */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pt-2">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2 text-secondary font-code text-xs uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">library_music</span>
              <span>Aether Sound Studio // Vault Archive</span>
            </div>
            <h1 className="font-headline font-bold text-3xl sm:text-4xl text-on-surface tracking-tight leading-tight">
              Your Collection
            </h1>
            <p className="font-body text-sm sm:text-base text-on-surface-variant">
              Curated soundscapes, lossless masters, and archived frequencies directly synced to your studio monitor.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaylistModalMode('create')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(160,120,255,0.35)] font-label text-sm font-semibold group"
            >
              <span className="material-symbols-outlined group-hover:rotate-90 transition-transform text-lg">
                add
              </span>
              <span>Create Playlist</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all font-label text-sm shadow-sm border border-white/[0.04]"
            >
              <span className="material-symbols-outlined text-secondary text-lg">file_upload</span>
              <span>Import Stems</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPartyOpen?.(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-all font-label text-sm shadow-sm border border-white/[0.04]"
            >
              <span className="material-symbols-outlined text-tertiary text-lg">group_work</span>
              <span>Live Session Room</span>
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            </button>
          </div>
        </div>

        {/* Micro Stats & Telemetry Bar */}
        <div className="mt-6 w-full bg-surface-container-low/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-md flex flex-wrap items-center justify-between gap-4 border border-white/[0.04]">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">audio_file</span>
              <span className="font-label font-bold text-sm text-on-surface">{totalCatalogedTracks}</span>
              <span className="font-body text-xs text-outline">Tracks Cataloged</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">queue_music</span>
              <span className="font-label font-bold text-sm text-on-surface">{playlists.length + 4}</span>
              <span className="font-body text-xs text-outline">Playlists</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-base">album</span>
              <span className="font-label font-bold text-sm text-on-surface">18</span>
              <span className="font-body text-xs text-outline">Hi-Res Masters</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.8)]" />
              <span className="font-label font-bold text-sm text-on-surface">142 GB</span>
              <span className="font-body text-xs text-outline">Stored Offline (Synced)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-on-surface-variant font-code text-xs">
            <span className="material-symbols-outlined text-sm text-secondary">wifi_protected_setup</span>
            <span>Studio DAC: Asynchronous USB 384kHz</span>
          </div>
        </div>
      </div>

      {/* Filter, Search & View Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-surface-container-lowest/60 p-2.5 rounded-2xl border border-white/[0.03]">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Collections' },
            { id: 'playlists', label: `Playlists (${playlists.length + 4})` },
            { id: 'liked', label: `Liked Songs (${likedSongs.length})`, dot: true },
            { id: 'masters', label: 'Downloaded Masters (14)' },
            { id: 'history', label: `History (${history.length})` },
            { id: 'collab', label: 'Collaborative (3 Active)' },
          ].map((tab) => {
            const isActive = activeCollectionTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCollectionTab(tab.id);
                  setSelectedCustomPlaylist(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-label text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_12px_rgba(160,120,255,0.4)]'
                    : 'bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.dot && <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Search & Layout Toggles */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-outline absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter vault..."
              className="w-full h-9 pl-9 pr-4 rounded-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-white/[0.03]"
            />
          </div>

          <div className="flex items-center bg-surface-container-low rounded-full p-1 border border-white/[0.03]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                viewMode === 'grid'
                  ? 'bg-surface-container-highest text-secondary shadow-[0_0_8px_rgba(76,215,246,0.3)]'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                viewMode === 'list'
                  ? 'bg-surface-container-highest text-secondary shadow-[0_0_8px_rgba(76,215,246,0.3)]'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-sm">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: When Liked Songs Tab is Active */}
      {activeCollectionTab === 'liked' ? (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container">favorite</span>
              <h2 className="font-headline font-bold text-xl text-on-surface">Liked Songs ({likedSongs.length})</h2>
            </div>
            {likedSongs.length > 0 && (
              <button
                type="button"
                onClick={() => playFromCollection(likedSongs, 0, 'Liked Songs')}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary-container text-on-primary-container font-label text-xs font-semibold shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {likedSongs.length === 0 ? (
            <div className="py-20 text-center text-outline flex flex-col items-center">
              <Heart className="w-12 h-12 text-white/20 mb-2" />
              <p className="text-base font-medium text-white/70">No liked songs yet</p>
              <p className="text-xs text-white/40 mt-1">Tap the heart icon on any song to save it here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 bg-surface-container-low p-4 rounded-2xl border border-white/[0.04]">
              {likedSongs.map((song, idx) => {
                const isPlayingThis = currentSong?.videoId === song.videoId && playback.isPlaying;
                return (
                  <div
                    key={`liked-${song.videoId}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-all group"
                  >
                    <div
                      onClick={() => playFromCollection(likedSongs, idx, 'Liked Songs')}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="font-code text-xs text-outline w-6 text-center">{idx + 1}</span>
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest">
                        <img
                          src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        {isPlayingThis && (
                          <div className="absolute inset-0 bg-violet-950/75 flex items-center justify-center gap-0.5">
                            <span className="w-0.5 h-3 bg-secondary rounded-full animate-eq-1" />
                            <span className="w-0.5 h-4 bg-primary rounded-full animate-eq-2" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                          {song.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant truncate">
                          {song.channelTitle || 'Artist'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary font-code text-xs hidden sm:inline-block">
                        24b FLAC
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleLike(song)}
                        className="text-tertiary-container hover:scale-110 transition-transform"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openSongMenu(song)}
                        className="text-outline hover:text-on-surface transition-colors p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : activeCollectionTab === 'history' ? (
        /* VIEW: When History Tab is Active */
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">history</span>
              <h2 className="font-headline font-bold text-xl text-on-surface">Listening History ({history.length})</h2>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-20 text-center text-outline flex flex-col items-center">
              <HistoryIcon className="w-12 h-12 text-white/20 mb-2" />
              <p className="text-base font-medium text-white/70">No listening history yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 bg-surface-container-low p-4 rounded-2xl border border-white/[0.04]">
              {history.map((song, idx) => (
                <div
                  key={`history-${song.videoId}-${idx}`}
                  onClick={() => playSong(song)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest">
                      <img
                        src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                        {song.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant truncate">
                        {song.channelTitle || 'Artist'}
                      </p>
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-outline group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* DEFAULT VIEW: Pinned Heavy Rotation & Extended Curated Smart Mixes */
        <>
          {/* Pinned Heavy Rotation Section */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-container text-xl">push_pin</span>
                <h2 className="font-headline font-bold text-xl sm:text-2xl text-on-surface">
                  Heavy Rotation & Pinned
                </h2>
                <span className="font-code text-xs text-outline ml-2">// 4 SPACES DOCKED</span>
              </div>
            </div>

            {/* Pinned Grid Row (4 Hero Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {PINNED_HERO_CARDS.map((card) => (
                <div
                  key={card.id}
                  className="group relative flex flex-col rounded-2xl bg-surface-container-low/80 backdrop-blur-xl p-4 hover:bg-surface-container transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border border-white/[0.04]"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-highest shadow-inner">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={card.cover}
                      alt={card.title}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-secondary font-code text-xs shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span>{card.badge}</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 p-1 rounded-full bg-surface-container-lowest/70 backdrop-blur-md text-tertiary-container shadow-sm">
                      <span className="material-symbols-outlined text-xs">push_pin</span>
                    </div>

                    {/* Hover Play Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (likedSongs.length > 0) {
                          playFromCollection(likedSongs, 0, card.title);
                        }
                      }}
                      className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gradient-to-r from-primary-container to-secondary flex items-center justify-center text-on-primary-container opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-[0_0_20px_rgba(160,120,255,0.6)] active:scale-95"
                    >
                      <span className="material-symbols-outlined text-2xl">play_arrow</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 mt-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      <span className="material-symbols-outlined text-tertiary-container text-base">favorite</span>
                    </div>
                    <span className="font-body text-xs text-on-surface-variant truncate">
                      {card.subtitle}
                    </span>
                    <div className="flex items-center justify-between text-outline font-code text-xs mt-1">
                      <span>{card.tracksCount}</span>
                      <span className="text-secondary font-medium">{card.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Curated Playlists & Smart Collections (Extended Bento Grid) */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">auto_awesome</span>
                <h2 className="font-headline font-bold text-xl sm:text-2xl text-on-surface">
                  Curated & Dynamic Smart Mixes
                </h2>
              </div>
              <div className="text-outline font-body text-xs">
                <span>Showing {playlists.length + 4} collections</span>
              </div>
            </div>

            {/* Main Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {/* Smart Card 1: Liked Songs (Signature Gradient Tile) */}
              <div
                onClick={() => setActiveCollectionTab('liked')}
                className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary-container/80 via-primary/20 to-surface-container-low p-6 shadow-lg hover:shadow-[0_0_24px_rgba(160,120,255,0.4)] transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-white/[0.04]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_16px_rgba(160,120,255,0.6)]">
                    <span className="material-symbols-outlined text-3xl">favorite</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/60 backdrop-blur-md text-primary font-code text-xs">
                    AUTO-SYNC
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-10">
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    Dynamic Stream
                  </span>
                  <h3 className="font-headline font-bold text-xl text-on-surface group-hover:text-primary transition-colors">
                    Liked Songs
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant">
                    Your personal catalog of starred frequencies.
                  </p>
                  <div className="flex items-center justify-between pt-2 font-code text-xs text-on-surface">
                    <span>{likedSongs.length} Tracks Cataloged</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (likedSongs.length > 0) {
                          playFromCollection(likedSongs, 0, 'Liked Songs');
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-on-surface text-surface-container-lowest flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Time Capsule 2024 Retrospective */}
              <div className="group relative flex flex-col rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-4 hover:bg-surface-container transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border border-white/[0.04]">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-highest">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80"
                    alt="Time Capsule: 2024"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-secondary font-code text-xs">
                    ANNUAL ARCHIVE
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (likedSongs.length > 0) playFromCollection(likedSongs, 0, 'Time Capsule: 2024');
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-md"
                  >
                    <span className="material-symbols-outlined">play_arrow</span>
                  </button>
                </div>
                <div className="flex flex-col gap-1 mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                      Time Capsule: 2024
                    </h3>
                    <span className="material-symbols-outlined text-outline hover:text-tertiary-container transition-colors text-base">favorite</span>
                  </div>
                  <span className="font-body text-xs text-on-surface-variant truncate">
                    Curated by Aether AI Retrospective
                  </span>
                  <div className="flex items-center justify-between text-outline font-code text-xs mt-1">
                    <span>100 Tracks • 6h 34m</span>
                    <span className="text-secondary font-medium">#Rewind</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Synthetic Dreams Volume IV */}
              <div className="group relative flex flex-col rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-4 hover:bg-surface-container transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border border-white/[0.04]">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-highest">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80"
                    alt="Synthetic Dreams IV"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-primary font-code text-xs">
                    SPATIAL MASTER
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (likedSongs.length > 0) playFromCollection(likedSongs, 0, 'Synthetic Dreams IV');
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-md"
                  >
                    <span className="material-symbols-outlined">play_arrow</span>
                  </button>
                </div>
                <div className="flex flex-col gap-1 mt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                      Synthetic Dreams IV
                    </h3>
                    <span className="material-symbols-outlined text-outline hover:text-tertiary-container transition-colors text-base">favorite</span>
                  </div>
                  <span className="font-body text-xs text-on-surface-variant truncate">
                    Curated by Alex Vance & Kavinsky
                  </span>
                  <div className="flex items-center justify-between text-outline font-code text-xs mt-1">
                    <span>54 Tracks • 3h 48m</span>
                    <span className="text-secondary font-medium">#Cyberpunk</span>
                  </div>
                </div>
              </div>

              {/* User's Created Custom Playlists */}
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="group relative flex flex-col rounded-2xl bg-surface-container-low/70 backdrop-blur-xl p-4 hover:bg-surface-container transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border border-white/[0.04]"
                >
                  <div
                    onClick={() => openPlaylist?.(pl)}
                    className="relative w-full aspect-square rounded-xl overflow-hidden bg-surface-container-highest cursor-pointer"
                  >
                    {pl.songs && pl.songs.length > 0 && pl.songs[0].thumbnail ? (
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={pl.songs[0].thumbnail}
                        alt={pl.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1e1f28] text-white/30">
                        <ListMusic className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-secondary font-code text-xs">
                      CUSTOM VAULT
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pl.songs && pl.songs.length > 0) {
                          playFromCollection(pl.songs, 0, pl.name);
                        }
                      }}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-md active:scale-95"
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 mt-3">
                    <div className="flex items-center justify-between">
                      <h3
                        onClick={() => openPlaylist?.(pl)}
                        className="font-headline font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors cursor-pointer"
                      >
                        {pl.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => deletePlaylist?.(pl.id)}
                        className="text-outline hover:text-rose-400 transition-colors p-1"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-body text-xs text-on-surface-variant truncate">
                      {pl.songs ? `${pl.songs.length} Tracks` : 'Empty playlist'}
                    </span>
                    <div className="flex items-center justify-between text-outline font-code text-xs mt-1">
                      <span>Created in MusicRoom</span>
                      <span className="text-primary font-medium">#MyVault</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
}
