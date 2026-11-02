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
    <header className="sticky top-3 z-50 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <div className="liquid-glass rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-2xl">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center font-heading italic text-white text-xl">
            m
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading italic text-lg sm:text-xl text-white tracking-tight leading-none">
                MusicRoom
              </span>
              {room && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full liquid-glass text-white/80">
                  {room.mood || 'Hindi'}
                </span>
              )}
            </div>
            {room && (
              <p className="text-[11px] text-white/50 truncate max-w-[150px] sm:max-w-xs font-light font-body">
                {room.name}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        {room ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Import Playlist: High contrast primary pill */}
            <button
              onClick={onOpenImport}
              className="px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-white/10"
              title="Import YouTube or Spotify Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import Playlist</span>
              <span className="sm:hidden">Import</span>
            </button>

            {/* Invite Friends: Liquid glass pill */}
            <button
              onClick={handleCopy}
              className="liquid-glass px-3.5 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
              title="Copy shareable invite link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white/70" />
                  <span className="hidden sm:inline">Invite Friends</span>
                  <span className="sm:hidden">Invite</span>
                </>
              )}
            </button>

            {/* Leave Room: Subtle round button */}
            <button
              onClick={onLeaveRoom}
              className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-rose-400 transition-colors"
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5" />
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
