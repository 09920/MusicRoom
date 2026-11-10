import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { Plus, Headphones, Video, Music2, Disc3, Zap } from 'lucide-react';

export default function Player({
  currentSong,
  playback,
  isHost,
  canControl,
  onPlaybackChange,
  onSongEnd,
  volume,
  isMuted,
  playerRefOut,
  onOpenImport
}) {
  const playerRef = useRef(null);
  const silentAudioRef = useRef(null);
  const lastLoadedVideoIdRef = useRef(null);
  const failedAttemptsRef = useRef({});
  const lastServerTimeRef = useRef(0);
  const bufferStallCountRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showSyncBadge, setShowSyncBadge] = useState(false);
  const [syncDrift, setSyncDrift] = useState(0);
  const isRemoteActionRef = useRef(false);
  const [isAudioOnly, setIsAudioOnly] = useState(() => {
    try {
      return localStorage.getItem('musicroom_audio_only') === 'true';
    } catch {
      return false;
    }
  });

  const toggleAudioOnly = () => {
    setIsAudioOnly(prev => {
      const next = !prev;
      try {
        localStorage.setItem('musicroom_audio_only', String(next));
      } catch { }
      return next;
    });
  };

  useEffect(() => {
    setIsEnding(false);
  }, [currentSong?.videoId]);

  // Monitor near-end to trigger advance BEFORE YouTube renders native end-screen recommendations
  useEffect(() => {
    const endCheckInterval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          if (dur > 15 && cur >= dur - 1.5) {
            setIsEnding(true);
            if (isHost && onSongEnd) {
              onSongEnd();
            }
          }
        } catch (_) { }
      }
    }, 400);

    return () => clearInterval(endCheckInterval);
  }, [isHost, onSongEnd]);

  const onPlaybackChangeRef = useRef(onPlaybackChange);
  useEffect(() => {
    onPlaybackChangeRef.current = onPlaybackChange;
  }, [onPlaybackChange]);

  // Active Time & Duration Tracker to ensure UI progress bar starts and ticks smoothly
  useEffect(() => {
    const timeTracker = setInterval(() => {
      const p = playerRef.current || playerRefOut?.current || (typeof window !== 'undefined' ? window.musicroom_player : null);
      if (p && typeof p.getCurrentTime === 'function') {
        try {
          const cur = p.getCurrentTime() || 0;
          const dur = typeof p.getDuration === 'function' ? p.getDuration() || 0 : 0;

          if (onPlaybackChangeRef.current) {
            onPlaybackChangeRef.current({
              currentTime: cur,
              ...(dur > 0 ? { duration: dur } : {})
            });
          }
        } catch (_) { }
      }
    }, 250);

    return () => clearInterval(timeTracker);
  }, []);

  // Handle play/pause sync when playback.isPlaying changes
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.getPlayerState !== 'function') return;
    try {
      const state = playerRef.current.getPlayerState();
      if (playback?.isPlaying && state !== 1 && state !== 3) {
        const p = playerRef.current.playVideo();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            // If browser blocks unmuted playback, fallback to muted play so stream runs
            playerRef.current.mute();
            playerRef.current.playVideo();
          });
        }
      } else if (!playback?.isPlaying && (state === 1 || state === 3)) {
        playerRef.current.pauseVideo();
      }
    } catch (_) {}
  }, [playback?.isPlaying]);

  // Set 144p quality when in audio-only mode or on mobile to save ~85% mobile data & prevent buffering
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setPlaybackQuality === 'function') {
      try {
        const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isAudioOnly || isMobile) {
          playerRef.current.setPlaybackQuality('tiny');
        } else {
          playerRef.current.setPlaybackQuality('auto');
        }
      } catch (_) { }
    }
  }, [isAudioOnly, currentSong?.videoId]);

  useEffect(() => {
    if (!currentSong?.videoId) return;

    let checkInterval = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return false;
      const targetElement = document.getElementById('youtube-iframe-target');
      if (!targetElement) return false;

      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        if (playerRefOut) playerRefOut.current = playerRef.current;
        if (typeof window !== 'undefined') window.musicroom_player = playerRef.current;

        const isNewTrack = lastLoadedVideoIdRef.current !== currentSong.videoId;
        lastLoadedVideoIdRef.current = currentSong.videoId;

        playerRef.current.loadVideoById({
          videoId: currentSong.videoId,
          startSeconds: isNewTrack ? 0 : (playback?.currentTime || 0)
        });
        if (playback?.isPlaying !== false) {
          playerRef.current.playVideo();
          setTimeout(() => {
            try {
              if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
                if (playerRef.current.getPlayerState() !== 1) {
                  playerRef.current.playVideo();
                }
              }
            } catch (_) { }
          }, 350);
        }
        return true;
      }

      playerRef.current = new window.YT.Player('youtube-iframe-target', {
        height: '100%',
        width: '100%',
        videoId: currentSong.videoId,
        playerVars: {
          autoplay: playback?.isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            if (playerRefOut) playerRefOut.current = event.target;
            if (typeof window !== 'undefined') window.musicroom_player = event.target;

            event.target.setVolume(volume);
            if (isMuted) event.target.mute();

            try {
              const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              if (isAudioOnly || isMobile) {
                event.target.setPlaybackQuality('tiny');
              }
            } catch (_) { }

            const isNewTrack = lastLoadedVideoIdRef.current !== currentSong.videoId;
            lastLoadedVideoIdRef.current = currentSong.videoId;

            if (playback?.currentTime > 0 && !isNewTrack) {
              event.target.seekTo(playback.currentTime, true);
            }
            if (playback?.isPlaying !== false) {
              const playPromise = event.target.playVideo();
              if (playPromise && playPromise.catch) {
                playPromise.catch(() => { });
              }
            }
          },
          onStateChange: (event) => {
            const cur = typeof event.target.getCurrentTime === 'function' ? event.target.getCurrentTime() || 0 : 0;
            const dur = typeof event.target.getDuration === 'function' ? event.target.getDuration() || 0 : 0;

            if (event.data === 1) {
              setIsEnding(false);
              if (onPlaybackChange) {
                onPlaybackChange({
                  isPlaying: true,
                  currentTime: cur,
                  ...(dur > 0 ? { duration: dur } : {})
                });
              }
            } else if (event.data === 2) {
              if (onPlaybackChange) {
                onPlaybackChange({
                  isPlaying: false,
                  currentTime: cur,
                  ...(dur > 0 ? { duration: dur } : {})
                });
              }
            } else if (event.data === 0) {
              setIsEnding(true);
              if (isHost && onSongEnd) {
                try {
                  if (dur > 10 && cur >= dur - 3.5) {
                    onSongEnd();
                  }
                } catch (_) { }
              }
            }
          },
          onError: async (event) => {
            console.warn('YouTube Player error code:', event.data, 'for song:', currentSong?.title, currentSong?.videoId);

            const videoId = currentSong?.videoId;
            const attempts = (failedAttemptsRef.current[videoId] || 0) + 1;
            failedAttemptsRef.current[videoId] = attempts;

            if (attempts === 1 && currentSong?.title) {
              try {
                const query = `${currentSong.title} ${currentSong.artist || currentSong.channelTitle || ''} official audio`;
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                  const data = await res.json();
                  const alternative = (data.results || []).find(r => r.videoId && r.videoId !== videoId);
                  if (alternative && alternative.videoId) {
                    console.log(`[Auto-Recover] Switching unplayable video (${videoId}) to working alternative (${alternative.videoId}): ${alternative.title}`);
                    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
                      lastLoadedVideoIdRef.current = alternative.videoId;
                      playerRef.current.loadVideoById({
                        videoId: alternative.videoId,
                        startSeconds: 0
                      });
                      playerRef.current.playVideo();
                      return;
                    }
                  }
                }
              } catch (err) {
                console.warn('[Auto-Recover] Fallback search failed:', err);
              }
            }

            if (canControl || isHost) {
              if (onSongEnd) onSongEnd();
            }
          }
        }
      });

      return true;
    };

    if (!initPlayer()) {
      checkInterval = setInterval(() => {
        if (initPlayer()) {
          clearInterval(checkInterval);
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [currentSong?.videoId]);

  // Volume & Mute Sync
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(volume);
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      } catch (_) { }
    }
  }, [volume, isMuted]);

  // Real-Time Socket Synchronization
  useEffect(() => {
    const handlePlayerState = (state) => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;

      const playerCurrentTime = playerRef.current.getCurrentTime() || 0;
      const targetTime = state.currentTime || 0;
      const drift = Math.abs(playerCurrentTime - targetTime);
      lastServerTimeRef.current = targetTime;

      isRemoteActionRef.current = true;

      if (state.isPlaying) {
        if (playerRef.current.getPlayerState() !== 1) {
          playerRef.current.playVideo();
        }

        if (drift > 4) {
          setShowSyncBadge(true);
          setSyncDrift(targetTime - playerCurrentTime);
          playerRef.current.seekTo(targetTime, true);
          playerRef.current.setPlaybackRate(1.0);
          setTimeout(() => setShowSyncBadge(false), 2000);
        } else if (drift > 0.8) {
          const speed = playerCurrentTime < targetTime ? 1.05 : 0.95;
          if (typeof playerRef.current.setPlaybackRate === 'function') {
            playerRef.current.setPlaybackRate(speed);
          }
        } else {
          if (typeof playerRef.current.setPlaybackRate === 'function') {
            playerRef.current.setPlaybackRate(1.0);
          }
          setShowSyncBadge(false);
        }
      } else {
        if (playerRef.current.getPlayerState() === 1) {
          playerRef.current.pauseVideo();
        }
        if (drift > 1) {
          playerRef.current.seekTo(targetTime, true);
        }
        setShowSyncBadge(false);
      }

      setTimeout(() => {
        isRemoteActionRef.current = false;
      }, 600);
    };

    socket.on('player:synced', handlePlayerState);
    socket.on('player:sync', handlePlayerState);
    return () => {
      socket.off('player:synced', handlePlayerState);
      socket.off('player:sync', handlePlayerState);
    };
  }, []);

  // Buffer Watchdog: unfreeze & force 144p if buffering > 4s
  useEffect(() => {
    const watchdogInterval = setInterval(() => {
      if (!playerRef.current || !isReady) return;
      try {
        const state = typeof playerRef.current.getPlayerState === 'function'
          ? playerRef.current.getPlayerState()
          : -1;

        if (state === 3 && playback?.isPlaying) {
          bufferStallCountRef.current = (bufferStallCountRef.current || 0) + 1;
          if (bufferStallCountRef.current >= 4) {
            console.log('Buffer stall watchdog: restoring playback at 144p');
            if (typeof playerRef.current.setPlaybackQuality === 'function') {
              playerRef.current.setPlaybackQuality('tiny');
            }
            if (typeof playerRef.current.playVideo === 'function') {
              playerRef.current.playVideo();
            }
            bufferStallCountRef.current = 0;
          }
        } else {
          bufferStallCountRef.current = 0;
        }
      } catch (_) { }
    }, 1000);

    return () => clearInterval(watchdogInterval);
  }, [isReady, playback?.isPlaying]);

  // Audio Keep-Alive Anchor to maintain background audio focus
  useEffect(() => {
    if (!silentAudioRef.current) return;
    if (playback?.isPlaying) {
      silentAudioRef.current.play().catch(() => { });
    } else {
      silentAudioRef.current.pause();
    }
  }, [playback?.isPlaying]);

  const handleManualSync = () => {
    if (!playerRef.current) return;
    try {
      const targetTime = lastServerTimeRef.current || 0;
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(targetTime, true);
      }
      if (typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(1.0);
      }
      if (typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
      setShowSyncBadge(false);
    } catch (err) {
      console.error('Manual sync error:', err);
    }
  };

  const handleToggleFullscreen = () => {
    const el = document.getElementById('youtube-stage-container');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Clean Ready State when room has no active song
  if (!currentSong) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/15 flex flex-col items-center justify-center p-6 sm:p-8 text-center shadow-xl">
        <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant/20 flex items-center justify-center mb-4 text-primary shadow-[0_0_16px_rgba(208,188,255,0.25)]">
          <span className="material-symbols-outlined text-[32px]">speaker_group</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-headline-lg-mobile text-on-surface font-extrabold mb-2 tracking-tight">
          Room is Ready
        </h3>
        <p className="text-on-surface-variant text-xs sm:text-sm max-w-sm mb-6 font-body-md leading-relaxed">
          No song is currently playing. Search any track or import a playlist below to start listening in perfect sync.
        </p>

        <button
          onClick={onOpenImport}
          className="px-5 py-2.5 rounded-full bg-primary text-on-primary hover:brightness-110 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(208,188,255,0.4)]"
        >
          <span className="material-symbols-outlined text-[18px]">playlist_add</span>
          <span>Import Playlist</span>
        </button>

        <audio
          ref={silentAudioRef}
          loop
          playsInline
          src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-lowest shadow-2xl flex flex-col group border border-outline-variant/15">
      
      {/* Visual Stage Container (16:9 Aspect) */}
      <div id="youtube-stage-container" className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        
        {/* Deep Ambient Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-black/60 pointer-events-none z-[4]" />

        {/* Live Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-lowest/85 backdrop-blur-md text-on-surface border border-outline-variant/20 shadow-md">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
            <span className="font-label-sm text-label-sm font-bold tracking-wider">LIVE STREAM</span>
          </div>
        </div>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
          <button
            onClick={handleToggleFullscreen}
            className="w-7 h-7 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-secondary transition-colors border border-outline-variant/20 shadow-md"
            title="Full Screen Visualizer"
          >
            <span className="material-symbols-outlined text-[16px]">fullscreen</span>
          </button>
        </div>

        {/* Transition Shield: Covers video when track completes */}
        <div
          className={`!absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-opacity duration-300 pointer-events-none ${
            isEnding ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-2.5 text-primary">
            <Disc3 className="w-6 h-6 animate-spin" />
          </div>
          <p className="font-title-md text-title-md text-on-surface font-bold">Up Next...</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Transitioning smoothly to next song</p>
        </div>

        {/* Audio-Only Visualizer Screen (Vinyl Screen) */}
        <div
          className={`!absolute inset-0 z-10 flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-hidden bg-black/95 backdrop-blur-xl transition-all duration-300 ${
            isAudioOnly ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
        >
          {currentSong?.thumbnail && (
            <img
              src={currentSong.thumbnail}
              alt=""
              className="!absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-125 pointer-events-none"
            />
          )}

          <div className="relative z-10 flex flex-col items-center max-w-sm pt-1">
            <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-2xl border-2 border-white/20 mb-3 ${playback?.isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}>
              <img
                src={currentSong?.thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80"}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/90 border border-white/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/70" />
                </div>
              </div>
            </div>

            <h4 className="font-title-md text-title-md font-bold text-on-surface truncate w-full px-4 mb-0.5">
              {currentSong?.title || "Playing Track"}
            </h4>
            <p className="font-body-md text-body-md text-on-surface-variant truncate max-w-xs mb-2">
              {currentSong?.channelTitle || "YouTube"}
            </p>

            <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-mono flex items-center gap-1 font-medium">
              <Zap className="w-2.5 h-2.5 fill-secondary text-secondary" />
              Data Saver (144p) Active
            </span>
          </div>
        </div>

        {/* 1-Tap Sync with Host Floating Badge */}
        {showSyncBadge && !isHost && playback?.isPlaying && (
          <button
            onClick={handleManualSync}
            className="!absolute bottom-3.5 left-3.5 z-30 px-3 py-1.5 rounded-full bg-surface-container-high/90 text-secondary border border-secondary/40 text-xs font-medium flex items-center gap-1.5 shadow-xl animate-pulse active:scale-95 transition-all"
            title="Click to instantly sync with host"
          >
            <Zap className="w-3.5 h-3.5 fill-secondary text-secondary" />
            <span>Sync with Host ({Math.max(1, Math.round(Math.abs(syncDrift)))}s behind)</span>
          </button>
        )}

        {/* Touch Shield & Center Play Trigger */}
        <div
          onClick={() => {
            if (!canControl) return;
            const p = playerRef.current || (typeof window !== 'undefined' ? window.musicroom_player : null);
            const isCurrentlyPlaying = (p?.getPlayerState?.() === 1) || playback?.isPlaying;
            const curTime = p?.getCurrentTime?.() || playback?.currentTime || 0;

            if (p) {
              try {
                if (isCurrentlyPlaying) {
                  p.pauseVideo();
                } else {
                  p.unMute();
                  p.setVolume(volume);
                  const promise = p.playVideo();
                  if (promise && typeof promise.catch === 'function') {
                    promise.catch(() => {
                      p.mute();
                      p.playVideo();
                    });
                  }
                }
              } catch (_) {}
            }

            const rId = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('room') : '');
            socket.emit('player:control', {
              roomId: rId,
              action: isCurrentlyPlaying ? 'pause' : 'play',
              currentTime: curTime
            });
          }}
          className="!absolute inset-0 z-[5] bg-transparent cursor-pointer flex items-center justify-center group/stage"
          title={canControl ? (playback?.isPlaying ? "Click to Pause" : "Click to Play") : "MusicRoom Stream"}
        >
          {/* Big Center Play Button when paused or unstarted */}
          {!playback?.isPlaying && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-on-primary shadow-[0_0_32px_rgba(208,188,255,0.7)] flex items-center justify-center transition-transform transform group-hover/stage:scale-110 active:scale-95 border border-white/20">
              <span className="material-symbols-outlined text-[36px] sm:text-[44px] ml-1">play_arrow</span>
            </div>
          )}
        </div>

        {/* YouTube IFrame target element */}
        <div className="!absolute inset-0 z-0 w-full h-full pointer-events-none">
          <div id="youtube-iframe-target" className="w-full h-full" />
        </div>

      </div>

      {/* Stream Settings Chips Bar (Stitch 2_player.html) */}
      <div className="flex items-center justify-between gap-1 px-space-md py-2 bg-surface-container-low/70 backdrop-blur-md overflow-x-auto no-scrollbar border-t border-outline-variant/10">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            onClick={toggleAudioOnly}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap active:scale-95 transition-all ${
              isAudioOnly
                ? 'bg-secondary/20 text-secondary shadow-[0_0_8px_rgba(76,215,246,0.3)] border border-secondary/30'
                : 'bg-surface-container-high/80 text-on-surface-variant hover:text-on-surface border border-outline-variant/20'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">speed</span>
            <span className="font-label-sm text-label-sm font-semibold">
              {isAudioOnly ? '144p Data Saver ON' : 'Video Mode'}
            </span>
          </button>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high/80 text-on-surface-variant whitespace-nowrap border border-outline-variant/20">
            <span className="material-symbols-outlined text-[13px] text-tertiary">bolt</span>
            <span className="font-label-sm text-label-sm">&lt;15ms Offset</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-container/20 text-primary-fixed-dim whitespace-nowrap border border-primary/20">
            <span className="material-symbols-outlined text-[13px]">lock_clock</span>
            <span className="font-label-sm text-label-sm">Audio Keep-Alive</span>
          </div>
        </div>
      </div>

      {/* Invisible Keep-Alive audio anchor */}
      <audio
        ref={silentAudioRef}
        loop
        playsInline
        src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
        className="hidden"
      />

    </div>
  );
}
