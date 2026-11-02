import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { Plus } from 'lucide-react';

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
      <div id="youtube-iframe-target" className="w-full h-full pointer-events-none" />
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
}
