import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { Plus, Headphones, Video, Music2, Disc3 } from 'lucide-react';

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
  const [isReady, setIsReady] = useState(false);
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
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!currentSong?.videoId) return;

    let checkInterval = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return false;
      const targetElement = document.getElementById('youtube-iframe-target');
      if (!targetElement) return false;

      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId: currentSong.videoId,
          startSeconds: playback?.currentTime || 0
        });
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
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            if (playerRefOut) playerRefOut.current = event.target;
            
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();

            if (playback?.currentTime > 0) {
              event.target.seekTo(playback.currentTime, true);
            }
            if (playback?.isPlaying) {
              const playPromise = event.target.playVideo();
              if (playPromise && playPromise.catch) {
                playPromise.catch(() => {});
              }
            }
          },
          onStateChange: (event) => {
            if (event.data === 0) {
              if (onSongEnd) onSongEnd();
            }
          },
          onError: (event) => {
            console.warn('YouTube Player error:', event.data);
            if (event.data === 150 || event.data === 101) {
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
        if (action === 'play' || isPlaying) {
          playerRef.current.seekTo(currentTime, true);
          playerRef.current.playVideo();
        } else if (action === 'pause' || !isPlaying) {
          playerRef.current.pauseVideo();
          playerRef.current.seekTo(currentTime, true);
        } else if (action === 'seek') {
          playerRef.current.seekTo(currentTime, true);
        }
      } catch (err) {
        console.error('Player sync error:', err);
      } finally {
        setTimeout(() => {
          isRemoteActionRef.current = false;
        }, 300);
      }
    };

    const handleSongChanged = (data) => {
      if (!playerRef.current) return;
      try {
        if (typeof playerRef.current.loadVideoById === 'function') {
          playerRef.current.loadVideoById({
            videoId: data.currentSong.videoId,
            startSeconds: 0
          });
        }
      } catch (err) {
        console.error('Song change error:', err);
      }
    };

    const handleHeartbeat = (data) => {
      if (!playerRef.current || !isReady) return;
      try {
        if (typeof playerRef.current.getCurrentTime !== 'function') return;
        const localTime = playerRef.current.getCurrentTime();
        const serverTime = data.currentTime;
        const drift = Math.abs(localTime - serverTime);

        if (drift > 1.8) {
          playerRef.current.seekTo(serverTime, true);
          if (data.isPlaying && playerRef.current.getPlayerState() !== 1) {
            playerRef.current.playVideo();
          }
        }
      } catch (err) {
        console.error('Heartbeat check error:', err);
      }
    };

    socket.on('player:synced', handleSynced);
    socket.on('player:song_changed', handleSongChanged);
    socket.on('player:heartbeat', handleHeartbeat);

    return () => {
      socket.off('player:synced', handleSynced);
      socket.off('player:song_changed', handleSongChanged);
      socket.off('player:heartbeat', handleHeartbeat);
    };
  }, [isReady]);

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
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl liquid-glass group">
      {/* Audio / Video Mode Toggle Pill */}
      <button
        onClick={toggleAudioOnly}
        className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full liquid-glass-strong text-white/90 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xl active:scale-95 border border-white/10"
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

      {/* Audio-Only Visualizer Screen (Overlay over video) */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-black/95 backdrop-blur-xl transition-all duration-300 ${
          isAudioOnly ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* Ambient blurred backdrop glow */}
        {currentSong?.thumbnail && (
          <img
            src={currentSong.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-25 scale-125 pointer-events-none"
          />
        )}

        <div className="relative z-10 flex flex-col items-center max-w-sm">
          {/* Spinning vinyl artwork */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-2xl border-2 border-white/20 mb-4 animate-[spin_12s_linear_infinite]">
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
          <h4 className="font-heading italic text-xl sm:text-2xl text-white tracking-tight leading-tight truncate w-full px-4 mb-1">
            {currentSong?.title || "Playing Track"}
          </h4>
          <p className="text-xs text-white/60 font-body font-light truncate max-w-xs mb-3">
            {currentSong?.channelTitle || "YouTube"}
          </p>

          {/* Animated Equalizer Bars */}
          <div className="flex items-end justify-center gap-1.5 h-5 mb-2">
            <span className="w-1 bg-white/80 rounded-full animate-[bounce_1s_infinite_100ms] h-3" />
            <span className="w-1 bg-white/90 rounded-full animate-[bounce_1s_infinite_300ms] h-5" />
            <span className="w-1 bg-white/70 rounded-full animate-[bounce_1s_infinite_150ms] h-4" />
            <span className="w-1 bg-white/90 rounded-full animate-[bounce_1s_infinite_400ms] h-5" />
            <span className="w-1 bg-white/80 rounded-full animate-[bounce_1s_infinite_200ms] h-2.5" />
          </div>

          <span className="text-[10px] text-white/40 tracking-wider uppercase font-mono">
            Audio-Only Mode Active
          </span>
        </div>
      </div>

      {/* YouTube IFrame container: STATIC props so React never interferes with the iframe */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        <div id="youtube-iframe-target" className="w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-transparent pointer-events-none z-0" />
    </div>
  );
}
