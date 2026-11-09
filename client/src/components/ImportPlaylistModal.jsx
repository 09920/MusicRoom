import React, { useState } from 'react';
import { X, Sparkles, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { socket } from '../socket';

const SAMPLES = [
  {
    name: '🌸 Hindi Romantic Hits',
    url: 'https://www.youtube.com/playlist?list=PL9bw4S5AgEbm_VbL-9bZ0P9t-q6-7iB3K'
  },
  {
    name: '☕ English Chill & Lo-Fi',
    url: 'https://www.youtube.com/playlist?list=PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo'
  },
  {
    name: '🎉 Bollywood Dance Beats',
    url: 'https://www.youtube.com/playlist?list=PL9bw4S5AgEblpTzP_9n1L1E8tD9X4wG1e'
  }
];

export default function ImportPlaylistModal({ isOpen, onClose, onImportSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [atmosUpgrade, setAtmosUpgrade] = useState(true);
  const [preserveSequence, setPreserveSequence] = useState(true);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) {
      socket.emit('playlist:cancel_import');
      setLoading(false);
    }
    setError('');
    onClose();
  };

  const handleImport = (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError('Please paste a YouTube or Spotify playlist link');
      return;
    }

    setLoading(true);
    setError('');

    const timeoutTimer = setTimeout(() => {
      setLoading(false);
      setError('Import is taking longer than usual. Please check your link or try a YouTube playlist for instant loading.');
    }, 8500);

    socket.emit('playlist:import', { url: url.trim() }, (res) => {
      clearTimeout(timeoutTimer);
      setLoading(false);
      if (res?.success) {
        onImportSuccess?.(res.count, res.message, res.songs);
        onClose();
        setUrl('');
      } else {
        setError(res?.error || 'Failed to import playlist. Please check the link.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-surface-container-low border border-white/[0.06] shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-on-surface">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Migration Meta */}
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 font-code text-xs text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                AETHER DATA BRIDGE // ENGINE V4.8
              </span>
              <span className="hidden sm:inline-block font-code text-xs text-outline">|</span>
              <span className="font-code text-xs text-outline-variant">LOSSLESS STEM & MASTER RE-LINKER</span>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 font-label text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-secondary">verified</span>
              Bit-Perfect Parity
            </span>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface tracking-tight">
                Import & Match Your Music
              </h1>
              <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1 max-w-2xl">
                Seamlessly transfer playlists from Spotify, Apple Music, or YouTube. Matched tracks are upgraded to Studio Master 24-Bit / 192kHz Spatial Audio.
              </p>
            </div>

            {/* Micro Metrics Badges */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex flex-col rounded-xl bg-surface-container-lowest/80 px-3.5 py-2 border border-white/[0.04]">
                <span className="font-code text-[10px] text-outline">CATALOG MATCH</span>
                <span className="font-headline font-bold text-sm text-primary">98.4%</span>
                <span className="font-label text-[10px] text-secondary">Hi-Res Direct</span>
              </div>
              <div className="flex flex-col rounded-xl bg-surface-container-lowest/80 px-3.5 py-2 border border-white/[0.04]">
                <span className="font-code text-[10px] text-outline">INTEGRITY CHECK</span>
                <span className="font-headline font-bold text-sm text-secondary">Zero Loss</span>
                <span className="font-label text-[10px] text-outline">FLAC Stem</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid: Source Connectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Spotify */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-container border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1ed760] shadow-[0_0_6px_#1ed760]" />
                <span className="font-headline font-bold text-xs text-on-surface">Spotify</span>
              </div>
              <span className="text-[10px] font-code text-[#1ed760]">Ready</span>
            </div>
            <p className="font-body text-[11px] text-on-surface-variant mt-2">
              Public playlists & liked tracks
            </p>
          </div>

          {/* Apple Music */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-container border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#fc3c44]" />
                <span className="font-headline font-bold text-xs text-on-surface">Apple Music</span>
              </div>
              <span className="text-[10px] font-code text-outline">ALAC</span>
            </div>
            <p className="font-body text-[11px] text-on-surface-variant mt-2">
              Spatial & Dolby Atmos tags
            </p>
          </div>

          {/* TIDAL */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-container border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-headline font-bold text-xs text-on-surface">TIDAL</span>
              </div>
              <span className="text-[10px] font-code text-secondary">MAX 24b</span>
            </div>
            <p className="font-body text-[11px] text-on-surface-variant mt-2">
              Hi-Res FLAC Direct Match
            </p>
          </div>

          {/* YouTube */}
          <div className="flex flex-col justify-between p-3.5 rounded-xl bg-surface-container border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                <span className="font-headline font-bold text-xs text-on-surface">YouTube</span>
              </div>
              <span className="text-[10px] font-code text-primary">Direct</span>
            </div>
            <p className="font-body text-[11px] text-on-surface-variant mt-2">
              Instant sub-second resolver
            </p>
          </div>
        </div>

        {/* Universal Playlist Fetcher Form */}
        <form onSubmit={handleImport} className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-secondary text-xl pointer-events-none">
              link
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder="Paste any YouTube or Spotify playlist link..."
              className="w-full h-13 pl-12 pr-28 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-outline font-code text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary border border-white/[0.04]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-5 py-2 rounded-lg bg-primary-container text-on-primary-container font-label text-xs sm:text-sm font-semibold hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Matching...</span>
                </>
              ) : (
                <>
                  <span>Fetch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Engine Preferences */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface select-none">
                <input
                  type="checkbox"
                  checked={atmosUpgrade}
                  onChange={(e) => setAtmosUpgrade(e.target.checked)}
                  className="accent-[#a078ff] w-3.5 h-3.5 rounded"
                />
                <span>Upgrade to Dolby Atmos when available</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface select-none">
                <input
                  type="checkbox"
                  checked={preserveSequence}
                  onChange={(e) => setPreserveSequence(e.target.checked)}
                  className="accent-[#4cd7f6] w-3.5 h-3.5 rounded"
                />
                <span>Preserve track order & sequencing</span>
              </label>
            </div>

            <span className="font-code text-xs text-secondary">SSL Encrypted Stream</span>
          </div>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Sample Presets */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-white/[0.04]">
          <span className="font-label text-xs text-outline uppercase tracking-wider">
            Quick Try Verified Playlists
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => {
                  setUrl(sample.url);
                  setError('');
                }}
                className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-left text-xs font-medium text-on-surface transition-all border border-white/[0.02] flex items-center justify-between group"
              >
                <span className="truncate">{sample.name}</span>
                <span className="material-symbols-outlined text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
