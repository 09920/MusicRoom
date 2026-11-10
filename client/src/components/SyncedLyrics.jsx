import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic2,
  Sparkles,
  Volume2,
  Music,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  Plus,
  Minus,
  RotateCcw,
  Sliders
} from 'lucide-react';

export default function SyncedLyrics({
  currentSong,
  playback = {},
  canControl = false,
  onSeek
}) {
  const [lyricsData, setLyricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isUserBrowsing, setIsUserBrowsing] = useState(false);
  const [showOffsetControls, setShowOffsetControls] = useState(false);
  const [manualOffset, setManualOffset] = useState(0);

  const activeLineRef = useRef(null);
  const containerRef = useRef(null);
  const browseTimeoutRef = useRef(null);

  const videoId = currentSong?.videoId;
  const title = currentSong?.title;
  const channelTitle = currentSong?.channelTitle;
  const storageKey = videoId ? `lyric_offset_${videoId}` : null;

  // Restore saved offset and reset user browsing on song change
  useEffect(() => {
    setIsUserBrowsing(false);
    if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current);

    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
          const parsed = parseFloat(saved);
          if (!isNaN(parsed)) {
            setManualOffset(parsed);
            return;
          }
        }
      } catch {
        // Fallback to default
      }
    }
    setManualOffset(0);
  }, [videoId, storageKey]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current);
    };
  }, []);

  // Fetch lyrics from server
  useEffect(() => {
    if (!videoId && !title) {
      setLyricsData(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    const query = new URLSearchParams({
      videoId: videoId || '',
      title: title || '',
      artist: channelTitle || ''
    });

    fetch(`/api/lyrics?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          setLyricsData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('[SyncedLyrics] Error fetching lyrics:', err);
          setLyricsData({ success: false, lines: [] });
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [videoId, title, channelTitle]);

  const lines = lyricsData?.lines || [];
  const isSynced = lyricsData?.synced;
  const currentTime = playback?.currentTime || 0;

  // Effective time accounts for manual micro-sync offset:
  // If manualOffset > 0, lyrics are delayed (e.g. video has a 2s intro logo).
  // If manualOffset < 0, lyrics trigger earlier.
  const effectiveTime = Math.max(0, currentTime - manualOffset);

  // Determine active lyric line based on effective playback second
  let activeIndex = -1;
  if (isSynced && lines.length > 0) {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (effectiveTime >= lines[i].time - 0.25) {
        activeIndex = i;
        break;
      }
    }
  }

  // Pure container-scoped scroll - never causes outer page or tab to scroll
  const scrollToActiveLine = useCallback((smooth = true) => {
    const container = containerRef.current;
    const activeEl = activeLineRef.current;
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    const offsetDiff = activeRect.top - containerRect.top;
    const targetScrollTop =
      container.scrollTop +
      offsetDiff -
      container.clientHeight / 2 +
      activeEl.clientHeight / 2;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  // Auto-scroll when active line changes, unless user is actively browsing
  useEffect(() => {
    if (autoScroll && !isUserBrowsing && activeIndex >= 0) {
      scrollToActiveLine(true);
    }
  }, [activeIndex, autoScroll, isUserBrowsing, scrollToActiveLine]);

  // Detect user manual scroll/gesture inside the lyrics container
  const handleUserInteraction = () => {
    setIsUserBrowsing(true);
    if (browseTimeoutRef.current) clearTimeout(browseTimeoutRef.current);
    // After 7s of no scroll interaction, auto-scroll will resume seamlessly
    browseTimeoutRef.current = setTimeout(() => {
      setIsUserBrowsing(false);
    }, 7000);
  };

  const handleOffsetAdjust = (delta) => {
    setManualOffset((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      if (storageKey) {
        try {
          if (next === 0) localStorage.removeItem(storageKey);
          else localStorage.setItem(storageKey, String(next));
        } catch {
          // ignore localStorage error
        }
      }
      return next;
    });
  };

  const handleResetOffset = () => {
    setManualOffset(0);
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // ignore localStorage error
      }
    }
  };

  const handleLineClick = (time) => {
    if (canControl && onSeek && typeof time === 'number') {
      // Seek considering manualOffset so playback lands exactly when line is sung
      const seekTarget = Math.max(0, time + manualOffset);
      onSeek(seekTarget);
    }
  };

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-surface-container-low border border-white/5 min-h-[300px]">
        <Mic2 className="w-8 h-8 text-outline mb-2 opacity-40" />
        <p className="text-xs text-on-surface-variant font-medium">No song currently streaming</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-surface-container-low border border-white/5 min-h-[360px] space-y-3">
        <RefreshCw className="w-6 h-6 text-secondary animate-spin" />
        <p className="text-xs text-on-surface font-semibold">Fetching synchronized lyrics...</p>
        <p className="text-[11px] text-outline">Searching LRCLIB &amp; track database</p>
      </div>
    );
  }

  if (!lyricsData?.success || lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-surface-container-low border border-white/5 min-h-[340px] space-y-3">
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary border border-white/5 shadow-inner">
          <Music className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-on-surface">No lyrics available</p>
          <p className="text-xs text-on-surface-variant max-w-xs">
            This track might be an instrumental, DJ set, or not yet indexed in LRCLIB.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-secondary text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Enjoy the music with your room</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col rounded-2xl bg-surface-container-low border border-white/5 overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/5 bg-surface-container/60 shrink-0">
        <div className="flex items-center space-x-2">
          <Mic2 className="w-4 h-4 text-secondary" />
          <h3 className="font-title-md text-sm font-bold text-on-surface">
            Synchronized Lyrics
          </h3>
          {isSynced && (
            <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold tracking-wider uppercase border border-secondary/20">
              Karaoke Sync
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Micro-Sync Offset Toggle Button */}
          {isSynced && (
            <button
              onClick={() => setShowOffsetControls((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                showOffsetControls || manualOffset !== 0
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : 'bg-surface-container-high text-outline hover:text-on-surface border-white/5'
              }`}
              title="Fine-tune lyric sync offset"
            >
              <Sliders className="w-3 h-3" />
              <span className="text-[11px]">
                {manualOffset !== 0
                  ? `${manualOffset > 0 ? '+' : ''}${manualOffset}s`
                  : 'Offset'}
              </span>
            </button>
          )}

          {/* Auto-scroll Switch */}
          <button
            onClick={() => {
              setAutoScroll((prev) => {
                const next = !prev;
                if (next) {
                  setIsUserBrowsing(false);
                  setTimeout(() => scrollToActiveLine(true), 50);
                }
                return next;
              });
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
              autoScroll
                ? 'bg-secondary/15 text-secondary border-secondary/30'
                : 'bg-surface-container-high text-outline border-white/5'
            }`}
            title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
          >
            {autoScroll ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="text-[11px]">{autoScroll ? 'Auto-Scroll' : 'Manual'}</span>
          </button>
        </div>
      </div>

      {/* Micro-Sync Offset Tuning Sub-bar */}
      {showOffsetControls && isSynced && (
        <div className="flex items-center justify-between px-4 py-2 bg-surface-container-high/60 border-b border-white/5 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="text-[11px]">Timing:</span>
            <span
              className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                manualOffset !== 0
                  ? 'bg-secondary/20 text-secondary border border-secondary/30'
                  : 'text-on-surface'
              }`}
            >
              {manualOffset === 0
                ? '0.0s (Default)'
                : `${manualOffset > 0 ? '+' : ''}${manualOffset}s ${
                    manualOffset > 0 ? '(delayed)' : '(earlier)'
                  }`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleOffsetAdjust(-0.5)}
              className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-bright text-on-surface text-[11px] font-semibold flex items-center gap-0.5 active:scale-95 transition-all border border-white/5"
              title="Trigger lyrics 0.5s earlier"
            >
              <Minus className="w-3 h-3" />
              <span>0.5s Earlier</span>
            </button>

            <button
              onClick={() => handleOffsetAdjust(0.5)}
              className="px-2 py-0.5 rounded-md bg-surface-container hover:bg-surface-bright text-on-surface text-[11px] font-semibold flex items-center gap-0.5 active:scale-95 transition-all border border-white/5"
              title="Delay lyrics by 0.5s"
            >
              <Plus className="w-3 h-3" />
              <span>0.5s Delay</span>
            </button>

            {manualOffset !== 0 && (
              <button
                onClick={handleResetOffset}
                className="p-1 rounded-md bg-surface-container hover:text-error text-outline active:scale-95 transition-all ml-1"
                title="Reset timing to 0s default"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lyrics Scroll Container - strictly internal scrolling */}
      <div
        ref={containerRef}
        onWheel={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        className="relative flex-1 overflow-y-auto max-h-[460px] p-6 space-y-4 no-scrollbar select-none"
      >
        {lines.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = activeIndex > -1 && idx < activeIndex;

          return (
            <div
              key={`${line.time}-${idx}`}
              ref={isActive ? activeLineRef : null}
              onClick={() => handleLineClick(line.time)}
              className={`transition-all duration-300 rounded-xl px-3 py-1.5 ${
                canControl ? 'cursor-pointer hover:bg-white/[0.04]' : ''
              } ${
                isActive
                  ? 'text-lg sm:text-xl font-extrabold text-on-surface bg-surface-container-high/60 scale-[1.02] shadow-sm text-secondary drop-shadow-[0_0_12px_rgba(76,215,246,0.35)]'
                  : isPassed
                  ? 'text-xs sm:text-sm text-outline/60 font-medium'
                  : 'text-xs sm:text-sm text-on-surface-variant font-medium'
              }`}
            >
              <p className="leading-relaxed">{line.text}</p>
            </div>
          );
        })}

        {/* Floating Resume Auto-Scroll Button when user browses manually */}
        {isUserBrowsing && autoScroll && (
          <div className="sticky bottom-2 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <button
              onClick={() => {
                setIsUserBrowsing(false);
                scrollToActiveLine(true);
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary text-surface font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all border border-secondary/30 backdrop-blur-md animate-bounce"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Resume Auto-Scroll</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="p-2.5 border-t border-white/5 bg-surface-container-lowest/80 backdrop-blur-xl flex items-center justify-between text-[11px] text-on-surface-variant px-4 shrink-0">
        <span className="flex items-center gap-1.5">
          <Volume2 className="w-3 h-3 text-secondary" />
          <span>
            {canControl
              ? 'Click any lyric line to jump in sync'
              : 'Synchronized with room audio'}
          </span>
        </span>
        <span className="text-outline font-medium">LRCLIB Sync Engine</span>
      </div>
    </div>
  );
}
