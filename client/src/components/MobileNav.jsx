import React from 'react';
import { Home, Search, Library, Users } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export function MobileTopBar() {
  const {
    activeTab,
    setActiveTab,
    activeRoom,
    roomMembers,
    setIsPartyModalOpen
  } = usePlayer();

  return (
    <header className="sticky top-0 z-30 px-4 py-3 bg-[#0a0b0e]/90 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between">
      {/* Brand: Bold clean modern sans-serif */}
      <div 
        onClick={() => setActiveTab('discover')}
        className="cursor-pointer active:scale-98 transition-transform select-none"
      >
        <span className="text-xl font-bold tracking-tight text-white font-heading">
          MusicRoom
        </span>
      </div>

      {/* Right: [🔍] and [👥 Party] / [ABCD-1234 · 3👥] */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            activeTab === 'search'
              ? 'text-white bg-white/10'
              : 'text-white/70 hover:text-white'
          }`}
          title="Search"
          aria-label="Search songs"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsPartyModalOpen(true)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
            activeRoom
              ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40 shadow-emerald-600/20'
              : 'bg-[#181a24] hover:bg-[#202330] text-white border-white/10 shadow'
          }`}
        >
          {activeRoom ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono">{activeRoom.id}</span>
              <span className="text-[10px] text-emerald-300 font-mono">· {roomMembers.length}👥</span>
            </>
          ) : (
            <>
              <Users className="w-3.5 h-3.5 text-white/80" />
              <span>Party</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

export function MobileBottomTabBar() {
  const { activeTab, setActiveTab } = usePlayer();

  const tabs = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0a0b0e]/95 backdrop-blur-2xl border-t border-white/[0.06] px-8 py-2 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all active:scale-90 ${
              isActive
                ? 'text-[#9d8df1]'
                : 'text-[#6f7486] hover:text-white/80'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#9d8df1] stroke-[2.2]' : 'text-[#6f7486] stroke-[1.8]'}`} />
            <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'font-semibold text-[#9d8df1]' : 'text-[#6f7486]'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
