import React from 'react';
import { Play, Trash2, Plus, Radio, Music } from 'lucide-react';

export default function QueueList({
  queue = [],
  canControl,
  autoMode = true,
  language = 'Hindi',
  onPlayItem,
  onRemoveItem,
  onOpenImport
}) {
  return (
    <div className="rounded-3xl p-5 sm:p-6 shadow-2xl bg-zinc-950/85 backdrop-blur-2xl border border-white/10 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <h3 className="font-heading italic text-lg sm:text-xl text-white">
            Up Next & Queue
          </h3>
          <span className="text-[11px] bg-white/10 border border-white/10 text-white/90 font-medium px-2.5 py-0.5 rounded-full">
            {queue.length} {queue.length === 1 ? 'song' : 'songs'}
          </span>
        </div>

        <button
          onClick={onOpenImport}
          className="bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Import Playlist</span>
        </button>
      </div>

      {/* Queue items or Auto Mode Empty State */}
      {queue.length === 0 ? (
        <div className="text-center py-7 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 text-white mx-auto flex items-center justify-center font-heading italic text-2xl">
            {autoMode ? (
              <Radio className="w-5 h-5 animate-pulse text-white" />
            ) : (
              <Music className="w-5 h-5 text-white/40" />
            )}
          </div>
          <div>
            <p className="font-heading italic text-lg text-white">
              {autoMode ? `Auto Mode (Radio) Active` : 'Queue is empty'}
            </p>
            <p className="text-xs text-white/60 max-w-sm mx-auto mt-1 font-body font-light leading-relaxed">
              {autoMode
                ? `When the current track ends or you click Skip, the room will automatically pick continuous ${language} songs!`
                : 'Import a playlist or use search to queue up songs for the room.'}
            </p>
          </div>

          <div className="pt-1 flex items-center justify-center">
            <button
              onClick={onOpenImport}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              Import Playlist
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {queue.map((item, index) => (
            <div
              key={item.queueId || index}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/20 transition-all group shrink-0 min-h-[64px]"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2 flex-1">
                <span className="text-white/40 font-mono text-xs w-4 text-center shrink-0">
                  {index + 1}
                </span>

                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black shadow-md border border-white/10">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {canControl && (
                    <button
                      onClick={() => onPlayItem(item.queueId)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      title="Play this song now"
                    >
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </button>
                  )}
                </div>

                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => canControl && onPlayItem(item.queueId)}
                  title="Click to play now"
                >
                  <p className="font-semibold text-xs sm:text-sm text-white truncate leading-snug group-hover:text-purple-200 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-white/65 truncate mt-1 font-body font-normal flex items-center gap-1.5">
                    <span className="truncate">{item.channelTitle || 'YouTube'}</span>
                    {item.addedBy && (
                      <>
                        <span className="text-white/30">•</span>
                        <span className="text-white/50 shrink-0">Added by {item.addedBy}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {canControl && (
                <div className="flex items-center gap-1.5 shrink-0 pl-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onPlayItem(item.queueId)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white/80 hover:text-black flex items-center justify-center transition-all active:scale-90"
                    title="Play now"
                  >
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.queueId)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-300 flex items-center justify-center transition-all active:scale-90"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
