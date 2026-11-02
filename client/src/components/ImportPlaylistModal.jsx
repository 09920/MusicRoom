import React, { useState } from 'react';
import { X, ListMusic, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { socket } from '../socket';

// Preset sample public playlists so the user can test in 1 click!
const SAMPLES = [
  {
    name: '🌸 Hindi Romantic Hits',
    url: 'https://www.youtube.com/playlist?list=PL9bw4S5AgEbm_VbL-9bZ0P9t-q6-7iB3K' // Public Hindi Romantic Playlist
  },
  {
    name: '☕ English Chill & Lo-Fi',
    url: 'https://www.youtube.com/playlist?list=PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo' // Public Chill Lo-fi Playlist
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

  const handleImport = (e) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError('Please paste a YouTube or Spotify playlist link');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit('playlist:import', { url: url.trim() }, (res) => {
      setLoading(false);
      if (res?.success) {
        onImportSuccess?.(res.count);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl shadow-purple-950/40 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Import Playlist</h3>
            <p className="text-xs text-zinc-400">Add entire playlists to the room queue</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleImport} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Paste Playlist Link (YouTube or Spotify)
            </label>
            <input
              type="text"
              placeholder="e.g. https://www.youtube.com/playlist?list=PL... or Spotify link"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
            <p className="text-[11px] text-zinc-400 mt-1.5">
              Supports public or unlisted YouTube & Spotify playlists.
            </p>
          </div>

          {/* Quick 1-Click Samples */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">
              Or Try A Preset Playlist:
            </label>
            <div className="flex flex-col gap-1.5">
              {SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className={`text-left text-xs px-3 py-2 rounded-xl border transition-all ${
                    url === sample.url
                      ? 'bg-purple-950/40 border-purple-500/60 text-purple-300 font-semibold'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
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
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing Songs...
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
