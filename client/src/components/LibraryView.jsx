import React, { useState } from 'react';
import { 
  Heart, 
  ListMusic, 
  History as HistoryIcon, 
  Plus, 
  Download, 
  Play, 
  Shuffle, 
  MoreVertical, 
  Trash2, 
  Music, 
  FolderPlus 
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function LibraryView() {
  const {
    librarySubTab,
    setLibrarySubTab,
    likedSongs,
    playlists,
    history,
    playSong,
    playPlaylist,
    currentSong,
    playback,
    openSongMenu,
    setPlaylistModalMode,
    setIsImportModalOpen,
    deletePlaylist,
    removeSongFromPlaylist
  } = usePlayer();

  const [activePlaylistId, setActivePlaylistId] = useState(null);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);

  return (
    <div className="space-y-5 pb-24 sm:pb-28">
      
      {/* Sub-Tabs: [Liked Songs ❤] [Playlists] [History] */}
      <div className="flex items-center gap-2 pt-2 px-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setLibrarySubTab('liked');
            setActivePlaylistId(null);
          }}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border shrink-0 ${
            librarySubTab === 'liked' && !activePlaylistId
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow'
              : 'bg-[#161822] text-white/80 hover:text-white border-white/[0.08]'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>Liked Songs ({likedSongs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setLibrarySubTab('playlists');
            setActivePlaylistId(null);
          }}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border shrink-0 ${
            librarySubTab === 'playlists' || activePlaylistId
              ? 'bg-[#9d8df1]/20 text-[#9d8df1] border-[#9d8df1]/40 shadow'
              : 'bg-[#161822] text-white/80 hover:text-white border-white/[0.08]'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5 text-[#9d8df1]" />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setLibrarySubTab('history');
            setActivePlaylistId(null);
          }}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border shrink-0 ${
            librarySubTab === 'history' && !activePlaylistId
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow'
              : 'bg-[#161822] text-white/80 hover:text-white border-white/[0.08]'
          }`}
        >
          <HistoryIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>History ({history.length})</span>
        </button>
      </div>

      {/* Action Buttons: [＋ New playlist] [⤓ Import from Spotify/YouTube] */}
      <div className="flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={() => setPlaylistModalMode('create')}
          className="px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>

        <button
          type="button"
          onClick={() => setIsImportModalOpen(true)}
          className="px-4 py-2 rounded-full liquid-glass hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-white/10 shadow-md active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Import Playlist</span>
        </button>
      </div>

      {/* 1. Liked Songs View */}
      {librarySubTab === 'liked' && !activePlaylistId && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={likedSongs.length === 0}
                onClick={() => likedSongs.length > 0 && playPlaylist({ songs: likedSongs }, false)}
                className="px-4 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-500 text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                <span>Play All</span>
              </button>

              <button
                type="button"
                disabled={likedSongs.length === 0}
                onClick={() => likedSongs.length > 0 && playPlaylist({ songs: likedSongs }, true)}
                className="px-3.5 py-2 rounded-full liquid-glass text-xs font-medium text-white/80 hover:text-white border border-white/10 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-white/40">
              {likedSongs.length} {likedSongs.length === 1 ? 'favorite' : 'favorites'}
            </span>
          </div>

          {likedSongs.length === 0 ? (
            <div className="py-20 text-center text-white/40 flex flex-col items-center">
              <Heart className="w-12 h-12 text-rose-500/30 mb-3 animate-pulse" />
              <h4 className="font-heading italic text-lg text-white/80">No Liked Songs Yet</h4>
              <p className="text-xs text-white/40 font-light mt-1 max-w-xs">
                Tap the heart icon on any song while listening to add it to your favorites!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {likedSongs.map((song, idx) => (
                <div
                  key={`liked-${song.videoId}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#12141d] border border-white/[0.06] hover:bg-[#181a24] transition-all group"
                >
                  <div
                    onClick={() => playSong(song, true)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                  >
                    <span className="text-xs font-mono text-white/30 w-4 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 bg-black/50"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-rose-300">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-white/50 truncate font-light mt-0.5">
                        {song.channelTitle || 'YouTube'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => playSong(song, true)}
                      className="w-8 h-8 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow transition-all active:scale-90"
                      title="Play"
                    >
                      <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openSongMenu(song)}
                      className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
                      title="Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Playlists View */}
      {(librarySubTab === 'playlists' || activePlaylistId) && (
        <div className="space-y-4 pt-1">
          {activePlaylist ? (
            /* Active Playlist Details */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActivePlaylistId(null)}
                  className="text-xs font-mono text-purple-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
                >
                  ← Back to Playlists
                </button>

                <button
                  type="button"
                  onClick={() => {
                    deletePlaylist(activePlaylist.id);
                    setActivePlaylistId(null);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Playlist</span>
                </button>
              </div>

              <div>
                <h3 className="font-heading italic text-2xl text-white">{activePlaylist.name}</h3>
                <p className="text-xs text-white/50 font-body mt-0.5">
                  {activePlaylist.songs.length} {activePlaylist.songs.length === 1 ? 'song' : 'songs'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={activePlaylist.songs.length === 0}
                  onClick={() => playPlaylist(activePlaylist, false)}
                  className="px-4 py-2 rounded-full bg-purple-600 text-white hover:bg-purple-500 text-xs font-semibold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                  <span>Play All</span>
                </button>

                <button
                  type="button"
                  disabled={activePlaylist.songs.length === 0}
                  onClick={() => playPlaylist(activePlaylist, true)}
                  className="px-3.5 py-2 rounded-full liquid-glass text-xs font-medium text-white/80 hover:text-white border border-white/10 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
              </div>

              {activePlaylist.songs.length === 0 ? (
                <div className="py-16 text-center text-white/40">
                  <Music className="w-10 h-10 text-white/20 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white/60">This playlist is empty</p>
                  <p className="text-xs text-white/30 mt-0.5">Use the [⋯] menu on any song to add it here!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activePlaylist.songs.map((song, idx) => (
                    <div
                      key={`pl-song-${song.videoId}-${idx}`}
                      className="flex items-center justify-between p-2.5 rounded-2xl liquid-glass hover:bg-white/10 transition-all group border border-white/5"
                    >
                      <div
                        onClick={() => playSong(song, true)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                      >
                        <span className="text-xs font-mono text-white/30 w-4 text-right shrink-0">
                          {idx + 1}
                        </span>
                        <img
                          src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                          alt={song.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-purple-300">
                            {song.title}
                          </p>
                          <p className="text-[11px] text-white/50 truncate font-light mt-0.5">
                            {song.channelTitle || 'YouTube'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => playSong(song, true)}
                          className="w-8 h-8 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow transition-all active:scale-90"
                        >
                          <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSongFromPlaylist(activePlaylist.id, song.videoId)}
                          className="w-8 h-8 rounded-full liquid-glass text-white/40 hover:text-rose-400 flex items-center justify-center transition-all active:scale-90"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Playlists Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setActivePlaylistId(pl.id)}
                  className="rounded-2xl bg-[#12141d] border border-white/[0.06] p-3.5 hover:bg-[#181a24] transition-all shadow-xl cursor-pointer group flex flex-col justify-between h-36"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-2">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {pl.name}
                    </h4>
                    <p className="text-[11px] text-white/40 font-mono mt-0.5">
                      {pl.songs.length} {pl.songs.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. History View */}
      {librarySubTab === 'history' && !activePlaylistId && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="font-heading italic text-base text-white">Recently Played</span>
            <span className="text-[11px] font-mono text-white/40">{history.length} songs</span>
          </div>

          {history.length === 0 ? (
            <div className="py-20 text-center text-white/40">
              <HistoryIcon className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="text-sm font-medium text-white/60">No history yet</p>
              <p className="text-xs text-white/30 mt-0.5">Songs you play will automatically appear here!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((song, idx) => (
                <div
                  key={`hist-${song.videoId}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-2xl liquid-glass hover:bg-white/10 transition-all group border border-white/5"
                >
                  <div
                    onClick={() => playSong(song, true)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-2"
                  >
                    <span className="text-xs font-mono text-white/30 w-4 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-indigo-300">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-white/50 truncate font-light mt-0.5">
                        {song.channelTitle || 'YouTube'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => playSong(song, true)}
                      className="w-8 h-8 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow transition-all active:scale-90"
                    >
                      <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openSongMenu(song)}
                      className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

