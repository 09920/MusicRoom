import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { 
  DAILY_MIX_1,
  DISCOVER_WEEKLY,
  DEEP_FOCUS_NEURAL,
  LATE_NIGHT_LOFI
} from '../data/topHitsData';

export default function LibraryView() {
  const {
    playlists,
    likedSongs,
    playSong,
    currentSong,
    playback,
    openPlaylist,
    setPlaylistModalMode,
    deletePlaylist,
    toggleLike
  } = usePlayer();

  const [activeFilter, setActiveFilter] = useState('Playlists'); // Playlists | Liked Songs | Albums | Artists
  const [searchQuery, setSearchQuery] = useState('');

  const quickCards = [
    {
      id: 'liked',
      title: 'Liked Songs',
      subtitle: `${likedSongs?.length || 342} songs`,
      isLikedCard: true,
      onClick: () => setActiveFilter('Liked Songs')
    },
    {
      id: 'chill',
      title: 'Late Night Chill',
      subtitle: 'Curated • 68 tracks',
      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmA-JkR0OQDMX6TYOlgYVMyFq8uqdh9a9Y_hkCcN8NIh7iRGKUthqDC--s0DOHAJpN7_NXFI90I1F4RIfIrikJnXtDjL1DkUVJc1EmzcW8u7cySrdimX2IzwhFLXln8IPhP0vTJUyXDtNYbfRlOVZbAuBAOzoWKfiB1L6uTEyl6ve42s6ajsBHJ1pPo1c1u8DGApkWAl2_NCeQG0Prb3lGy9dLyHwgBVocv0rwMpg',
      tracks: LATE_NIGHT_LOFI
    },
    {
      id: 'focus',
      title: 'Focus & Study Beats',
      subtitle: 'By MusicRoom • 112 tracks',
      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCh5F9Y6DP78oBoPbxRSQvA3Wr9ec_WbsQEngDHdpACsCgiAgxDn-uE4x7BoVAaqnqzpGrzayvaLc6qrFqGeL2CADsvFl5TFBcA3OHb5t8UTeENuW1je31MQz6XOZkTgkWOfT-fd_PaV4mXisFZzG_eOO260TbYMlMKTkRO6zG8LbTfMYf-Cs54L3g6mkUbWOnaesMwR-tzHk0GnIZ-by_E_F-5yx12XKAc2XBoej0',
      tracks: DEEP_FOCUS_NEURAL
    },
    {
      id: 'synth',
      title: 'Synthwave 2088',
      subtitle: 'Obsidian Master • 50 tracks',
      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6yVw5M7qnJyfkF3OHN41cm40lxRjqtO2st6JrDM1mNqVV6ARQOTh_WxE1b4i7DEPy46fYWs1zX0NDVkY6UuZlRKyq0g_x2l26ZXeK56GAcWwJHy0QHyk3i_0RuzL9yQnaUIASU4s9jbwBgD3PqGuXRCHADf2d6Mj7dAv1JUyRIV_JwivTEHfBJ-seB_DcMWR8aEBNAXmPjfpTMyIt32jRaMogwyl8JBlCx8gP2cQ',
      tracks: DAILY_MIX_1
    }
  ];

  const handlePlayTracks = (tracks) => {
    if (tracks && tracks.length > 0) {
      playSong(tracks[0], true);
    }
  };

  return (
    <div className="flex flex-col w-full pb-20 px-gutter select-none">
      <div className="flex flex-col gap-space-xl pt-space-md max-w-7xl mx-auto w-full">

        {/* 1. Header & Primary CTA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md border-b border-surface-container-high/60 pb-space-md">
          <div>
            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-space-xs font-semibold">
              Personal Archive
            </p>
            <h1 className="font-headline text-headline-lg font-bold text-on-surface tracking-tight">
              Your Library
            </h1>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <button
              type="button"
              onClick={() => setPlaylistModalMode('create')}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary font-title text-title-sm font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-title-md">add</span>
              <span>New Playlist</span>
            </button>
          </div>
        </div>

        {/* 2. Filter Tabs & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            {['Playlists', 'Liked Songs', 'Albums', 'Artists', 'Podcasts'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-space-md py-1.5 rounded-full font-title text-title-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === tab
                    ? 'bg-surface-container-high text-on-surface font-semibold shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-title-sm text-outline">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in library..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-container-low text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container transition-colors border border-surface-container-high/40"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-body-sm transition-colors border border-surface-container-high/40"
              >
                <span className="text-on-surface-variant">Sort:</span>
                <span className="font-medium">Recently Added</span>
                <span className="material-symbols-outlined text-title-sm text-outline">expand_more</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Section: Quick Access Cards */}
        <div>
          <h2 className="font-headline text-headline-sm font-bold text-on-surface mb-space-md">
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            {quickCards.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  if (card.isLikedCard) {
                    card.onClick();
                  } else if (card.tracks) {
                    handlePlayTracks(card.tracks);
                  }
                }}
                className="group relative flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer shadow-sm overflow-hidden border border-surface-container-high/40"
              >
                {card.isLikedCard ? (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-container via-inverse-primary to-surface-container-high flex-shrink-0 flex items-center justify-center text-on-primary shadow-sm">
                    <span className="material-symbols-outlined text-headline-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                    <img
                      src={card.cover}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-title text-title-md font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                    {card.title}
                  </span>
                  <span className="font-body text-body-sm text-outline truncate">
                    {card.subtitle}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (card.isLikedCard && likedSongs?.length > 0) {
                      playSong(likedSongs[0], true);
                    } else if (card.tracks) {
                      handlePlayTracks(card.tracks);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center transition-all shadow-md mr-1 flex-shrink-0 hover:scale-105"
                  title="Play"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Active Filter Content: Liked Songs View or Playlists Grid */}
        {activeFilter === 'Liked Songs' ? (
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                Liked Songs ({likedSongs?.length || 0})
              </h2>
              {likedSongs?.length > 0 && (
                <button
                  type="button"
                  onClick={() => playSong(likedSongs[0], true)}
                  className="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-title text-title-sm font-semibold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_arrow
                  </span>
                  <span>Play All</span>
                </button>
              )}
            </div>

            {likedSongs && likedSongs.length > 0 ? (
              <div className="rounded-xl overflow-hidden bg-surface-container-low border border-surface-container-high/40 divide-y divide-surface-container-high">
                {likedSongs.map((song, idx) => {
                  const isPlaying = currentSong?.videoId === song.videoId && playback.isPlaying;
                  return (
                    <div
                      key={song.videoId || idx}
                      onClick={() => playSong(song, true)}
                      className="flex items-center justify-between px-space-md py-3 hover:bg-surface-container transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-space-md min-w-0 flex-1">
                        <span className="w-5 font-metric-mono text-body-sm text-outline text-center">
                          {isPlaying ? (
                            <span className="material-symbols-outlined text-title-sm text-primary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
                              volume_up
                            </span>
                          ) : (
                            idx + 1
                          )}
                        </span>
                        <img
                          src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0 pr-space-md">
                          <span className={`text-body-sm font-semibold truncate ${isPlaying ? 'text-primary' : 'text-on-surface'}`}>
                            {song.title}
                          </span>
                          <span className="text-label-sm text-on-surface-variant truncate">
                            {song.channelTitle || song.artist || 'Artist'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-space-md">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(song);
                          }}
                          className="text-primary hover:text-primary-container p-1 transition-colors"
                          title="Remove from Liked"
                        >
                          <span className="material-symbols-outlined text-title-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-outline bg-surface-container-low rounded-xl border border-surface-container-high/40">
                <span className="material-symbols-outlined text-display text-outline mb-2">favorite_border</span>
                <p className="font-body text-body-md text-on-surface-variant">No liked songs yet.</p>
                <p className="text-body-sm text-outline mt-1">Tap the heart on any song to save it here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-space-md">
            <h2 className="font-headline text-headline-sm font-bold text-on-surface">
              All Playlists &amp; Collections ({playlists?.length || 0})
            </h2>

            {playlists && playlists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-space-md">
                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    onClick={() => openPlaylist(pl)}
                    className="flex flex-col p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer group border border-surface-container-high/40 shadow-sm"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-space-sm bg-surface-container-high flex items-center justify-center">
                      {pl.songs && pl.songs.length > 0 && pl.songs[0].thumbnail ? (
                        <img
                          src={pl.songs[0].thumbnail}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-display text-outline">queue_music</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (pl.songs && pl.songs.length > 0) playSong(pl.songs[0], true);
                        }}
                        className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
                        title="Play Playlist"
                      >
                        <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_arrow
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-title text-title-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {pl.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(pl.id);
                        }}
                        className="text-outline hover:text-error p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Playlist"
                      >
                        <span className="material-symbols-outlined text-body-md">delete</span>
                      </button>
                    </div>
                    <span className="font-body text-body-sm text-outline mt-0.5">
                      {pl.songs ? pl.songs.length : 0} tracks
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-outline bg-surface-container-low rounded-xl border border-surface-container-high/40">
                <span className="material-symbols-outlined text-display text-outline mb-2">library_music</span>
                <p className="font-body text-body-md text-on-surface-variant">No playlists created yet.</p>
                <button
                  type="button"
                  onClick={() => setPlaylistModalMode('create')}
                  className="mt-3 px-space-md py-2 rounded-lg bg-primary text-on-primary font-title text-title-sm font-semibold inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-title-md">add</span>
                  <span>Create First Playlist</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
