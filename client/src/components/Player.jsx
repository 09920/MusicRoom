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

  // Active Time & Duration Tracker to ensure UI progress bar starts and ticks smoothly
  useEffect(() => {
    const timeTracker = setInterval(() => {
      const p = playerRef.current || playerRefOut?.current || (typeof window !== 'undefined' ? window.musicroom_player : null);
      if (p && typeof p.getCurrentTime === 'function') {
        try {
          const cur = p.getCurrentTime() || 0;
          const dur = typeof p.getDuration === 'function' ? p.getDuration() || 0 : 0;
          const state = typeof p.getPlayerState === 'function' ? p.getPlayerState() : -1;
          
          if (onPlaybackChange) {
            onPlaybackChange({
              currentTime: cur,
              ...(dur > 0 ? { duration: dur } : {}),
              isPlaying: state === 1
            });
          }
        } catch (_) {}
      }
    }, 250);

    return () => clearInterval(timeTracker);
  }, [onPlaybackChange, playerRefOut]);

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
              // ONLY Host can trigger automatic track advance when video truly finishes!
              if (isHost && onSongEnd) {
                try {
                  // Guard: only advance if video played to near-end (dur > 10 and within 3s of end)
                  if (dur > 10 && cur >= dur - 3.5) {
                    onSongEnd();
                  }
                } catch (_) { }
              }
            }
          },
          onError: (event) => {
            console.warn('YouTube Player error:', event.data);
            // Advance to next track on any unplayable or restricted video (both in solo and room host)
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
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [currentSong?.videoId]);

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume);
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const handleSynced = (data) => {
      if (!playerRef.current || !isReady) return;
      isRemoteActionRef.current = true;

      try {
        const { action, currentTime, isPlaying } = data;
        lastServerTimeRef.current = currentTime;

        // Reset rate on explicit sync actions
        if (typeof playerRef.current.setPlaybackRate === 'function') {
          playerRef.current.setPlaybackRate(1.0);
        }

        if (action === 'play' || isPlaying) {
          playerRef.current.seekTo(currentTime, true);
          playerRef.current.playVideo();
        } else if (action === 'pause' || !isPlaying) {
          playerRef.current.pauseVideo();
          playerRef.current.seekTo(currentTime, true);
        } else if (action === 'seek') {
          playerRef.current.seekTo(currentTime, true);
        }
        setShowSyncBadge(false);
      } catch (err) {
        console.error('Player sync error:', err);
      } finally {
        setTimeout(() => {
          isRemoteActionRef.current = false;
        }, 300);
      }
    };

    const handleHeartbeat = (data) => {
      // Host is source of truth; never adjust host playback
      if (!playerRef.current || !isReady || isHost) return;
      try {
        if (typeof playerRef.current.getCurrentTime !== 'function') return;

        const state = typeof playerRef.current.getPlayerState === 'function'
          ? playerRef.current.getPlayerState()
          : -1;

        // CRITICAL GUARD: Never interrupt YouTube while it is actively downloading / buffering stream chunks!
        if (state === 3) return;

        const localTime = playerRef.current.getCurrentTime();
        const serverTime = data.currentTime;
        lastServerTimeRef.current = serverTime;
        const timeDiff = serverTime - localTime; // Positive = listener is behind host
        const drift = Math.abs(timeDiff);

        setSyncDrift(timeDiff);

        // 1. Tightly in sync (drift < 1.0s): keep normal 1.0x rate
        if (drift < 1.0) {
          setShowSyncBadge(false);
          if (typeof playerRef.current.getPlaybackRate === 'function') {
            if (playerRef.current.getPlaybackRate() !== 1.0) {
              playerRef.current.setPlaybackRate(1.0);
            }
          }
          return;
        }

        // 2. Minor drift (1.0s - 4.5s): Smooth Speed Catch-Up (NO skip cuts!)
        if (drift >= 1.0 && drift <= 4.5 && data.isPlaying) {
          setShowSyncBadge(false);
          if (typeof playerRef.current.setPlaybackRate === 'function') {
            if (timeDiff > 0) {
              // Listener is behind -> speed up slightly without audible pitch change
              playerRef.current.setPlaybackRate(1.08);
            } else {
              // Listener is slightly ahead -> slow down smoothly
              playerRef.current.setPlaybackRate(0.94);
            }
          }
          return;
        }

        // 3. Moderate drift (4.5s - 15s): Show 1-tap "Sync with Host" badge instead of harsh audio jump
        if (drift > 4.5) {
          setShowSyncBadge(true);
          // Only hard seek if listener is massively out of sync (> 15s) and currently playing
          if (drift > 15 && data.isPlaying) {
            playerRef.current.seekTo(serverTime, true);
            if (typeof playerRef.current.setPlaybackRate === 'function') {
              playerRef.current.setPlaybackRate(1.0);
            }
            if (state !== 1) {
              playerRef.current.playVideo();
            }
            setShowSyncBadge(false);
          }
        }
      } catch (err) {
        console.error('Heartbeat check error:', err);
      }
    };

    socket.on('player:synced', handleSynced);
    socket.on('player:heartbeat', handleHeartbeat);

    return () => {
      socket.off('player:synced', handleSynced);
      socket.off('player:heartbeat', handleHeartbeat);
    };
  }, [isReady, isHost]);

  // Buffer Watchdog: If YouTube stays stuck in state 3 (Buffering) for > 4.5 seconds, unfreeze & force 144p
  useEffect(() => {
    const watchdogInterval = setInterval(() => {
      if (!playerRef.current || !isReady) return;
      try {
        const state = typeof playerRef.current.getPlayerState === 'function'
          ? playerRef.current.getPlayerState()
          : -1;

        if (state === 3 && playback?.isPlaying) {
          bufferStallCountRef.current = (bufferStallCountRef.current || 0) + 1;
          // Stalled for ~4 seconds
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

  // Audio Keep-Alive Anchor to maintain Android OS background audio focus
  useEffect(() => {
    if (!silentAudioRef.current) return;
    if (playback?.isPlaying) {
      silentAudioRef.current.play().catch(() => { });
    } else {
      silentAudioRef.current.pause();
    }
  }, [playback?.isPlaying]);

  // HTML5 MediaSession API for Android Lockscreen & Notification Controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return;

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title || 'MusicRoom',
        artist: currentSong.channelTitle || 'Synchronized Room',
        album: 'MusicRoom Session',
        artwork: [
          { src: currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/hqdefault.jpg`, sizes: '512x512', type: 'image/jpeg' },
          { src: currentSong.thumbnail || `https://i.ytimg.com/vi/${currentSong.videoId}/mqdefault.jpg`, sizes: '320x180', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.playbackState = playback?.isPlaying ? 'playing' : 'paused';

      const setAction = (action, handler) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (_) { }
      };

      setAction('play', () => {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
        if (onPlaybackChange) onPlaybackChange({ isPlaying: true });
      });

      setAction('pause', () => {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
        if (onPlaybackChange) onPlaybackChange({ isPlaying: false });
      });

      setAction('nexttrack', () => {
        if (onSongEnd) onSongEnd();
      });

      setAction('previoustrack', () => {
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          const cur = playerRef.current.getCurrentTime() || 0;
          playerRef.current.seekTo(Math.max(0, cur - 10), true);
        }
      });

      setAction('seekto', (details) => {
        if (details.seekTime != null && playerRef.current && typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(details.seekTime, true);
        }
      });

      setAction('seekforward', (details) => {
        const delta = details.seekOffset || 10;
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          const cur = playerRef.current.getCurrentTime() || 0;
          playerRef.current.seekTo(cur + delta, true);
        }
      });

      setAction('seekbackward', (details) => {
        const delta = details.seekOffset || 10;
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          const cur = playerRef.current.getCurrentTime() || 0;
          playerRef.current.seekTo(Math.max(0, cur - delta), true);
        }
      });
    } catch (e) {
      console.warn('MediaSession initialization error:', e);
    }
  }, [currentSong?.videoId, currentSong?.title, currentSong?.channelTitle, playback?.isPlaying]);

  // Guard against background tab freeze or unexpected pause on tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (playback?.isPlaying && playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
          try {
            if (playerRef.current.getPlayerState() !== 1) {
              playerRef.current.playVideo();
            }
          } catch (_) { }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
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

  // Clean Liquid-Glass Fresh Start State
  if (!currentSong) {
    return (
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden liquid-glass flex flex-col items-center justify-center p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center mb-4 font-heading italic text-3xl text-white">
          m
        </div>

        <h3 className="text-2xl sm:text-4xl font-heading italic text-white mb-2 tracking-tight">
          Room is Ready
        </h3>
        <p className="text-white/60 text-xs sm:text-sm max-w-sm mb-6 font-body font-light leading-relaxed">
          No song is currently playing. Import a playlist or search any track to begin listening together.
        </p>

        <button
          onClick={onOpenImport}
          className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-white/10"
        >
          <Plus className="w-4 h-4" />
          Import Playlist
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
    <div className={`relative w-full ${isAudioOnly ? 'min-h-[295px] sm:min-h-[340px] aspect-auto sm:aspect-video' : 'aspect-video'} rounded-3xl overflow-hidden bg-black shadow-2xl liquid-glass group transition-all duration-300`}>
      {/* Audio / Video Mode Toggle Pill */}
      <button
        onClick={toggleAudioOnly}
        className="!absolute top-3.5 right-3.5 z-30 px-3 py-1.5 rounded-full liquid-glass-strong text-white/90 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xl active:scale-95 border border-white/10"
        title={isAudioOnly ? "Switch to Video Mode" : "Switch to Audio-Only Mode"}
      >
        {isAudioOnly ? (
          <>
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-300">Show Video</span>
          </>
        ) : (
          <>
            <Headphones className="w-3.5 h-3.5 text-white/70" />
            <span className="text-[11px] text-white/80">Audio Only</span>
          </>
        )}
      </button>

      {/* Transition Shield: Covers YouTube video when ending to completely hide YouTube's native watch-next grid */}
      <div
        className={`!absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl transition-opacity duration-300 pointer-events-none ${isEnding ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center mb-2.5">
          <Disc3 className="w-6 h-6 text-white/80 animate-spin" />
        </div>
        <p className="font-heading italic text-lg text-white">Up Next...</p>
        <p className="text-xs text-white/50 font-body">Transitioning smoothly to next song</p>
      </div>

      {/* Audio-Only Visualizer Screen (Overlay over video) */}
      <div
        className={`!absolute inset-0 z-10 flex flex-col items-center justify-center p-4 sm:p-6 text-center overflow-hidden bg-black/95 backdrop-blur-xl transition-all duration-300 ${isAudioOnly ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
          }`}
      >
        {/* Ambient blurred backdrop glow */}
        {currentSong?.thumbnail && (
          <img
            src={currentSong.thumbnail}
            alt=""
            className="!absolute inset-0 w-full h-full object-cover blur-3xl opacity-25 scale-125 pointer-events-none"
          />
        )}

        <div className="relative z-10 flex flex-col items-center max-w-sm pt-1">
          {/* Spinning vinyl artwork */}
          <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-2xl border-2 border-white/20 mb-3 ${playback?.isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}>
            <img
              src={currentSong?.thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80"}
              alt={currentSong?.title || "Track"}
              className="w-full h-full object-cover"
            />
            {/* Center vinyl hole */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/90 border border-white/30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/70" />
              </div>
            </div>
          </div>

          {/* Song title & channel */}
          <h4 className="font-heading italic text-lg sm:text-2xl text-white tracking-tight leading-tight truncate w-full px-4 mb-0.5">
            {currentSong?.title || "Playing Track"}
          </h4>
          <p className="text-xs text-white/60 font-body font-light truncate max-w-xs mb-2.5">
            {currentSong?.channelTitle || "YouTube"}
          </p>

          {/* Animated Equalizer Bars */}
          <div className="flex items-end justify-center gap-1.5 h-4 mb-2">
            <span className={`w-1 bg-white/80 rounded-full h-3 ${playback?.isPlaying ? 'animate-[bounce_1s_infinite_100ms]' : ''}`} />
            <span className={`w-1 bg-white/90 rounded-full h-4 ${playback?.isPlaying ? 'animate-[bounce_1s_infinite_300ms]' : ''}`} />
            <span className={`w-1 bg-white/70 rounded-full h-3.5 ${playback?.isPlaying ? 'animate-[bounce_1s_infinite_150ms]' : ''}`} />
            <span className={`w-1 bg-white/90 rounded-full h-4 ${playback?.isPlaying ? 'animate-[bounce_1s_infinite_400ms]' : ''}`} />
            <span className={`w-1 bg-white/80 rounded-full h-2.5 ${playback?.isPlaying ? 'animate-[bounce_1s_infinite_200ms]' : ''}`} />
          </div>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 font-medium">
              <Zap className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
              Data Saver (144p) Active
            </span>
          </div>
        </div>
      </div>

      {/* 1-Tap Sync with Host Floating Badge */}
      {showSyncBadge && !isHost && playback?.isPlaying && (
        <button
          onClick={handleManualSync}
          className="!absolute bottom-3.5 left-3.5 z-20 px-3 py-1.5 rounded-full liquid-glass-strong text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-medium flex items-center gap-1.5 shadow-xl animate-pulse active:scale-95 transition-all"
          title="Click to instantly sync with host"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Sync with Host ({Math.max(1, Math.round(Math.abs(syncDrift)))}s behind)</span>
        </button>
      )}

      {/* Touch Shield: Intercepts mobile touches to prevent YouTube iframe from stealing focus, showing pause icons, or popping native UI */}
      <div
        onClick={() => {
          if (canControl && onPlaybackChange) {
            const nextPlaying = !playback?.isPlaying;
            socket.emit('player:action', {
              action: nextPlaying ? 'play' : 'pause',
              currentTime: playerRef.current?.getCurrentTime ? playerRef.current.getCurrentTime() : 0
            });
          }
        }}
        className="!absolute inset-0 z-[5] bg-transparent cursor-pointer"
        title={canControl ? (playback?.isPlaying ? "Click to Pause" : "Click to Play") : "MusicRoom Stream"}
      />

      {/* YouTube IFrame container: STATIC props so React never interferes with the iframe */}
      <div className="!absolute inset-0 z-0 w-full h-full pointer-events-none">
        <div id="youtube-iframe-target" className="w-full h-full" />
      </div>

      {/* Invisible HTML5 Audio Keep-Alive Anchor to maintain Android OS background audio focus */}
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
