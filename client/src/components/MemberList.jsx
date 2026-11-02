import React from 'react';
import { Users, Crown } from 'lucide-react';

export default function MemberList({ members, currentSocketId }) {
  return (
    <div className="liquid-glass rounded-3xl p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white/70" />
          <h3 className="font-heading italic text-lg text-white">Listeners</h3>
        </div>
        <span className="text-[11px] liquid-glass text-white/80 font-medium px-2.5 py-0.5 rounded-full">
          {members.length} {members.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
        {members.map((member) => {
          const isYou = member.id === currentSocketId;
          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl text-xs transition-colors ${
                isYou
                  ? 'liquid-glass bg-white/10 ring-1 ring-white/30 text-white'
                  : 'liquid-glass text-white/80'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center font-heading italic text-sm text-white shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate font-body font-medium">
                  <span>{member.name}</span>
                  {isYou && <span className="ml-1.5 text-white/50 text-[11px]">(You)</span>}
                </div>
              </div>

              {member.isHost && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300 liquid-glass px-2.5 py-0.5 rounded-full">
                  <Crown className="w-3 h-3 fill-amber-300 text-amber-300" />
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
