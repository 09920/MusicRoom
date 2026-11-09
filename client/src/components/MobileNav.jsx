import React from 'react';
import { Compass, Search, Library, Users, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-30 px-3.5 py-2.5 liquid-glass-strong border-b border-white/10 flex items-center justify-between shadow-lg">
      {/* Brand */}
      <div 
        onClick={() => setActiveTab('discover')}
        className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-heading italic text-white text-sm shadow">
          m
        </div>
        <span className="font-heading italic text-lg text-white tracking-tight">
          MusicRoom
        </span>
      </div>

      {/* Right: [🔍] and [🎉 Party] / [ABCD-1234 · 3👥] */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            activeTab === 'search'
              ? 'bg-purple-600 text-white'
              : 'liquid-glass text-white/70 hover:text-white'
          }`}
          title="Search"
          aria-label="Search songs"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setIsPartyModalOpen(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-md border ${
            activeRoom
              ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40 shadow-emerald-600/20'
              : 'bg-purple-600/30 text-purple-200 border-purple-500/40 hover:bg-purple-600/40'
          }`}
        >
          {activeRoom ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono">{activeRoom.id}</span>
              <span className="text-[10px] text-emerald-400 font-mono">· {roomMembers.length}👥</span>
            </>
          ) : (
            <>
              <span>🎉 Party</span>
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
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 liquid-glass-strong border-t border-white/10 px-6 py-2 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all active:scale-90 ${
              isActive
                ? 'text-purple-300 font-semibold'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-white/50'}`} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
