import React, { useState, useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { MobileTopBar, MobileBottomTabBar } from './components/MobileNav';
import { DesktopLeftSidebar, DesktopPlayerBar, DesktopTopHeader } from './components/DesktopNav';
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
    <div className="min-h-screen bg-surface text-on-surface font-sans relative overflow-x-hidden select-none flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Clean Obsidian Sonic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-surface">
        {customBg ? (
          <>
            <img
              src={customBg}
              alt="Room Theme"
              className="w-full h-full object-cover opacity-20 filter blur-[2px] transition-opacity duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-surface/90" />
          </>
        ) : (
          <>
            {/* Subtle atmospheric glow aura matching Stitch Screen 1 & 8 */}
            <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-secondary/05 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-tertiary/05 rounded-full blur-[150px] pointer-events-none" />
          </>
        )}
      </div>

      {/* Persistent Headless YouTube Audio / Video Engine */}
      <div
        className={
          isFullScreen && !isAudioOnly
            ? 'fixed z-50 inset-x-4 top-20 bottom-36 sm:inset-x-20 sm:top-24 sm:bottom-44 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto'
            : 'fixed bottom-0 right-0 w-[300px] h-[200px] opacity-[0.001] pointer-events-none -z-50 overflow-hidden'
        }
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
      <div className="hidden lg:flex flex-col flex-1 min-h-screen relative z-10">
        {/* Left Fixed Sidebar */}
        <DesktopLeftSidebar />

        {/* Top Fixed Header */}
        <DesktopTopHeader />

        {/* Scrollable Center View Stage */}
        <main className="pl-64 pt-16 pb-24 flex-1 bg-surface min-h-screen overflow-y-auto">
          <div className="w-full">
            {activeTab === 'discover' && <DiscoverView onOpenAiTheme={() => setIsAiThemeOpen(true)} />}
            {activeTab === 'search' && <SearchView />}
            {activeTab === 'library' && <LibraryView />}
            {activeTab === 'playlist' && <PlaylistView />}
          </div>
        </main>

        {/* Bottom Full-Width Fixed Player Bar */}
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
