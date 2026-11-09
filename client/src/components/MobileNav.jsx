import React from 'react';
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
    <header className="sticky top-0 z-30 px-4 py-3 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high flex items-center justify-between select-none">
      {/* Brand */}
      <div 
        onClick={() => setActiveTab('discover')}
        className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
      >
        <img
          alt="MusicRoom Brand Mark"
          className="h-7 w-auto object-contain"
          src="https://lh3.googleusercontent.com/aida/ALJJyrBOkg2RAx8dgowYF5zHZZ2e5aYwPREUsOUawFJlwR7Rt3x95vsabcN1lAzcarKZWgPGIQ1fpHcfi5H-6uAF0niJe2Skch_9yiGnmulyJS_rt8a9RAe-_zRprOlra9AWWFC-VPITVQXvE42EXKTBz14gFfkBhLUjToMJ32DhfDfStFc-ngsHLucBEwMfwE01y7MhUOC_3nlAfqe28xOxFYzZ6MJOqTp3X27z-pmgQKU"
        />
        <span className="text-lg font-headline font-bold tracking-tight text-on-surface">
          MusicRoom
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            activeTab === 'search'
              ? 'text-primary bg-surface-container-high'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          title="Search"
        >
          <span className="material-symbols-outlined text-title-md">search</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPartyModalOpen(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
            activeRoom
              ? 'bg-secondary/20 text-secondary border-secondary/40 shadow-glow-emerald'
              : 'bg-surface-container-high text-on-surface border-surface-container-highest'
          }`}
        >
          {activeRoom ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              <span className="font-metric-mono font-bold">#{activeRoom.id}</span>
              <span className="text-[10px] text-secondary font-mono">({roomMembers.length})</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-title-sm text-secondary">podcasts</span>
              <span className="font-title">Aux Room</span>
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
    { id: 'discover', label: 'Discover', icon: 'explore' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'library', label: 'Library', icon: 'library_music' }
  ];

  return (
    <nav className="bg-surface-container-lowest/95 backdrop-blur-2xl border-t border-surface-container-high/60 px-4 py-2 flex items-center justify-around select-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
              isActive
                ? 'text-primary font-bold'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <span 
              className="material-symbols-outlined text-title-md" 
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </span>
            <span className="text-[11px] font-title">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
