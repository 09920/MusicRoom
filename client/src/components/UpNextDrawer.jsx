import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
  if (isNaN(sec) || sec === null || sec === undefined || sec === 0) return '3:20';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function UpNextDrawer({ isOpen, onClose }) {
  const {
    currentSong,
    queue,
    playingFrom,
    playSong,
    removeFromQueue,
    clearQueue,
    createPlaylist,
    addSongToPlaylist
  } = usePlayer();

  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveQueue = () => {
    if (!createPlaylist || !addSongToPlaylist) return;
    const name = playingFrom?.name || `Queue (${new Date().toLocaleDateString()})`;
    const pl = createPlaylist(name);
    if (pl) {
      if (currentSong) addSongToPlaylist(pl.id, currentSong);
      queue.forEach((s) => addSongToPlaylist(pl.id, s));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-surface-container-low/95 border-l border-surface-container-high/80 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col select-none animate-in slide-in-from-right duration-250">
      
      {/* 1. Header */}
      <div className="pt-4 px-5 border-b border-surface-container-high shrink-0">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-title-md text-primary">queue_music</span>
            <span className="font-headline font-bold text-title-md text-on-surface tracking-tight">
              Up Next ({queue?.length || 0})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-title-md">close</span>
          </button>
        </div>

        {/* Action strip: Playing From & Save/Clear */}
        <div className="flex items-center justify-between py-2 text-body-sm text-on-surface-variant border-t border-surface-container-high/40">
          <span className="truncate max-w-[180px] font-medium">
            {playingFrom?.name || 'Now Playing'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveQueue}
              className="px-2 py-0.5 rounded text-xs text-primary hover:bg-surface-container transition-colors font-medium"
            >
              {isSaved ? 'Saved!' : 'Save'}
            </button>
            {queue?.length > 0 && (
              <button
                type="button"
                onClick={clearQueue}
                className="px-2 py-0.5 rounded text-xs text-outline hover:text-error hover:bg-surface-container transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Scrollable Queue Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
        {/* Currently Playing Card */}
        {currentSong && (
          <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high flex items-center gap-3">
            <img
              src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
              alt=""
              className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-metric-mono uppercase tracking-wider text-primary font-bold block">
                ▶ Playing Now
              </span>
              <p className="text-body-sm font-semibold text-on-surface truncate">
                {currentSong.title}
              </p>
              <p className="text-label-sm text-on-surface-variant truncate">
                {currentSong.channelTitle || currentSong.artist || 'Artist'}
              </p>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div className="space-y-1">
          {queue?.length === 0 ? (
            <div className="py-16 text-center text-outline">
              <span className="material-symbols-outlined text-display text-outline mb-2">music_note</span>
              <p className="text-body-sm">Queue is empty</p>
              <p className="text-label-sm text-outline mt-1">Play any track or add songs to listen next</p>
            </div>
          ) : (
            queue.map((song, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container transition-colors group cursor-pointer"
                onClick={() => {
                  playSong(song, true);
                  removeFromQueue(idx);
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-4 text-center font-metric-mono text-label-sm text-outline group-hover:hidden">
                    {idx + 1}
                  </span>
                  <button
                    type="button"
                    className="w-4 hidden group-hover:flex items-center justify-center text-primary"
                    title="Play"
                  >
                    <span className="material-symbols-outlined text-title-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </button>
                  <img
                    src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-body-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                      {song.title}
                    </p>
                    <p className="text-label-sm text-on-surface-variant truncate">
                      {song.channelTitle || song.artist || 'Artist'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-metric-mono text-label-sm text-outline">
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(idx);
                    }}
                    className="p-1 text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <span className="material-symbols-outlined text-title-sm">close</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
