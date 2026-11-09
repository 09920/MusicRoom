import React, { useState } from 'react';
import { Plus, FolderPlus, X, Check, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function PlaylistModal() {
  const {
    playlistModalMode,
    setPlaylistModalMode,
    songToAddToPlaylist,
    playlists,
    createPlaylist,
    addSongToPlaylist
  } = usePlayer();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addedMap, setAddedMap] = useState({});

  if (!playlistModalMode) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim());
    if (songToAddToPlaylist && pl) {
      addSongToPlaylist(pl.id, songToAddToPlaylist);
    }
    setNewPlaylistName('');
    setPlaylistModalMode(null);
  };

  const handleAdd = (playlistId) => {
    if (!songToAddToPlaylist) return;
    addSongToPlaylist(playlistId, songToAddToPlaylist);
    setAddedMap((prev) => ({ ...prev, [playlistId]: true }));
    setTimeout(() => {
      setPlaylistModalMode(null);
    }, 700);
  };

  return (
    <div
      onClick={() => setPlaylistModalMode(null)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl liquid-glass-strong border border-white/10 p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-400" />
            <h3 className="font-heading italic text-lg text-white">
              {playlistModalMode === 'create' ? 'Create New Playlist' : 'Add to Playlist'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setPlaylistModalMode(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Create Playlist Form */}
        {playlistModalMode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4 pt-1">
            <div>
              <label className="text-xs text-white/60 block mb-1.5 font-medium">Playlist Name</label>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="e.g. Late Night Drives, Gym Hits..."
                autoFocus
                className="w-full px-4 py-3 rounded-2xl liquid-glass text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setPlaylistModalMode(null)}
                className="px-4 py-2 rounded-full liquid-glass text-xs font-medium text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-5 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold shadow-md active:scale-95 transition-all disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          /* 2. Choose Playlist to Add Song */
          <div className="space-y-3 pt-1">
            {songToAddToPlaylist && (
              <p className="text-xs text-white/50 truncate">
                Adding: <span className="text-white font-medium">{songToAddToPlaylist.title}</span>
              </p>
            )}

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {playlists.map((pl) => {
                const isAdded = addedMap[pl.id] || pl.songs.some((s) => s.videoId === songToAddToPlaylist?.videoId);
                return (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => handleAdd(pl.id)}
                    className="w-full p-2.5 rounded-xl liquid-glass hover:bg-white/10 flex items-center justify-between transition-all group text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ListMusic className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-white truncate block">{pl.name}</span>
                        <span className="text-[10px] text-white/40 block font-mono">
                          {pl.songs.length} songs
                        </span>
                      </div>
                    </div>

                    {isAdded ? (
                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Added
                      </span>
                    ) : (
                      <span className="text-xs text-white/60 group-hover:text-white">Add +</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setPlaylistModalMode('create')}
              className="w-full py-2.5 rounded-2xl liquid-glass hover:bg-white/10 border border-white/10 text-xs font-medium text-purple-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Playlist</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
