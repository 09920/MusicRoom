import React, { useState } from 'react';
import { History, Copy, Check, X, ExternalLink, Play, Disc3 } from 'lucide-react';

export default function SessionHistoryModal({ isOpen, onClose, history = [], onPlaySong, canControl }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyTracklist = () => {
    if (!history || history.length === 0) return;
    const text = history
      .map((s, idx) => `${idx + 1}. ${s.title}${s.channelTitle ? ` - ${s.channelTitle}` : ''}`)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl liquid-glass-strong border border-white/10 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-purple-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading italic text-xl text-white">Session History</h3>
              <p className="text-[11px] text-white/50 font-body">
                {history.length} songs played in this session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between py-3 shrink-0">
          <span className="text-xs text-white/60 font-body">
            All songs played during this room session
          </span>
          {history.length > 0 && (
            <button
              onClick={handleCopyTracklist}
              className="px-3 py-1.5 rounded-full liquid-glass text-xs font-medium text-white hover:bg-white/10 flex items-center gap-1.5 transition-all active:scale-95 border border-white/10"
              title="Copy tracklist to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white/70" />
                  <span>Copy Tracklist</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Tracklist List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-[200px]">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-white/40 py-12">
              <Disc3 className="w-10 h-10 text-white/20 mb-2 animate-spin-slow stroke-[1.5]" />
              <p className="font-medium text-white/60 font-body text-sm">No songs played yet</p>
              <p className="text-xs text-white/30 mt-1 font-body font-light">
                Songs will automatically appear here as they play!
              </p>
            </div>
          ) : (
            history.map((song, idx) => (
              <div
                key={`${song.videoId}-${idx}`}
                className="flex items-center justify-between p-2.5 rounded-2xl liquid-glass hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2 flex-1">
                  <span className="text-xs font-mono text-white/30 w-5 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-black relative">
                    <img
                      src={song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs text-white truncate group-hover:text-white/90">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-white/50 truncate font-body">
                      {song.channelTitle || 'YouTube'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {canControl && onPlaySong && (
                    <button
                      onClick={() => {
                        onPlaySong(song);
                        onClose();
                      }}
                      className="w-8 h-8 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center transition-all active:scale-90"
                      title="Play this song now"
                    >
                      <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                    </button>
                  )}
                  <a
                    href={`https://www.youtube.com/watch?v=${song.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-90"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
