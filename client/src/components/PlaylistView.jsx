import React, { useState } from 'react';
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

export default function PlaylistView() {
  const {
    selectedPlaylist,
    setActiveTab,
    playSong,
    currentSong,
    playback,
    togglePlayPause,
    isLiked,
    toggleLike,
    addToQueue
  } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');

  // Fallback if no playlist is selected: Default to Chrono Trigger Re-Imagined / Neon Horizons
  const playlist = selectedPlaylist || {
    id: 'chrono-reimagined',
    name: 'Chrono Trigger Re-Imagined',
    title: 'Chrono Trigger Re-Imagined',
    artist: 'Yasunori Mitsuda & London Symphony Orchestra',
    composer: 'Yasunori Mitsuda',
    year: '2024',
    genre: 'Orchestral / Acoustic',
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHTluNTe1HAeqjyIFfmWwMK3EpdJTF5p-dWFlWqzi_CUEANUTgeQGq6qD7RT1OdfWbdfkLJvP2lkYoVcSRvb9dTcQd8rWQsL7unTsSX1pwoCUs6sUn-LiZhy_bhszAVw3Uf6Q90FMiJ7OMNxXIAEX-piM9qvR5acBmrQRPD8hYZ-7yA1juvcJYCjOyxuMCMAp58Zb9YHo-jFHPEKy50lUv2bu8SMiqjAPB9B5sR8c',
    composerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaPlPFxtZgj05ubsylxm7YmCnK1ImClZAyoykokvevb0RU4ycOQOc0oJa_Or1BE9IK8-13DAqE7JSRv8TzWMswIX3MfcaKQH2z-nywHLhNNkNz3TqgQhyA7PKsusIjQTn2-dGOTK49wQMLCmCX9QbeW4hZKMTGixMMuvJcPVJgxYlJ3YdfBstRa5i6FnwMMoecdsUEXUXs5Lm_Ufxb0ZE_D2vdJhz0mGoYcmBdPWM',
    songs: [
      {
        videoId: 'kPa7bsKwL-c',
        title: 'Presentiment (Wind Scene)',
        artist: 'Yasunori Mitsuda, London Symphony Orchestra',
        plays: '1,248,392',
        duration: '4:18'
      },
      {
        videoId: 'eVTXPUF4Oz4',
        title: 'Chrono Corridor (Corridors of Time)',
        artist: 'Yasunori Mitsuda',
        plays: '2,841,902',
        duration: '5:24'
      },
      {
        videoId: 'V9PVRfjEBTI',
        title: 'Secret of the Forest',
        artist: 'Yasunori Mitsuda, London Symphony Orchestra',
        plays: '954,120',
        duration: '4:46'
      },
      {
        videoId: 'LK7-_dgAVQE',
        title: 'Schala’s Theme',
        artist: 'Yasunori Mitsuda',
        plays: '3,109,481',
        duration: '3:58'
      },
      {
        videoId: 'MV_3Dpw-BRY',
        title: 'To Far Away Times',
        artist: 'Yasunori Mitsuda, London Symphony Orchestra',
        plays: '1,720,443',
        duration: '4:30'
      }
    ]
  };

  const tracks = playlist.songs || getTracksForCompilation(playlist.id) || [];
  const albumCover = playlist.cover || playlist.thumbnail || (tracks[0]?.thumbnail) || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHTluNTe1HAeqjyIFfmWwMK3EpdJTF5p-dWFlWqzi_CUEANUTgeQGq6qD7RT1OdfWbdfkLJvP2lkYoVcSRvb9dTcQd8rWQsL7unTsSX1pwoCUs6sUn-LiZhy_bhszAVw3Uf6Q90FMiJ7OMNxXIAEX-piM9qvR5acBmrQRPD8hYZ-7yA1juvcJYCjOyxuMCMAp58Zb9YHo-jFHPEKy50lUv2bu8SMiqjAPB9B5sR8c';

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playSong(tracks[0], true);
      for (let i = 1; i < Math.min(tracks.length, 15); i++) {
        addToQueue(tracks[i]);
      }
    }
  };

  const handlePlayTrack = (track) => {
    playSong({
      videoId: track.videoId,
      title: track.title,
      artist: track.artist || track.channelTitle || playlist.artist,
      channelTitle: track.channelTitle || track.artist || playlist.artist,
      thumbnail: track.thumbnail || albumCover
    }, true);
  };

  return (
    <div className="flex flex-col w-full pb-20 px-gutter select-none relative">
      
      {/* Subtle Gradient Ambient Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary-container/15 via-surface-container/30 to-transparent pointer-events-none -z-10" />

      <div className="flex flex-col gap-space-lg pt-space-md max-w-7xl mx-auto w-full">

        {/* Back Link */}
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-body-sm font-medium transition-colors self-start"
        >
          <span className="material-symbols-outlined text-title-md">arrow_back</span>
          <span>Back to Discovery</span>
        </button>

        {/* 1. ALBUM HEADER HERO */}
        <header className="flex flex-col md:flex-row items-start md:items-end gap-space-xl pt-space-xs pb-space-lg">
          {/* Album Cover Artwork */}
          <div className="relative group flex-shrink-0 w-52 h-52 md:w-64 md:h-64 rounded-xl overflow-hidden bg-surface-container-high shadow-xl border border-white/5">
            <img
              src={albumCover}
              alt={playlist.name || playlist.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-lowest/40 to-transparent pointer-events-none" />
          </div>

          {/* Album Metadata & Action Bar */}
          <div className="flex flex-col justify-end flex-1 min-w-0">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-primary font-bold mb-space-xs">
              Album
            </span>
            <h1 className="text-display-mobile md:text-headline-lg font-headline text-on-surface font-extrabold tracking-tight truncate leading-tight">
              {playlist.name || playlist.title}
            </h1>

            {/* Meta Line */}
            <div className="flex flex-wrap items-center gap-x-space-sm gap-y-1 mt-space-sm text-body-md font-body text-on-surface-variant">
              <div className="flex items-center gap-space-xs">
                {playlist.composerAvatar && (
                  <img
                    src={playlist.composerAvatar}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span className="text-on-surface font-semibold">
                  {playlist.composer || playlist.artist || 'Artist'}
                </span>
              </div>
              <span className="text-outline">•</span>
              <span>{playlist.year || '2024'}</span>
              <span className="text-outline">•</span>
              <span>
                {tracks.length} songs
              </span>
              <span className="text-outline">•</span>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-label-sm font-label-sm text-on-surface-variant">
                {playlist.genre || 'Hi-Fi Audio'}
              </span>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-space-md mt-space-lg">
              {/* Primary Big Play Button */}
              <button
                type="button"
                onClick={handlePlayAll}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-primary hover:bg-primary-fixed-dim text-on-primary-fixed shadow-lg hover:scale-105 active:scale-95 transition-all"
                title="Play Album"
              >
                <span className="material-symbols-outlined text-display-mobile" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_arrow
                </span>
              </button>

              {/* Heart / Save */}
              <button
                type="button"
                onClick={() => {
                  if (tracks.length > 0) toggleLike(tracks[0]);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-primary transition-all"
                title="Save to Library"
              >
                <span className="material-symbols-outlined text-title-md">favorite_border</span>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-all"
                title="Share"
              >
                <span className="material-symbols-outlined text-title-md">share</span>
              </button>
            </div>
          </div>
        </header>

        {/* 2. TRACKLIST SECTION */}
        <section className="mt-space-md">
          {/* Table Headers */}
          <div className="grid grid-cols-[48px_1fr_120px_90px_48px] items-center px-space-md py-space-xs text-label-sm font-label-sm uppercase tracking-wider text-outline mb-space-xs font-semibold border-b border-surface-container-high/40">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="text-right">Plays</span>
            <span className="text-right">Time</span>
            <span className="text-center">
              <span className="material-symbols-outlined text-body-md text-outline">favorite</span>
            </span>
          </div>

          {/* Tracks List */}
          <div className="flex flex-col gap-0.5 divide-y divide-surface-container-high/30">
            {tracks.map((track, idx) => {
              const isPlayingThis = currentSong?.videoId === track.videoId && playback.isPlaying;
              const liked = isLiked(track.videoId);

              return (
                <div
                  key={track.videoId || idx}
                  onClick={() => handlePlayTrack(track)}
                  className={`group grid grid-cols-[48px_1fr_120px_90px_48px] items-center px-space-md py-2.5 rounded-lg transition-colors cursor-pointer ${
                    isPlayingThis
                      ? 'bg-surface-container/80 text-primary'
                      : 'hover:bg-surface-container-high'
                  }`}
                >
                  {/* # / Play Icon */}
                  <div className="flex items-center justify-center text-primary">
                    {isPlayingThis ? (
                      <span className="material-symbols-outlined text-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                        volume_up
                      </span>
                    ) : (
                      <>
                        <span className="group-hover:hidden font-metric-mono text-label-md text-outline">
                          {idx + 1}
                        </span>
                        <span className="hidden group-hover:block material-symbols-outlined text-title-md text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>
                          play_arrow
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="flex flex-col min-w-0 pr-space-md">
                    <span className={`text-body-md font-semibold truncate ${isPlayingThis ? 'text-primary' : 'text-on-surface group-hover:text-primary transition-colors'}`}>
                      {track.title}
                    </span>
                    <span className="text-body-sm text-on-surface-variant truncate">
                      {track.artist || track.channelTitle || playlist.artist}
                    </span>
                  </div>

                  {/* Plays */}
                  <div className="text-right text-body-sm font-metric-mono text-outline">
                    {track.plays || '1,248,392'}
                  </div>

                  {/* Duration */}
                  <div className="text-right text-body-sm font-metric-mono text-outline">
                    {formatDuration(track.duration)}
                  </div>

                  {/* Like Button */}
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className={`p-1 transition-colors ${
                        liked ? 'text-primary' : 'text-outline hover:text-primary opacity-0 group-hover:opacity-100'
                      }`}
                      title="Favorite"
                    >
                      <span className="material-symbols-outlined text-title-sm" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                        {liked ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
