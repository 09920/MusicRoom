import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  Radio, 
  Play, 
  Plus, 
  Wand2, 
  Share2, 
  Volume2, 
  Flame, 
  Headphones
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import GenerativeVisualizer from './GenerativeVisualizer';

/**
 * BannerHero Component
 * Implements the banner-design and generative_ui guidelines:
 * - 3-Zone visual hierarchy (Badge -> Headline/Hook -> High contrast CTAs)
 * - Safe zones with responsive padding
 * - Glassmorphic depth with subtle neon edge glow
 * - Embedded generative soundwave visualizer
 * - Switchable Art Direction themes (Cyber Neon, Midnight Lounge, Synthwave Sunset)
 */
export default function BannerHero({ onOpenAiTheme }) {
  const { 
    playback, 
    activeRoom, 
    roomMembers, 
    setIsPartyModalOpen, 
    setIsImportModalOpen,
    setActiveTab
  } = usePlayer();

  const [styleMode, setStyleMode] = useState('cyber'); // 'cyber' | 'midnight' | 'sunset'

  // Art direction themes from banner-design skill
  const styles = {
    cyber: {
      bg: 'from-violet-950/80 via-purple-900/40 to-slate-950/90',
      border: 'border-violet-500/30',
      glow: 'shadow-glow-purple',
      badgeBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      accentText: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-emerald-300',
      ctaBg: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/30',
      visColor: 'purple'
    },
    midnight: {
      bg: 'from-slate-950/90 via-indigo-950/50 to-blue-950/80',
      border: 'border-cyan-500/30',
      glow: 'shadow-glow-cyan',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      accentText: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300',
      ctaBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/30',
      visColor: 'cyan'
    },
    sunset: {
      bg: 'from-rose-950/80 via-pink-900/40 to-amber-950/80',
      border: 'border-rose-500/30',
      glow: 'shadow-glow-rose',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      accentText: 'text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-orange-300 to-amber-300',
      ctaBg: 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white shadow-lg shadow-rose-600/30',
      visColor: 'rose'
    }
  };

  const currentTheme = styles[styleMode] || styles.cyber;

  return (
    <div className={`relative overflow-hidden rounded-3xl border ${currentTheme.border} bg-gradient-to-br ${currentTheme.bg} p-5 sm:p-7 md:p-8 backdrop-blur-2xl transition-all duration-500 ${currentTheme.glow}`}>
      
      {/* Ambient background blur elements */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      <div className="relative z-10 flex flex-col justify-between gap-5">
        
        {/* TOP ZONE: Status Badge & Art Direction Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {activeRoom ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono uppercase font-bold tracking-wider">ROOM: {activeRoom.id}</span>
                <span className="text-emerald-400/80">({roomMembers.length} sync)</span>
              </div>
            ) : (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${currentTheme.badgeBg}`}>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="tracking-wide">REAL-TIME SYNCED AUDIO</span>
              </div>
            )}

            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-white/70">
              <Headphones className="w-3 h-3 text-purple-400" />
              <span>Lossless Sync</span>
            </div>
          </div>

          {/* Banner Art Direction Switcher pills */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 backdrop-blur-md">
            {[
              { id: 'cyber', label: '⚡ Cyber' },
              { id: 'midnight', label: '🌌 Midnight' },
              { id: 'sunset', label: '🌅 Sunset' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setStyleMode(m.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  styleMode === m.id
                    ? 'bg-white/20 text-white font-semibold shadow'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* MIDDLE ZONE: Headline & Value Proposition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-8 space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-heading leading-tight">
              Listen to Music in Sync{' '}
              <span className={currentTheme.accentText}>With Friends.</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl font-normal leading-relaxed">
              Create an instant private room, share the invite link, and vibe to synchronized YouTube tracks with live in-room chat and zero audio drift.
            </p>
          </div>

          {/* Generative Visualizer preview card */}
          <div className="lg:col-span-4 bg-black/30 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-white/60 mb-2">
              <span className="flex items-center gap-1.5 font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${playback.isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-white/30'}`} />
                {playback.isPlaying ? 'AUDIO ACTIVE' : 'IDLE VIBE'}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-purple-300">
                WAVE GENERATOR
              </span>
            </div>

            <GenerativeVisualizer
              isPlaying={playback.isPlaying}
              color={currentTheme.visColor}
              height={36}
              barCount={22}
              mode="bars"
            />
          </div>
        </div>

        {/* BOTTOM ZONE: Action Buttons (CTA) */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {activeRoom ? (
            <button
              type="button"
              onClick={() => setIsPartyModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Manage Party ({roomMembers.length} In Room)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPartyModalOpen(true)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 active:scale-95 transition-all ${currentTheme.ctaBg}`}
            >
              <Users className="w-4 h-4" />
              <span>Start Jam Party</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center gap-2 active:scale-95 transition-all backdrop-blur-md"
          >
            <Plus className="w-4 h-4 text-purple-300" />
            <span>Import Playlist</span>
          </button>

          {onOpenAiTheme && (
            <button
              type="button"
              onClick={onOpenAiTheme}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-fuchsia-600/30 to-violet-600/30 hover:from-fuchsia-600/40 hover:to-violet-600/40 text-fuchsia-200 border border-fuchsia-400/30 flex items-center gap-2 active:scale-95 transition-all backdrop-blur-md"
              title="Generate custom ambient room art with Stable Diffusion AI"
            >
              <Wand2 className="w-4 h-4 text-fuchsia-300" />
              <span className="hidden sm:inline">AI Room Visualizer</span>
              <span className="sm:hidden">AI Art</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

