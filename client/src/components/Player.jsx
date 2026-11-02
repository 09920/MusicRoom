import React, { useEffect, useRef, useState } from 'react';
import { socket } from '../socket';
import { Music2, Plus, Sparkles } from 'lucide-react';

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

  // Initialize YouTube Player only when currentSong is present
  useEffect(() => {
    if (!currentSong?.videoId) return;

    let checkInterval = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return false;
      const targetElement = document.getElementById('youtube-iframe-target');
      if (!targetElement) return false;

      // If player already exists, load new video instead of re-instantiating
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
              // Video ended -> trigger next in queue
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

  // Volume & Mute adjustments
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

  // Socket sync listeners
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
        console.error('Player sync execution error:', err);
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

  // If no song is loaded yet, show the clean "Fresh Start" screen
  if (!currentSong) {
    return (
      <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950/20 border border-zinc-800 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 shadow-inner">
          <Music2 className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
        </div>

        <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
          Room is Ready
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
          No song is currently playing. Import your favorite YouTube or Spotify playlist to kick off the listening session!
        </p>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Import Playlist
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-zinc-800/80 group">
      <div id="youtube-iframe-target" className="w-full h-full pointer-events-none" />
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
}
