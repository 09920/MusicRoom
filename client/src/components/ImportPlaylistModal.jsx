import React, { useState } from 'react';
import { X, ListMusic, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
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
    }, 7500);

    socket.emit('playlist:import', { url: url.trim() }, (res) => {
      clearTimeout(timeoutTimer);
      setLoading(false);
      if (res?.success) {
        onImportSuccess?.(res.count, res.message);
        onClose();
        setUrl('');
      } else {
        setError(res?.error || 'Failed to import playlist. Please check the link.');
      }
    });
  };

  const handleSelectSample = (sampleUrl) => {
    setUrl(sampleUrl);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="liquid-glass-strong rounded-[2rem] max-w-lg w-full p-5 sm:p-7 shadow-2xl relative">
        
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center font-heading italic text-xl text-white shrink-0">
              m
            </div>
            <div className="min-w-0">
              <h3 className="font-heading italic text-xl sm:text-2xl text-white truncate">Import Playlist</h3>
              <p className="text-xs text-white/50 font-body font-light truncate">Add tracks directly into the room's live queue</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5 font-body">
              Playlist URL (YouTube or Spotify)
            </label>
            <input
              type="text"
              placeholder="e.g. https://www.youtube.com/playlist?list=PL... or Spotify link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-full liquid-glass text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-white/40 transition-all font-body"
              autoFocus
            />
            <p className="text-[11px] text-white/40 mt-1.5 font-body font-light">
              Supports public or unlisted YouTube & Spotify playlists.
            </p>
          </div>

          {/* Preset Samples */}
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2 font-body">
              Or Try A Preset Playlist:
            </label>
            <div className="flex flex-col gap-1.5">
              {SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className={`text-left text-xs px-3.5 py-2 rounded-2xl transition-all font-body ${
                    url === sample.url
                      ? 'liquid-glass bg-white/10 ring-1 ring-white/50 text-white font-medium'
                      : 'liquid-glass text-white/70 hover:text-white'
                  }`}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-full liquid-glass text-white/70 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import to Room'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
