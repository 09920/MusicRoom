import React from 'react';
import { Users, Crown, User } from 'lucide-react';

export default function MemberList({ members, currentSocketId }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Listening Together</h3>
        </div>
        <span className="text-xs bg-purple-950/70 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-800/40">
          {members.length} {members.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
        {members.map((member) => {
          const isYou = member.id === currentSocketId;
          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                isYou
                  ? 'bg-purple-900/20 border border-purple-500/30 text-white'
                  : 'bg-zinc-800/40 border border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  member.isHost 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-zinc-700/60 text-zinc-300'
                }`}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate font-medium">
                  <span>{member.name}</span>
                  {isYou && <span className="ml-1 text-purple-400 font-semibold">(You)</span>}
                </div>
              </div>

              {member.isHost && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-700/40">
                  <Crown className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Host
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

