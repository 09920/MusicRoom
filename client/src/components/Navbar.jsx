import React, { useState } from 'react';
import { Copy, Check, LogOut, History, Download } from 'lucide-react';

export default function Navbar({ 
  room, 
  onLeaveRoom, 
  onCopyInvite, 
  onToggleHistory,
  isHistoryOpen = false,
  historyCount = 0 
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopyInvite) onCopyInvite();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 w-full z-50 pt-safe bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)] border-b border-outline-variant/20 mb-4">
      <div className="h-16 px-gutter-sm flex items-center justify-between gap-space-sm max-w-7xl mx-auto w-full">
        
        {/* Brand Logo & Info */}
        <div className="flex items-center gap-space-sm min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(208,188,255,0.3)] shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              speaker_group
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-title-md text-title-md text-on-surface font-bold tracking-tight truncate">
                SyncVibe
              </span>
              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-1 shadow-[0_0_8px_rgba(76,215,246,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                SYNCED
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
              {room?.name || 'Live Room'}
            </span>
          </div>
        </div>

        {/* Room Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-space-sm shrink-0">
          
          {/* Room ID Copy Pill */}
          {room?.id && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-surface-container-high/80 hover:bg-surface-container-highest px-2.5 py-1.5 rounded-full text-xs transition-colors border border-outline-variant/20 active:scale-95"
              title="Copy Room Link"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">tag</span>
              <span className="font-label-sm text-label-sm text-on-surface font-mono font-semibold tracking-wider">
                {room.id.slice(0, 9)}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-tertiary" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-on-surface-variant hover:text-secondary" />
              )}
            </button>
          )}

          {/* Real-time drift badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary shadow-[0_0_10px_rgba(78,222,163,0.25)] border border-tertiary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
            <span className="font-label-sm text-label-sm uppercase tracking-wide">12ms drift</span>
          </div>

          {/* Session History */}
          {onToggleHistory && (
            <button
              onClick={onToggleHistory}
              className={`p-2 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center justify-center border border-outline-variant/20 ${
                isHistoryOpen
                  ? 'bg-primary-container/20 text-primary border-primary/40'
                  : 'bg-surface-container-high/60 text-on-surface-variant hover:text-on-surface'
              }`}
              title="Session History"
            >
              <History className="w-4 h-4" />
            </button>
          )}

          {/* Leave Session Button */}
          <button
            onClick={onLeaveRoom}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-error-container/20 text-error hover:bg-error-container/30 transition-all font-label-sm text-label-sm border border-error/25 active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">logout</span>
            <span className="hidden sm:inline">Leave</span>
          </button>

        </div>

      </div>
    </header>
  );
}
