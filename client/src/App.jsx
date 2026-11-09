import React, { useState, useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { MobileTopBar, MobileBottomTabBar } from './components/MobileNav';
import { DesktopLeftSidebar, DesktopPlayerBar } from './components/DesktopNav';
import DiscoverView from './components/DiscoverView';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import PlaylistView from './components/PlaylistView';
import MiniPlayer from './components/MiniPlayer';
import FullScreenPlayer from './components/FullScreenPlayer';
import SongMenuModal from './components/SongMenuModal';
import PlaylistModal from './components/PlaylistModal';
import PartyModal from './components/PartyModal';
import ChatDrawer from './components/ChatDrawer';
import UpNextDrawer from './components/UpNextDrawer';
import ImportPlaylistModal from './components/ImportPlaylistModal';
import Player from './components/Player';
import Toast from './components/Toast';
import AiThemeModal from './components/AiThemeModal';
import { Search, Users, Download, Wand2 } from 'lucide-react';

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
    addToQueue,
    isQueueOpen,
    setIsQueueOpen
  } = usePlayer();

  const [toasts, setToasts] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAiThemeOpen, setIsAiThemeOpen] = useState(false);
  const [customBg, setCustomBg] = useState(() => {
    try {
      return localStorage.getItem('musicroom_custom_bg') || null;
    } catch {
      return null;
    }
  });

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleApplyBackground = (bgUrl) => {
    setCustomBg(bgUrl);
    try {
      localStorage.setItem('musicroom_custom_bg', bgUrl);
    } catch {}
    addToast('Ambient room theme updated!', 'success');
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
    <div className="min-h-screen bg-[#12131c] text-[#e3e1ee] font-body relative overflow-x-hidden select-none flex flex-col selection:bg-[#a078ff] selection:text-[#340080]">
      
      {/* Clean Obsidian Soundscape Ambient Background (Non-moving Stitch original) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#12131c]">
        {customBg ? (
          <>
            <img
              src={customBg}
              alt="Room Theme"
              className="w-full h-full object-cover opacity-20 filter blur-[2px] transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12131c] via-[#12131c]/70 to-[#12131c]/90" />
          </>
        ) : (
          <>
            {/* Subtle atmospheric glow aura matching Stitch Screen 1 & 8 */}
            <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-[#a078ff]/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-[#4cd7f6]/08 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-[#ff516a]/05 rounded-full blur-[150px] pointer-events-none" />
          </>
        )}
      </div>

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
        <main className="flex-1 px-4 py-3 overflow-y-auto overflow-x-hidden no-scrollbar">
          {activeTab === 'discover' && <DiscoverView onOpenAiTheme={() => setIsAiThemeOpen(true)} />}
          {activeTab === 'search' && <SearchView />}
          {activeTab === 'library' && <LibraryView />}
          {activeTab === 'playlist' && <PlaylistView />}
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
          <section className="flex-1 flex flex-col h-[calc(100vh-104px)] overflow-hidden">
            {/* Desktop Top Header Bar (Obsidian Soundscape) */}
            <header className="px-6 h-16 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-[#0d0e16]/80 backdrop-blur-xl shrink-0 z-30">
              {/* Quick Search Input with ⌘K */}
              <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div
                  onClick={() => setActiveTab('search')}
                  className="relative flex items-center w-full max-w-md cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#cbc3d7]/60 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search artists, tracks, or soundscapes..."
                    className="w-full h-10 pl-10 pr-14 rounded-full bg-[#1a1b24] text-[#e3e1ee] placeholder:text-[#958ea0] text-xs font-body focus:outline-none focus:ring-1 focus:ring-[#d0bcff] border border-white/10 cursor-pointer hover:bg-[#1e1f28] transition-colors"
                  />
                  <div className="absolute right-2.5 flex items-center px-1.5 py-0.5 rounded bg-[#282933] text-[#cbc3d7] font-mono text-[10px]">
                    ⌘K
                  </div>
                </div>

                <nav className="hidden xl:flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('discover')}
                    className={`px-3 py-1 rounded-full text-xs transition-colors font-medium ${
                      activeTab === 'discover'
                        ? 'bg-[#383843] text-white'
                        : 'text-[#cbc3d7] hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('discover')}
                    className="px-3 py-1 rounded-full text-[#cbc3d7] hover:text-white text-xs font-medium transition-colors"
                  >
                    Music
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('search')}
                    className="px-3 py-1 rounded-full text-[#cbc3d7] hover:text-white text-xs font-medium transition-colors"
                  >
                    Podcasts
                  </button>
                </nav>
              </div>

              {/* Right: Hi-Res Lossless Tag, AI Visualizer & Party Button */}
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1b24] text-[#4cd7f6] font-mono text-[11px] border border-white/[0.06]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                  <span>Hi-Res Lossless 24-bit/192kHz</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAiThemeOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-[#a078ff]/15 text-[#d0bcff] border border-[#a078ff]/30 text-xs font-medium flex items-center gap-1.5 hover:bg-[#a078ff]/25 transition-all active:scale-95"
                  title="Customize Room Art with AI"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#d0bcff]" />
                  <span>AI Visualizer</span>
                </button>

                {deferredPrompt && (
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="px-3 py-1.5 rounded-full bg-[#282933] text-[#e3e1ee] border border-white/10 text-xs font-medium flex items-center gap-1.5 hover:bg-[#383843] transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsPartyModalOpen(true)}
                  className={`px-4 py-1.5 rounded-full text-xs font-headline font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg border ${
                    activeRoom
                      ? 'bg-[#4cd7f6]/20 text-[#4cd7f6] border-[#4cd7f6]/40 shadow-[0_0_16px_rgba(76,215,246,0.25)]'
                      : 'bg-gradient-to-r from-[#a078ff] to-[#4cd7f6] text-[#090a0f] hover:scale-105 border-transparent shadow-[0_0_16px_rgba(160,120,255,0.35)]'
                  }`}
                >
                  {activeRoom ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-ping" />
                      <span className="font-mono">#{activeRoom.id}</span>
                      <span className="text-[11px] text-[#4cd7f6]/90">· {roomMembers.length}👥</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3.5 h-3.5" />
                      <span>Party Mode</span>
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Scrollable Center View */}
            <main className="flex-1 overflow-y-auto px-6 py-5">
              <div className="max-w-7xl mx-auto">
                {activeTab === 'discover' && <DiscoverView onOpenAiTheme={() => setIsAiThemeOpen(true)} />}
                {activeTab === 'search' && <SearchView />}
                {activeTab === 'library' && <LibraryView />}
                {activeTab === 'playlist' && <PlaylistView />}
              </div>
            </main>
          </section>
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
      <UpNextDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
      />
      <AiThemeModal
        isOpen={isAiThemeOpen}
        onClose={() => setIsAiThemeOpen(false)}
        onApplyBackground={handleApplyBackground}
      />

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
