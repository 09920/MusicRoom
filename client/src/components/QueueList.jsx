import React from 'react';
import { ListMusic, Play, Trash2, Plus, Music, Radio } from 'lucide-react';

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
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            Up Next & Queue
          </h3>
          <span className="text-xs bg-purple-950/70 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-800/40">
            {queue.length} {queue.length === 1 ? 'song' : 'songs'}
          </span>
        </div>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Import Playlist
        </button>
      </div>

      {/* Queue items list or Auto Mode Banner */}
      {queue.length === 0 ? (
        <div className="text-center py-7 px-4 border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-950/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 text-purple-400 mx-auto flex items-center justify-center">
            {autoMode ? (
              <Radio className="w-6 h-6 animate-pulse" />
            ) : (
              <Music className="w-6 h-6 text-zinc-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">
              {autoMode ? `📻 Auto Mode (Radio) Active` : 'Queue is empty'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
              {autoMode
                ? `When the current track ends or you click Skip, the room will automatically pick continuous ${language} music!`
                : 'Import a playlist or use search to queue up songs for the room.'}
            </p>
          </div>

          <div className="pt-1 flex items-center justify-center gap-2">
            <button
              onClick={onOpenImport}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
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
              className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 text-xs transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span className="text-zinc-500 font-mono text-xs w-4 text-center shrink-0">
                  {index + 1}
                </span>

                {/* Song Thumbnail */}
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black">
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

                {/* Song Meta */}
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-200 truncate group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {item.channelTitle || 'YouTube'} {item.addedBy ? `• Added by ${item.addedBy}` : ''}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              {canControl && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onPlayItem(item.queueId)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-purple-400 hover:bg-purple-950/40 transition-colors"
                    title="Play now"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveItem(item.queueId)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
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

