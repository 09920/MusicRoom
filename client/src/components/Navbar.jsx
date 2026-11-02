import React, { useState } from 'react';
import { Copy, Check, LogOut, Plus, Music2, ArrowUpRight } from 'lucide-react';

export default function Navbar({ room, onLeaveRoom, onCopyInvite, onOpenImport }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyInvite();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-3 z-50 px-2.5 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="liquid-glass rounded-full px-3.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 shadow-2xl">
        
        {/* Brand Logo & Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full liquid-glass flex items-center justify-center font-heading italic text-white text-base sm:text-xl shrink-0">
            m
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading italic text-base sm:text-xl text-white tracking-tight leading-none truncate">
                MusicRoom
              </span>
              {room && (
                <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full liquid-glass text-white/80">
                  {room.mood || 'Hindi'}
                </span>
              )}
            </div>
            {room && (
              <p className="text-[10px] sm:text-[11px] text-white/50 truncate max-w-[100px] sm:max-w-xs font-light font-body">
                {room.name}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions: Compact on mobile, expanded on desktop */}
        {room ? (
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Import Playlist: Primary Pill */}
            <button
              onClick={onOpenImport}
              className="w-9 h-9 sm:w-auto px-0 sm:px-3.5 py-0 sm:py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-white/10 shrink-0"
              title="Import YouTube or Spotify Playlist"
              aria-label="Import Playlist"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Import Playlist</span>
            </button>

            {/* Invite Friends: Liquid glass pill */}
            <button
              onClick={handleCopy}
              className="w-9 h-9 sm:w-auto px-0 sm:px-3.5 py-0 sm:py-1.5 rounded-full liquid-glass text-xs font-medium text-white/90 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
              title="Copy shareable invite link"
              aria-label="Invite Friends"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white/80" />
                  <span className="hidden sm:inline">Invite</span>
                </>
              )}
            </button>

            {/* Leave Room: Prominent & safe exit button */}
            <button
              onClick={onLeaveRoom}
              className="w-9 h-9 rounded-full liquid-glass border border-rose-500/30 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors active:scale-95 shrink-0"
              title="Exit Room"
              aria-label="Exit Room"
            >
              <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-white/60 font-body">
            Listen in sync with friends
          </div>
        )}

      </div>
    </header>
  );
}
