import React, { useState, useEffect, useRef } from 'react';
import { Mic2, Sparkles, Volume2, Music, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function SyncedLyrics({
  currentSong,
  playback = {},
  canControl = false,
  onSeek
}) {
  const [lyricsData, setLyricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  const videoId = currentSong?.videoId;
  const title = currentSong?.title;
  const channelTitle = currentSong?.channelTitle;

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

  // Determine active lyric line based on current playback second
  let activeIndex = -1;
  if (isSynced && lines.length > 0) {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (currentTime >= lines[i].time - 0.25) {
        activeIndex = i;
        break;
      }
    }
  }

  // Smooth scroll active line to center
  useEffect(() => {
    if (autoScroll && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, autoScroll]);

  const handleLineClick = (time) => {
    if (canControl && onSeek && typeof time === 'number') {
      onSeek(time);
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
    <div className="flex flex-col rounded-2xl bg-surface-container-low border border-white/5 overflow-hidden shadow-2xl">
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

        <button
          onClick={() => setAutoScroll((prev) => !prev)}
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

      {/* Lyrics Scroll Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto max-h-[460px] p-6 space-y-4 no-scrollbar select-none"
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
      </div>

      {/* Footer Meta */}
      <div className="p-2.5 border-t border-white/5 bg-surface-container-lowest/80 backdrop-blur-xl flex items-center justify-between text-[11px] text-on-surface-variant px-4 shrink-0">
        <span className="flex items-center gap-1.5">
          <Volume2 className="w-3 h-3 text-secondary" />
          <span>{canControl ? 'Click any lyric line to jump in sync' : 'Synchronized with room audio'}</span>
        </span>
        <span className="text-outline font-medium">LRCLIB Sync Engine</span>
      </div>
    </div>
  );
}

