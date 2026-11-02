import React, { useState } from 'react';
import { Music2, Copy, Check, LogOut, ListPlus } from 'lucide-react';

export default function Navbar({ room, onLeaveRoom, onCopyInvite, onOpenImport }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyInvite();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Room Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Music2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-base tracking-tight leading-none">
                MusicRoom
              </h1>
              {room && (
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/40">
                  {room.mood || 'Music'}
                </span>
              )}
            </div>
            {room && (
              <p className="text-xs text-zinc-400 truncate max-w-[180px] sm:max-w-xs mt-0.5 font-medium">
                {room.name}
              </p>
            )}
          </div>
        </div>

        {/* Right Actions */}
        {room && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Import Playlist Button */}
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-xs font-semibold text-purple-300 transition-all active:scale-95 shadow-sm"
              title="Import YouTube or Spotify Playlist"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import Playlist</span>
              <span className="sm:hidden">Import</span>
            </button>

            {/* Copy Invite Link */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-semibold text-zinc-200 transition-all active:scale-95 shadow-sm"
              title="Copy shareable link for friends"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Invite Friends</span>
                  <span className="sm:hidden">Invite</span>
                </>
              )}
            </button>

            {/* Leave Room Button */}
            <button
              onClick={onLeaveRoom}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-colors"
              title="Leave Room"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </header>
  );
}

