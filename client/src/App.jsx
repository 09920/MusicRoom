import React, { useState, useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { MobileTopBar, MobileBottomTabBar } from './components/MobileNav';
import { DesktopLeftSidebar, DesktopRightSidebar, DesktopPlayerBar } from './components/DesktopNav';
import DiscoverView from './components/DiscoverView';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import MiniPlayer from './components/MiniPlayer';
import FullScreenPlayer from './components/FullScreenPlayer';
import SongMenuModal from './components/SongMenuModal';
import PlaylistModal from './components/PlaylistModal';
import PartyModal from './components/PartyModal';
import ChatDrawer from './components/ChatDrawer';
import ImportPlaylistModal from './components/ImportPlaylistModal';
import Player from './components/Player';
import Toast from './components/Toast';
import FadingVideo from './components/FadingVideo';
import { Search, Users, Download } from 'lucide-react';

function MainLayout() {
  const {
    activeTab,
    setActiveTab,
    currentSong,
    playback,
    setPlayback,
    isHost,
    canControl,
    nextSong,
    volume,
    isMuted,
    playerRef,
    isAudioOnly,
    isFullScreen,
    activeRoom,
    roomMembers,
    setIsPartyModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    addToQueue
  } = usePlayer();

  const [toasts, setToasts] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Auto-detect ?room=XXXX from URL query to open PartyModal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setIsPartyModalOpen(true);
    }
  }, [setIsPartyModalOpen]);

  return (
    <div className="min-h-screen bg-black text-white font-body relative overflow-x-hidden select-none flex flex-col">
      
      {/* Subtle Ambient Video Background */}
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0"
      />

      {/* Persistent Headless YouTube Audio / Video Engine */}
      <div
        className={`fixed z-0 ${
          isFullScreen && !isAudioOnly
            ? 'inset-x-4 top-20 bottom-36 sm:inset-x-20 sm:top-24 sm:bottom-44 z-50 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto'
            : 'w-1 h-1 opacity-0 pointer-events-none -left-full'
        }`}
      >
        <Player
          currentSong={currentSong}
          playback={playback}
          isHost={isHost}
          canControl={canControl}
          onPlaybackChange={(updates) => setPlayback((prev) => ({ ...prev, ...updates }))}
          onSongEnd={nextSong}
          volume={volume}
          isMuted={isMuted}
          playerRefOut={playerRef}
        />
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* MOBILE LAYOUT (< 1024px)                                  */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:hidden relative z-10">
        {/* Slim Top Bar */}
        <MobileTopBar />

        {/* Scrollable Content Area */}
        <main className="flex-1 px-4 py-3 overflow-y-auto">
          {activeTab === 'discover' && <DiscoverView />}
          {activeTab === 'search' && <SearchView />}
          {activeTab === 'library' && <LibraryView />}
        </main>

        {/* Fixed Bottom Container: Floating Mini-Player + Tab Bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
          <div className="pointer-events-auto">
            <MiniPlayer />
          </div>
          <div className="pointer-events-auto">
            <MobileBottomTabBar />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* DESKTOP LAYOUT (>= 1024px Wide Screens)                    */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 h-screen relative z-10 overflow-hidden">
        
        {/* 3-Column Workstage */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <DesktopLeftSidebar />

          {/* Center Main Content Area */}
          <section className="flex-1 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
            {/* Desktop Top Header Bar */}
            <header className="px-6 py-3.5 border-b border-white/10 flex items-center justify-between gap-4 liquid-glass shrink-0">
              {/* Quick Search Input */}
              <div
                onClick={() => setActiveTab('search')}
                className="relative flex-1 max-w-md cursor-pointer"
              >
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  readOnly
                  placeholder="Search any song, artist, album..."
                  className="w-full pl-10 pr-4 py-2 rounded-full liquid-glass text-xs text-white placeholder-white/40 border border-white/10 focus:outline-none cursor-pointer hover:bg-white/10 transition-colors"
                />
              </div>

              {/* Right: Install App & Party Button */}
              <div className="flex items-center gap-2.5">
                {deferredPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="px-3.5 py-1.5 rounded-full bg-purple-600/30 text-purple-200 border border-purple-500/40 text-xs font-medium flex items-center gap-1.5 hover:bg-purple-600/50 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsPartyModalOpen(true)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg border ${
                    activeRoom
                      ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50 shadow-emerald-600/20'
                      : 'bg-purple-600 text-white hover:bg-purple-500 border-purple-500/50 shadow-purple-600/30'
                  }`}
                >
                  {activeRoom ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-mono">{activeRoom.id}</span>
                      <span className="text-[11px] text-emerald-300">· {roomMembers.length}👥</span>
                    </>
                  ) : (
                    <>
                      <span>🎉 Party Mode</span>
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Scrollable Center View */}
            <main className="flex-1 overflow-y-auto px-6 py-5">
              <div className="max-w-5xl mx-auto">
                {activeTab === 'discover' && <DiscoverView />}
                {activeTab === 'search' && <SearchView />}
                {activeTab === 'library' && <LibraryView />}
              </div>
            </main>
          </section>

          {/* Right Sidebar */}
          <DesktopRightSidebar />
        </div>

        {/* Bottom Full-Width Spotify-Style Player Bar */}
        <DesktopPlayerBar />
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* MODALS & DRAWERS                                          */}
      {/* ───────────────────────────────────────────────────────── */}
      <FullScreenPlayer />
      <SongMenuModal />
      <PlaylistModal />
      <PartyModal />
      <ChatDrawer />

      <ImportPlaylistModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count, msg, songs) => {
          if (songs && songs.length > 0) {
            songs.forEach((s) => addToQueue(s));
          }
          addToast(msg || `Imported ${count} songs to queue!`, 'success');
        }}
      />

      <Toast toasts={toasts} />

    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
}
