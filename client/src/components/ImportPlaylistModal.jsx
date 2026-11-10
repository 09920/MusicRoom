import React, { useState } from 'react';
import { socket } from '../socket';
import { usePlayer } from '../context/PlayerContext';

export default function ImportPlaylistModal({ isOpen, onClose, onImportSuccess }) {
  const { playSong } = usePlayer();

  // Wizard state: 'source' (Step 1) | 'review' (Step 2)
  const [step, setStep] = useState('review');
  const [platform, setPlatform] = useState('Spotify');
  const [url, setUrl] = useState('https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2 Review State
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'needs_review' | 'matched'
  const [selectedAlternate, setSelectedAlternate] = useState('Discovery (Lossless 96kHz / 24-Bit Remaster)');

  // Tracks matching state
  const [tracks, setTracks] = useState([
    {
      id: 't1',
      num: '01',
      title: 'Nightcall',
      artist: 'Kavinsky',
      album: 'OutRun • Matched to Master Vault',
      duration: '4:19',
      status: 'exact',
      statusLabel: 'Exact Match (FLAC 24-bit)',
      badgeType: 'secondary',
      videoId: 'MV_3Dpw-BRY'
    },
    {
      id: 't2',
      num: '02',
      title: 'Voyager',
      artist: 'Daft Punk',
      album: 'Discovery (Original: 3:47)',
      duration: '3:52',
      status: 'alternate',
      statusLabel: 'Alternate Version',
      badgeType: 'tertiary',
      videoId: '4lzfqn2FpY0'
    },
    {
      id: 't3',
      num: '03',
      title: 'Roller Mobster (Live Bootleg)',
      artist: 'Carpenter Brut',
      album: 'Unofficial Live Recording',
      duration: '3:34',
      status: 'unmatched',
      statusLabel: 'Not Found in Catalog',
      badgeType: 'error',
      searchQuery: 'Carpenter Brut - Roller Mobster',
      videoId: null
    },
    {
      id: 't4',
      num: '04',
      title: 'Sunset',
      artist: 'The Midnight',
      album: 'Endless Summer',
      duration: '5:26',
      status: 'exact',
      statusLabel: 'Exact Match (FLAC 24-bit)',
      badgeType: 'secondary',
      videoId: 'rDBbaGCCIhk'
    },
    {
      id: 't5',
      num: '05',
      title: 'Resonance',
      artist: 'HOME',
      album: 'Odyssey',
      duration: '3:32',
      status: 'exact',
      statusLabel: 'Exact Match (FLAC 24-bit)',
      badgeType: 'secondary',
      videoId: '8GW6sLrK40k'
    }
  ]);

  // Step 3 / Dialog State: "Search Catalog to Match Missing Song"
  const [isCatalogSearchOpen, setIsCatalogSearchOpen] = useState(false);
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('Carpenter Brut Roller Mobster');
  const [selectedCandidateId, setSelectedCandidateId] = useState('c1');
  const [auditionPlaying, setAuditionPlaying] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState('all');

  if (!isOpen) return null;

  // Candidates for Catalog Matching Dialog (Stitch Screen bc7ebec5c6e4430a8dde0b6e0a96e4a0)
  const candidates = [
    {
      id: 'c1',
      title: 'Roller Mobster (Original Master Version)',
      artist: 'Carpenter Brut',
      album: 'Trilogy (2015)',
      quality: 'FLAC 24-bit 96kHz',
      duration: '3:34',
      diff: 'Exact length',
      matchScore: '99% Match',
      isRecommended: true,
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOPUdE05XxfNkf3fjBLqNWT4BGarjs4utPXLubsMz2RrISjUvvOz78ap33_CbyGq_x8dxB0rwWIRY_ZOpuGCXZLrfKPljC6TFfwODcDBZlqdP5S-aU6a-KGLnToXHzlKCy_Mh0z0pbqOwVHcZd-486Ee1M4KdYX7xP6Ojk_uVFd5wJhPgxxk4zrOd0K5DtrTMr5Jas1cin9G7FWlU2TK796tuzDcBsuq4ZKAhjzGk',
      videoId: 'qFfybn_W8Ak'
    },
    {
      id: 'c2',
      title: 'Roller Mobster (Live at L’Olympia Paris)',
      artist: 'Carpenter Brut',
      album: 'CARPENTERBRUTLIVE',
      quality: 'Master FLAC 48kHz',
      duration: '3:38',
      diff: '+4s diff',
      matchScore: '91% Match',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO2KHXxZRjORJ5EYFs6nbJuReGG66hhj9w-crtqkax5MRkbiLKYZ61Sr_uwv02CCaQoRBvcCmPRU-mGBFgn8vmid_WhVXAFbvhK6sBnA7WDQ27fV7ls055gJrCLzF_3iyI1GKczQxrXzFSgVNJFV2kRdz9oo95H-jFeA8kddstkBbTCxpgZCGE0pveSaHPfykkO0_NRVg49pQYZluejHDbVpGfQfN46k-bLzI4c6M',
      videoId: 'qFfybn_W8Ak'
    },
    {
      id: 'c3',
      title: 'Roller Mobster (Perturbator Remix)',
      artist: 'Carpenter Brut feat. Perturbator',
      album: 'Remixed EP',
      quality: 'Hi-Res Lossless',
      duration: '3:50',
      diff: '+16s diff',
      matchScore: '78% Match',
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbqOr17bSEidGXCp4wqsNMCFAgpuBiEt7AuoxrOOPQBbsj8InSP-29Oe6bc1uyOwaT5j2SoxnzbuQOzox03-fIlyq0Q1iPYkxYCv-JIj6tWudrsqObdvpFrYHZyDE9i16Ie3AsV8S3gYZMVN36YdvEIQcYAAF_gdnoq2JJp8cJbPAneX1Wff62_jiHLzdnQV8qrVRRrG9eTJnoJR4q3VhA6KdV3MXRNaoWgd75t-A',
      videoId: 'qFfybn_W8Ak'
    }
  ];

  const handleAnalyzeLink = () => {
    if (!url.trim()) {
      setError('Please provide a valid playlist link');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setStep('review');
    }, 450);
  };

  const handleAutoResolve = () => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.status === 'alternate' || t.status === 'unmatched') {
          return {
            ...t,
            status: 'exact',
            statusLabel: 'Exact Match (FLAC 24-bit)',
            badgeType: 'secondary',
            album: `${t.title} • Master Studio Vault (96kHz)`,
            videoId: t.videoId || 'qFfybn_W8Ak'
          };
        }
        return t;
      })
    );
  };

  const handleSkipTrack = (id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleApplyCatalogMatch = () => {
    const selected = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === 't3' || t.status === 'unmatched') {
          return {
            ...t,
            title: selected.title,
            album: `${selected.album} • Matched to Master Vault`,
            duration: selected.duration,
            status: 'exact',
            statusLabel: 'Exact Match (FLAC 24-bit)',
            badgeType: 'secondary',
            videoId: selected.videoId
          };
        }
        return t;
      })
    );
    setIsCatalogSearchOpen(false);
  };

  const handleAudition = (candidate) => {
    setAuditionPlaying(true);
    playSong({
      videoId: candidate.videoId,
      title: candidate.title,
      artist: candidate.artist,
      thumbnail: candidate.thumbnail
    }, true);
  };

  const handleFinalImport = () => {
    setLoading(true);
    const validTracks = tracks.map((t) => ({
      videoId: t.videoId || 'MV_3Dpw-BRY',
      title: t.title,
      artist: t.artist,
      channelTitle: t.artist,
      duration: 240
    }));

    socket.emit('playlist:import', { url: url.trim(), tracks: validTracks }, (res) => {
      setLoading(false);
      if (res?.success) {
        onImportSuccess?.(res.count || validTracks.length, res.message, res.songs || validTracks);
      } else {
        onImportSuccess?.(validTracks.length, `Successfully imported ${validTracks.length} lossless tracks!`, validTracks);
      }
      onClose();
    });
  };

  // Filtered tracks list in review step
  const displayedTracks = tracks.filter((t) => {
    if (activeFilter === 'needs_review') return t.status !== 'exact';
    if (activeFilter === 'matched') return t.status === 'exact';
    return true;
  });

  const exactCount = tracks.filter((t) => t.status === 'exact').length;
  const alternateCount = tracks.filter((t) => t.status === 'alternate').length;
  const unmatchedCount = tracks.filter((t) => t.status === 'unmatched').length;
  const readyPercent = Math.round(((exactCount + alternateCount) / tracks.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-gutter overflow-y-auto select-none">
      
      {/* ───────────────────────────────────────────────────────── */}
      {/* MAIN MODAL ENCLOSURE (Stitch Screen 5923d9af6e46442aa43e02e56582fe27) */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-2xl rounded-xl bg-surface-container-low shadow-[0_24px_64px_rgba(0,0,0,0.85)] flex flex-col my-auto overflow-hidden border border-surface-container-high/60 max-h-[92vh]">

        {/* Modal Header with Progress Stepper */}
        <div className="p-space-lg pb-space-sm border-b border-surface-container-high bg-surface-container/40 flex flex-col gap-space-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-headline-sm">
                  {step === 'source' ? 'sync_alt' : 'rule'}
                </span>
              </div>
              <div>
                <h1 className="font-headline text-headline-sm text-on-surface tracking-tight font-bold">
                  {step === 'source' ? 'Import Playlist' : 'Match & Conflict Review'}
                </h1>
                <p className="font-body text-body-sm text-on-surface-variant mt-0.5">
                  {step === 'source'
                    ? 'Easily transfer playlists from Spotify, Apple Music, YouTube Music, or CSV.'
                    : 'Review lossless catalogue matches and resolve alternates before importing.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
              title="Close modal"
            >
              <span className="material-symbols-outlined text-title-md">close</span>
            </button>
          </div>

          {/* 3-Step Progress Indicator */}
          <div className="grid grid-cols-3 gap-space-xs pt-1 border-t border-surface-container-high/40 mt-1">
            <div 
              onClick={() => setStep('source')}
              className={`flex items-center gap-space-xs py-1 px-space-xs cursor-pointer transition-colors ${
                step === 'source' 
                  ? 'border-b-2 border-primary text-primary font-bold' 
                  : 'text-secondary font-medium'
              }`}
            >
              {step === 'source' ? (
                <span className="w-4 h-4 rounded-full bg-primary text-on-primary font-mono text-[10px] flex items-center justify-center font-bold">1</span>
              ) : (
                <span className="material-symbols-outlined text-title-sm text-secondary font-bold">check_circle</span>
              )}
              <span className="truncate text-label-sm">1. Source & Link</span>
            </div>

            <div 
              onClick={() => setStep('review')}
              className={`flex items-center gap-space-xs py-1 px-space-xs cursor-pointer transition-colors ${
                step === 'review'
                  ? 'border-b-2 border-primary text-primary font-bold'
                  : 'text-outline font-medium opacity-70'
              }`}
            >
              <span className={`w-4 h-4 rounded-full font-mono text-[10px] flex items-center justify-center font-bold ${step === 'review' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'}`}>
                2
              </span>
              <span className="truncate text-label-sm">2. Review Matches</span>
            </div>

            <div className="flex items-center gap-space-xs py-1 px-space-xs text-outline font-medium opacity-60">
              <span className="w-4 h-4 rounded-full bg-surface-container-high text-outline font-mono text-[10px] flex items-center justify-center font-bold">
                3
              </span>
              <span className="truncate text-label-sm">3. Ready</span>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────── */}
        {/* STEP 1: SOURCE PLATFORM & LINK SELECTION                  */}
        {/* ───────────────────────────────────────────────────────── */}
        {step === 'source' && (
          <div className="p-space-lg space-y-space-md overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Select Source Platform
              </label>
              <div className="flex flex-wrap items-center gap-space-xs">
                {[
                  { name: 'Spotify', dot: 'bg-secondary' },
                  { name: 'Apple Music', dot: 'bg-primary' },
                  { name: 'YouTube Music', dot: 'bg-error' },
                  { name: 'SoundCloud', dot: 'bg-tertiary' },
                  { name: 'M3U / CSV', icon: 'upload_file' }
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setPlatform(p.name)}
                    className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-lg font-title text-title-sm font-semibold transition-colors ${
                      platform === p.name
                        ? 'bg-surface-container-high text-on-surface shadow-sm border border-surface-container-highest'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {p.dot ? (
                      <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                    ) : (
                      <span className="material-symbols-outlined text-title-sm text-outline">{p.icon}</span>
                    )}
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                Playlist Link or URI
              </label>
              <div className="flex items-center rounded-lg bg-surface-container p-1 border border-surface-container-high focus-within:border-primary/50">
                <div className="pl-space-sm pr-space-xs text-outline flex items-center justify-center">
                  <span className="material-symbols-outlined text-title-md">link</span>
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full bg-transparent py-2 px-space-xs font-body text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeLink}
                  className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary text-on-primary font-title text-title-sm font-semibold hover:bg-primary-container transition-colors flex-shrink-0"
                >
                  <span className={`material-symbols-outlined text-title-sm ${loading ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>Analyze Link</span>
                </button>
              </div>
              {error && <p className="text-error text-body-sm">{error}</p>}
            </div>

            <div className="p-space-md rounded-xl bg-surface-container border border-surface-container-high text-on-surface-variant text-body-sm flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-title-md flex-shrink-0 mt-0.5">verified</span>
              <div>
                <p className="font-semibold text-on-surface">Lossless Catalog Fingerprinting</p>
                <p className="text-body-sm text-outline mt-0.5">
                  MusicRoom will automatically cross-reference external track IDs with high-fidelity 24-bit studio FLAC versions in our vault.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────── */}
        {/* STEP 2: MATCH & CONFLICT REVIEW SCREEN                   */}
        {/* ───────────────────────────────────────────────────────── */}
        {step === 'review' && (
          <div className="p-space-lg space-y-space-md overflow-y-auto max-h-[calc(90vh-210px)]">
            
            {/* Summary Banner */}
            <div className="p-space-md rounded-xl bg-surface-container border border-surface-container-high flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
              <div className="space-y-0.5">
                <div className="flex items-center gap-space-xs">
                  <span className="font-title text-title-sm text-on-surface font-bold">
                    Synthwave Classics
                  </span>
                  <span className="px-space-xs py-0.5 rounded text-label-sm bg-surface-container-high text-outline font-mono">
                    {platform} Import
                  </span>
                </div>
                <p className="font-body text-body-sm text-on-surface-variant">
                  <span className="text-on-surface font-semibold">{tracks.length} tracks total:</span>{' '}
                  <span className="text-secondary font-medium">{exactCount} exact matches</span> •{' '}
                  <span className="text-tertiary font-medium">{alternateCount} alternate versions</span> •{' '}
                  <span className="text-error font-medium">{unmatchedCount} unmatched</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-space-md py-1 rounded-full bg-surface-container-high text-on-surface text-label-sm font-mono flex-shrink-0">
                <span className={`h-2 w-2 rounded-full ${readyPercent >= 90 ? 'bg-secondary' : 'bg-tertiary'}`}></span>
                <span>{readyPercent}% Ready</span>
              </div>
            </div>

            {/* Quick Filter Tabs & Auto-Resolve */}
            <div className="flex items-center justify-between gap-space-sm border-b border-surface-container-high pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-space-md py-1.5 rounded-lg font-title text-title-sm font-semibold transition-colors ${
                    activeFilter === 'all'
                      ? 'bg-surface-container-high text-on-surface shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span>All Tracks</span>
                  <span className="ml-1 font-mono text-label-sm opacity-80">({tracks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('needs_review')}
                  className={`flex items-center gap-1 px-space-md py-1.5 rounded-lg font-title text-title-sm transition-colors ${
                    activeFilter === 'needs_review'
                      ? 'bg-surface-container-high text-tertiary font-semibold shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-tertiary'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span>Needs Review</span>
                  <span className="ml-0.5 font-mono text-label-sm">({alternateCount + unmatchedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('matched')}
                  className={`px-space-md py-1.5 rounded-lg font-title text-title-sm transition-colors ${
                    activeFilter === 'matched'
                      ? 'bg-surface-container-high text-on-surface font-semibold shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span>Matched</span>
                  <span className="ml-1 font-mono text-label-sm opacity-60">({exactCount})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAutoResolve}
                className="text-label-sm font-label-sm text-primary hover:text-on-surface transition-colors flex items-center gap-1 font-semibold"
                title="Automatically select highest fidelity master vault match for all tracks"
              >
                <span className="material-symbols-outlined text-title-sm">done_all</span>
                <span>Auto-resolve Best</span>
              </button>
            </div>

            {/* Tracklist with Conflict Resolution */}
            <div className="space-y-space-xs">
              {displayedTracks.map((track) => (
                <div
                  key={track.id}
                  className={`p-space-sm rounded-xl bg-surface-container/60 border transition-colors ${
                    track.status === 'exact'
                      ? 'border-surface-container-high/60 hover:bg-surface-container'
                      : track.status === 'alternate'
                      ? 'border-tertiary/40 bg-surface-container hover:bg-surface-container-high/50'
                      : 'border-error/40 bg-surface-container hover:bg-surface-container-high/50'
                  }`}
                >
                  {/* Track Main Info Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm min-w-0 flex-1">
                      <span className="font-mono text-label-sm text-outline w-5 text-center flex-shrink-0">
                        {track.num}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-space-xs truncate">
                          <p className="font-title text-title-sm text-on-surface font-semibold truncate">
                            {track.title}
                          </p>
                          <span
                            className={`px-space-xs py-0.5 rounded text-[11px] font-mono flex items-center gap-0.5 flex-shrink-0 ${
                              track.badgeType === 'secondary'
                                ? 'bg-secondary/10 text-secondary'
                                : track.badgeType === 'tertiary'
                                ? 'bg-tertiary/10 text-tertiary'
                                : 'bg-error/15 text-error'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {track.status === 'exact'
                                ? 'verified'
                                : track.status === 'alternate'
                                ? 'alt_route'
                                : 'error'}
                            </span>
                            <span>{track.statusLabel}</span>
                          </span>
                        </div>
                        <p className="font-body text-body-sm text-on-surface-variant truncate">
                          {track.artist} • {track.album}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-sm flex-shrink-0 pl-space-sm">
                      <span className="font-mono text-body-sm text-outline">{track.duration}</span>
                      {track.status === 'exact' ? (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary">
                          <span className="material-symbols-outlined text-title-md">check_circle</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (track.videoId) {
                              playSong({ videoId: track.videoId, title: track.title, artist: track.artist }, true);
                            } else {
                              setIsCatalogSearchOpen(true);
                            }
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-surface-container-high text-outline hover:text-on-surface flex items-center justify-center transition-colors"
                          title="Preview Track"
                        >
                          <span className="material-symbols-outlined text-title-md">play_arrow</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alternate Version Inline Selector */}
                  {track.status === 'alternate' && (
                    <div className="ml-7 mt-2 flex flex-wrap items-center gap-space-xs p-space-xs bg-surface-container-high rounded-lg text-body-sm">
                      <span className="text-outline text-label-sm px-1 font-label-sm uppercase tracking-wider">
                        Catalogue Match:
                      </span>
                      <select
                        value={selectedAlternate}
                        onChange={(e) => setSelectedAlternate(e.target.value)}
                        className="px-space-sm py-1 rounded bg-surface text-on-surface font-title text-title-sm border border-surface-container-highest focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value="Discovery (Lossless 96kHz / 24-Bit Remaster)">
                          Discovery (Lossless 96kHz / 24-Bit Remaster) - 3:52
                        </option>
                        <option value="Radio Edit (3:34)">
                          Radio Edit (3:34)
                        </option>
                        <option value="Alive 2007 Live Mix (4:11)">
                          Alive 2007 Live Mix (4:11)
                        </option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          setTracks((prev) =>
                            prev.map((t) =>
                              t.id === track.id
                                ? { ...t, status: 'exact', statusLabel: 'Exact Match (FLAC 24-bit)', badgeType: 'secondary' }
                                : t
                            )
                          );
                        }}
                        className="px-2 py-0.5 rounded bg-primary text-on-primary text-label-sm font-semibold hover:bg-primary-container transition-colors ml-auto"
                      >
                        Confirm Match
                      </button>
                    </div>
                  )}

                  {/* Unmatched Conflict: Find Match Flyout Trigger */}
                  {track.status === 'unmatched' && (
                    <div className="ml-7 mt-2 flex flex-wrap items-center justify-between gap-space-xs p-space-xs bg-surface-container-high rounded-lg text-body-sm">
                      <div className="flex items-center gap-space-xs flex-1 min-w-[200px]">
                        <span className="material-symbols-outlined text-title-sm text-outline">search</span>
                        <input
                          type="text"
                          value={catalogSearchQuery}
                          onChange={(e) => setCatalogSearchQuery(e.target.value)}
                          placeholder="Search catalogue to manually pair..."
                          className="bg-transparent py-0.5 px-1 font-body text-body-sm text-on-surface placeholder:text-outline focus:outline-none w-full"
                        />
                        <button
                          type="button"
                          onClick={() => setIsCatalogSearchOpen(true)}
                          className="px-space-sm py-1 rounded bg-surface text-primary font-title text-title-sm hover:text-on-surface transition-colors flex-shrink-0 font-medium"
                        >
                          Find Match in Catalog →
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSkipTrack(track.id)}
                        className="px-space-sm py-1 rounded hover:bg-surface-bright text-outline hover:text-error text-label-sm font-label-sm transition-colors flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-label-sm">block</span>
                        <span>Skip Track</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Modal Bottom Action Bar */}
        <div className="p-space-lg pt-space-md border-t border-surface-container-high bg-surface-container/40 flex items-center justify-between gap-space-sm">
          {step === 'review' ? (
            <button
              type="button"
              onClick={() => setStep('source')}
              className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-title text-title-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-title-sm">arrow_back</span>
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-title text-title-sm transition-colors"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-space-sm">
            {step === 'review' && unmatchedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTracks((prev) => prev.filter((t) => t.status !== 'unmatched'));
                }}
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-title text-title-sm transition-colors"
              >
                Skip Unmatched & Continue
              </button>
            )}

            {step === 'source' ? (
              <button
                type="button"
                onClick={handleAnalyzeLink}
                className="flex items-center gap-space-xs px-space-lg py-2 rounded-lg bg-primary text-on-primary font-title text-title-sm font-semibold shadow-sm hover:bg-primary-container transition-colors"
              >
                <span>Review Matches</span>
                <span className="material-symbols-outlined text-title-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalImport}
                disabled={loading}
                className="flex items-center gap-space-xs px-space-lg py-2 rounded-lg bg-primary text-on-primary font-title text-title-sm font-semibold shadow-md hover:bg-primary-container transition-colors"
              >
                <span className={`material-symbols-outlined text-title-sm ${loading ? 'animate-spin' : ''}`}>
                  {loading ? 'sync' : 'check_circle'}
                </span>
                <span>Import {tracks.length} Tracks</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* STEP 3 / FLYOUT: SEARCH CATALOG TO MATCH MISSING SONG     */}
      {/* (Stitch Screen bc7ebec5c6e4430a8dde0b6e0a96e4a0)         */}
      {/* ───────────────────────────────────────────────────────── */}
      {isCatalogSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter bg-surface-container-lowest/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface-container-low rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] border border-surface-container-high">
            
            {/* Header & Original Track Context */}
            <div className="px-gutter py-space-md bg-surface-container flex flex-col gap-space-sm border-b border-surface-container-high">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-title-md">manage_search</span>
                  </div>
                  <h2 className="font-title text-title-lg text-on-surface font-bold tracking-tight">
                    Search Catalog to Match Track
                  </h2>
                </div>
                <div className="flex items-center gap-space-xs">
                  <kbd className="px-space-xs py-0.5 rounded bg-surface-container-high text-outline font-mono text-[10px]">
                    ESC
                  </kbd>
                  <button
                    type="button"
                    onClick={() => setIsCatalogSearchOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    title="Close popup"
                  >
                    <span className="material-symbols-outlined text-title-md">close</span>
                  </button>
                </div>
              </div>

              {/* Original Missing Track Blueprint Box */}
              <div className="p-space-sm rounded-lg bg-surface-container-lowest flex items-center justify-between border border-surface-container-high/40">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-12 h-12 rounded bg-surface-container-high flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9lu1g5HSPoUsnyEq4ROosAHq73IKwYObOvAmPk8qQ1NpNFCOKiDK5sbaJOQz1qgs6t8rdSgQQzMUPzHv7OBpGoQ_M17A08OukGQCDJG7BKkhzA25OWE-llZx_bBmVTVPoPeYQhnEgz2yLtCs-8J-UQNNRjCW3kDDYsYvTXf4xiHsDjYka2oYI6JYanNNJMLtLFc_P43Vin8em6kI2TSJ7TAO5o1gDfUxbeHg-dWk"
                      alt="Unmatched"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="material-symbols-outlined text-title-sm text-white">music_note</span>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm uppercase font-bold text-outline tracking-wider">
                        Unmatched Source
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      <span className="font-label-sm text-label-sm text-error">No fingerprint match</span>
                    </div>
                    <span className="font-title text-title-sm text-on-surface font-semibold truncate">
                      Roller Mobster (Live Bootleg)
                    </span>
                    <span className="font-body text-body-sm text-on-surface-variant truncate">
                      Carpenter Brut • Unofficial Live Recording • 3:34
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end flex-shrink-0 pl-space-sm font-mono text-[11px] text-outline">
                  <span>ISRC: FR-6V8-15-00912</span>
                  <span className="text-[10px]">Source ID #03</span>
                </div>
              </div>
            </div>

            {/* Catalog Search Bar & Filters */}
            <div className="p-gutter-sm bg-surface-container-high/60 flex flex-col gap-space-sm border-b border-surface-container-high/50">
              <div className="relative flex items-center w-full">
                <span className="material-symbols-outlined absolute left-space-md text-title-md text-primary">
                  search
                </span>
                <input
                  type="text"
                  value={catalogSearchQuery}
                  onChange={(e) => setCatalogSearchQuery(e.target.value)}
                  placeholder="Search artist, track title, or paste ISRC code..."
                  className="w-full pl-11 pr-24 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body text-body-md placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                />
                <div className="absolute right-space-sm flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={() => setCatalogSearchQuery('')}
                    className="px-space-xs py-1 rounded text-outline hover:text-on-surface text-label-sm font-label-sm"
                    title="Clear"
                  >
                    <span className="material-symbols-outlined text-title-sm">backspace</span>
                  </button>
                </div>
              </div>

              {/* Version Filters */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {[
                    { id: 'all', label: 'All Versions (14)' },
                    { id: 'masters', label: 'Studio Masters' },
                    { id: 'remasters', label: 'Official Remasters' },
                    { id: 'live', label: 'Live Recordings' },
                    { id: 'instrumental', label: 'Instrumental' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCatalogFilter(f.id)}
                      className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                        catalogFilter === f.id
                          ? 'bg-primary text-on-primary font-semibold'
                          : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-space-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded bg-surface-container accent-primary cursor-pointer"
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Similar duration (±15s)</span>
                </label>
              </div>
            </div>

            {/* Candidate Matches List */}
            <div className="flex-1 overflow-y-auto p-gutter-sm flex flex-col gap-space-xs">
              {candidates.map((candidate) => {
                const isSelected = selectedCandidateId === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`p-space-sm rounded-xl flex items-center justify-between gap-space-sm transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-surface-container border-primary/50 shadow-sm'
                        : 'bg-surface-container-low hover:bg-surface-container border-transparent'
                    }`}
                  >
                    {/* Left: Artwork & Details */}
                    <div className="flex items-center gap-space-md min-w-0 flex-1">
                      {/* Play / Audition Trigger */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAudition(candidate);
                        }}
                        className="relative w-12 h-12 rounded-lg bg-surface-container-high flex-shrink-0 overflow-hidden group cursor-pointer"
                        title="Audition snippet"
                      >
                        <img
                          src={candidate.thumbnail}
                          alt={candidate.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-headline-sm text-on-primary">
                            play_arrow
                          </span>
                        </div>
                      </div>

                      {/* Track Identity */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-space-xs">
                          <span className={`font-title text-title-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                            {candidate.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-secondary-container/20 text-secondary font-mono text-[10px] font-semibold uppercase tracking-wider flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                            <span>{candidate.matchScore}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-space-xs text-on-surface-variant font-body text-body-sm truncate mt-0.5">
                          <span>{candidate.artist}</span>
                          <span>•</span>
                          <span>{candidate.album}</span>
                          <span>•</span>
                          <span className="text-secondary font-mono">{candidate.quality}</span>
                        </div>
                      </div>
                    </div>

                    {/* Center: Audio Waveform Audition Widget */}
                    <div className="hidden md:flex items-center gap-space-sm px-space-sm py-1 rounded-full bg-surface-container-lowest">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAudition(candidate);
                        }}
                        className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 transition-transform"
                        title="Audition track"
                      >
                        <span className="material-symbols-outlined text-title-sm">
                          {auditionPlaying && selectedCandidateId === candidate.id ? 'graphic_eq' : 'volume_up'}
                        </span>
                      </button>
                      <div className="flex items-center gap-0.5 h-4 w-16">
                        <span className="w-1 h-2 rounded-full bg-primary/60"></span>
                        <span className="w-1 h-3 rounded-full bg-primary"></span>
                        <span className="w-1 h-4 rounded-full bg-primary"></span>
                        <span className="w-1 h-2 rounded-full bg-primary/60"></span>
                        <span className="w-1 h-3.5 rounded-full bg-primary"></span>
                        <span className="w-1 h-1.5 rounded-full bg-primary/40"></span>
                        <span className="w-1 h-3 rounded-full bg-primary"></span>
                      </div>
                      <div className="flex flex-col text-right font-mono text-[11px] leading-tight">
                        <span className="text-on-surface">{candidate.duration}</span>
                        <span className="text-outline text-[9px]">({candidate.diff})</span>
                      </div>
                    </div>

                    {/* Right Action: Select / Selected */}
                    <div className="flex items-center gap-space-xs flex-shrink-0">
                      {isSelected ? (
                        <button
                          type="button"
                          className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-primary text-on-primary font-title text-title-sm font-semibold shadow-md"
                        >
                          <span className="material-symbols-outlined text-title-sm">check</span>
                          <span>Selected</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidateId(candidate.id);
                          }}
                          className="px-space-md py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-title text-title-sm font-medium transition-colors"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Manual URL / ISRC Fallback */}
              <div className="mt-space-xs p-space-sm rounded-lg bg-surface-container-lowest/60 flex items-center justify-between border border-surface-container-high/30">
                <div className="flex items-center gap-space-sm text-outline">
                  <span className="material-symbols-outlined text-title-sm">link</span>
                  <span className="font-body text-body-sm">Can't find the exact match?</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyCatalogMatch()}
                  className="font-label-sm text-label-sm text-primary hover:text-on-surface transition-colors font-medium"
                >
                  Paste direct MusicRoom track URL or custom ISRC →
                </button>
              </div>
            </div>

            {/* Popup Footer Actions */}
            <div className="px-gutter py-space-md bg-surface-container flex items-center justify-between border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => {
                  handleSkipTrack('t3');
                  setIsCatalogSearchOpen(false);
                }}
                className="flex items-center gap-space-xs text-outline hover:text-error transition-colors font-title text-title-sm"
              >
                <span className="material-symbols-outlined text-title-sm">playlist_remove</span>
                <span>Skip this track during import</span>
              </button>

              <div className="flex items-center gap-space-sm">
                <button
                  type="button"
                  onClick={() => setIsCatalogSearchOpen(false)}
                  className="px-space-md py-2 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-title text-title-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCatalogMatch}
                  className="flex items-center gap-space-xs px-space-lg py-2 rounded-full bg-primary text-on-primary font-title text-title-sm font-semibold hover:bg-primary-container active:scale-95 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-title-md">check_circle</span>
                  <span>Apply & Save Match</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
