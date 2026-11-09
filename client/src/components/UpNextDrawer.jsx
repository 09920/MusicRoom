import React, { useState } from 'react';
import { X, Play, Trash2, ListMusic, Music2, Sparkles, Check, BookmarkPlus } from 'lucide-react';
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
    playback,
    queue,
    playingFrom,
    playSong,
    removeFromQueue,
    clearQueue,
    radioMode,
    toggleRadio,
    createPlaylist,
    addSongToPlaylist
  } = usePlayer();

  const [activeTab, setActiveTab] = useState('upnext'); // 'upnext' | 'lyrics'
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0a0b12]/95 border-l border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col select-none animate-in slide-in-from-right duration-300">
      
      {/* 1. Header (YouTube Music Tabs: UP NEXT | LYRICS) */}
      <div className="pt-4 px-5 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('upnext')}
              className={`text-sm font-bold tracking-wider uppercase transition-all pb-1 relative ${
                activeTab === 'upnext' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span>UP NEXT</span>
              {activeTab === 'upnext' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lyrics')}
              className={`text-sm font-bold tracking-wider uppercase transition-all pb-1 relative ${
                activeTab === 'lyrics' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <span>LYRICS</span>
              {activeTab === 'lyrics' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {activeTab === 'upnext' ? (
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Subheader: Playing from [Playlist Name] */}
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-white/[0.02]">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">
                Playing from
              </span>
              <h4 className="text-sm font-bold text-white font-heading truncate">
                {playingFrom?.name || 'Up Next Queue'}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveQueue}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border flex items-center gap-1 transition-all active:scale-95 ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                }`}
                title="Save queue to library"
              >
                {isSaved ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3 h-3 text-violet-300" />
                    <span>Save</span>
                  </>
                )}
              </button>

              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={clearQueue}
                  className="px-2.5 py-1 rounded-full text-[11px] font-mono text-white/40 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-colors shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List Content: [Now Playing] + [Upcoming Tracks] */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar">
            
            {/* Now Playing Active Track */}
            {currentSong && (
              <div className="p-2 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-between gap-3 shadow-md mb-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-5 text-center shrink-0">
                    {playback.isPlaying ? (
                      <span className="flex items-center justify-center gap-0.5">
                        <span className="w-0.5 h-3 bg-violet-400 rounded-full animate-eq-1" />
                        <span className="w-0.5 h-4 bg-violet-400 rounded-full animate-eq-2" />
                        <span className="w-0.5 h-2 bg-violet-400 rounded-full animate-eq-3" />
                      </span>
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-white text-white mx-auto" />
                    )}
                  </div>

                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black shadow border border-white/10">
                    <img
                      src={currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`}
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-white truncate leading-tight">
                      {currentSong.title}
                    </h5>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      {currentSong.channelTitle || 'Artist'}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-white/40 shrink-0">
                  {formatDuration(playback.duration)}
                </span>
              </div>
            )}

            {/* Upcoming Tracks Header */}
            <div className="px-2 pt-2 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                Up Next ({queue.length})
              </span>
              {radioMode && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Radio Autoplay ON
                </span>
              )}
            </div>

            {/* Upcoming Tracks */}
            {queue.length === 0 ? (
              <div className="py-14 text-center text-white/40 px-4">
                <ListMusic className="w-10 h-10 mx-auto mb-2 text-white/20" />
                <p className="text-xs font-medium text-white/70">End of queue</p>
                <p className="text-[11px] text-white/40 mt-1">
                  Play any playlist, album, or song from Discover to fill Up Next!
                </p>
              </div>
            ) : (
              queue.map((song, idx) => (
                <div
                  key={`upnext-${song.videoId}-${idx}`}
                  onClick={() => {
                    playSong(song, true);
                    removeFromQueue(idx);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-black/60 shadow border border-white/5">
                      <img
                        src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-3.5 h-3.5 fill-white text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-semibold text-white/90 group-hover:text-violet-300 truncate leading-tight">
                        {song.title}
                      </h5>
                      <p className="text-[10px] text-white/50 truncate mt-0.5">
                        {song.channelTitle || 'Artist'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-white/40">
                      {formatDuration(song.duration)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(idx);
                      }}
                      className="text-white/20 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>

        </div>
      ) : (
        /* Lyrics Tab in Drawer */
        <div className="flex-1 p-6 text-center overflow-y-auto no-scrollbar flex flex-col items-center justify-center">
          <Music2 className="w-10 h-10 text-white/20 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Synchronized Lyrics</h4>
          <p className="text-xs text-white/50 max-w-xs">
            Open the Full Screen Player to see live synchronized karaoke lyrics line-by-line!
          </p>
        </div>
      )}

    </div>
  );
}
