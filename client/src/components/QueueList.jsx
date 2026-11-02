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
    <div className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <h3 className="font-heading italic text-lg sm:text-xl text-white">
            Up Next & Queue
          </h3>
          <span className="text-[11px] liquid-glass text-white/80 font-medium px-2.5 py-0.5 rounded-full">
            {queue.length} {queue.length === 1 ? 'song' : 'songs'}
          </span>
        </div>

        <button
          onClick={onOpenImport}
          className="liquid-glass px-3 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Import Playlist</span>
        </button>
      </div>

      {/* Queue items or Auto Mode Empty State */}
      {queue.length === 0 ? (
        <div className="text-center py-7 px-4 rounded-2xl liquid-glass bg-white/[0.01] space-y-3">
          <div className="w-12 h-12 rounded-full liquid-glass text-white mx-auto flex items-center justify-center font-heading italic text-2xl">
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
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {queue.map((item, index) => (
            <div
              key={item.queueId || index}
              className="flex items-center justify-between p-2 sm:p-2.5 rounded-2xl liquid-glass hover:bg-white/5 text-xs transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span className="text-white/40 font-mono text-[11px] w-4 text-center shrink-0">
                  {index + 1}
                </span>

                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-black">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {canControl && (
                    <button
                      onClick={() => onPlayItem(item.queueId)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      title="Play this song now"
                    >
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-white/95 truncate group-hover:text-white transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-white/50 truncate mt-0.5 font-body font-light">
                    {item.channelTitle || 'YouTube'} {item.addedBy ? `• Added by ${item.addedBy}` : ''}
                  </p>
                </div>
              </div>

              {canControl && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onPlayItem(item.queueId)}
                    className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    title="Play now"
                  >
                    <Play className="w-3 h-3 fill-current translate-x-0.5" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.queueId)}
                    className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-white/40 hover:text-rose-400 transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3 h-3" />
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
