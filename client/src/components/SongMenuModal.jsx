import React from 'react';
import { 
  Play, 
  ListPlus, 
  Heart, 
  FolderPlus, 
  Share2, 
  ExternalLink, 
  X, 
  Check 
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function SongMenuModal() {
  const {
    menuSong,
    closeSongMenu,
    playSong,
    playNext,
    addToQueue,
    isLiked,
    toggleLike,
    openAddToPlaylistModal
  } = usePlayer();

  if (!menuSong) return null;

  const liked = isLiked(menuSong.videoId);

  return (
    <div
      onClick={closeSongMenu}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl liquid-glass-strong border border-white/10 p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200"
      >
        {/* Header: Track preview */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <img
            src={menuSong.thumbnail || `https://i.ytimg.com/vi/${menuSong.videoId}/hqdefault.jpg`}
            alt={menuSong.title}
            className="w-12 h-12 rounded-xl object-cover shadow bg-black/60 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate font-body">
              {menuSong.title}
            </h4>
            <p className="text-xs text-white/50 truncate font-light mt-0.5">
              {menuSong.channelTitle || 'YouTube Music'}
            </p>
          </div>
          <button
            type="button"
            onClick={closeSongMenu}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Options: Play next · Add to queue · Add to playlist · Like */}
        <div className="space-y-1">
          {/* Play Now */}
          <button
            type="button"
            onClick={() => {
              playSong(menuSong, true);
              closeSongMenu();
            }}
            className="w-full p-3 rounded-2xl hover:bg-white/10 text-left flex items-center gap-3 text-sm text-white transition-all active:scale-98 group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-white text-white group-hover:text-black flex items-center justify-center transition-colors">
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            </div>
            <span className="font-medium">Play Now</span>
          </button>

          {/* Play Next */}
          <button
            type="button"
            onClick={() => {
              playNext(menuSong);
              closeSongMenu();
            }}
            className="w-full p-3 rounded-2xl hover:bg-white/10 text-left flex items-center gap-3 text-sm text-white transition-all active:scale-98 group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center">
              <ListPlus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium block">Play Next</span>
              <span className="text-[11px] text-white/40 block font-light">Play right after current song</span>
            </div>
          </button>

          {/* Add to Queue */}
          <button
            type="button"
            onClick={() => {
              addToQueue(menuSong);
              closeSongMenu();
            }}
            className="w-full p-3 rounded-2xl hover:bg-white/10 text-left flex items-center gap-3 text-sm text-white transition-all active:scale-98 group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-300 flex items-center justify-center">
              <ListPlus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium block">Add to Queue</span>
              <span className="text-[11px] text-white/40 block font-light">Add to end of playing queue</span>
            </div>
          </button>

          {/* Add to Playlist */}
          <button
            type="button"
            onClick={() => {
              closeSongMenu();
              openAddToPlaylistModal(menuSong);
            }}
            className="w-full p-3 rounded-2xl hover:bg-white/10 text-left flex items-center gap-3 text-sm text-white transition-all active:scale-98 group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium block">Add to Playlist</span>
              <span className="text-[11px] text-white/40 block font-light">Save to your custom playlists</span>
            </div>
          </button>

          {/* Like / Unlike */}
          <button
            type="button"
            onClick={() => {
              toggleLike(menuSong);
              closeSongMenu();
            }}
            className="w-full p-3 rounded-2xl hover:bg-white/10 text-left flex items-center gap-3 text-sm text-white transition-all active:scale-98 group"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              liked ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-white/60'
            }`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </div>
            <span className="font-medium">{liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}</span>
          </button>

          {/* Open on YouTube */}
          <a
            href={`https://www.youtube.com/watch?v=${menuSong.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeSongMenu}
            className="w-full p-3 rounded-2xl hover:bg-white/10 text-left flex items-center gap-3 text-sm text-white/70 hover:text-white transition-all active:scale-98 group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 text-white/40 flex items-center justify-center">
              <ExternalLink className="w-4 h-4" />
            </div>
            <span className="font-medium">Open on YouTube</span>
          </a>
        </div>
      </div>
    </div>
  );
}

