import React from 'react';
import { Volume2, Headphones, Crown, Sparkles, Activity } from 'lucide-react';

export default function MemberList({ members = [], currentSocketId }) {
  return (
    <div className="flex flex-col rounded-2xl bg-surface-container-low border border-white/5 p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
          <h3 className="font-title-md text-sm font-bold text-on-surface">
            Party Room ({members.length}/20)
          </h3>
        </div>
        <span className="text-[10px] text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full font-bold border border-secondary/20">
          HQ 320kbps
        </span>
      </div>

      {/* Member Cards */}
      <div className="flex flex-col space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {members.map((member, idx) => {
          const isYou = member.id === currentSocketId;
          const isHost = member.isHost;

          return (
            <div
              key={member.id || idx}
              className={`flex items-center justify-between p-3 rounded-xl transition-all border ${
                isYou
                  ? 'bg-surface-container-high/90 border-primary/30 shadow-sm'
                  : 'bg-surface-container/80 border-white/5 hover:bg-surface-container-high/60'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                      isHost
                        ? 'bg-primary text-on-primary ring-2 ring-primary/40'
                        : 'bg-surface-container-highest text-secondary ring-1 ring-white/10'
                    }`}
                  >
                    {member.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  {/* Status Dot */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary border-2 border-surface shadow-[0_0_8px_rgba(78,222,163,0.8)]"></span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-on-surface truncate">
                      {member.name}
                    </span>
                    {isYou && (
                      <span className="text-[10px] text-primary-fixed font-semibold">
                        (You)
                      </span>
                    )}
                    {isHost && (
                      <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-on-primary-container text-[9px] font-bold flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> HOST
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    {isHost ? 'Synced • Master Output' : 'Synced • 24ms delay'}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 text-on-surface-variant ml-2">
                {isHost ? (
                  <Volume2 className="w-4 h-4 text-primary" />
                ) : (
                  <Headphones className="w-4 h-4 text-outline" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
