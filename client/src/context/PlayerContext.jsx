import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

const PlayerContext = createContext(null);

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

const DEFAULT_SONG = {
  videoId: 'XO8wew38VM8',
  title: 'Millionaire',
  channelTitle: 'Yo Yo Honey Singh',
  thumbnail: 'https://i.ytimg.com/vi/XO8wew38VM8/hqdefault.jpg',
  duration: 202
};

export function PlayerProvider({ children }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'search' | 'library' | 'playlist'
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [librarySubTab, setLibrarySubTab] = useState('liked'); // 'liked' | 'playlists' | 'history'
  const [selectedMood, setSelectedMood] = useState('Trending');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [menuSong, setMenuSong] = useState(null); // Song for [⋯] action menu
  const [playlistModalMode, setPlaylistModalMode] = useState(null); // 'create' | 'add_to_playlist'
  const [songToAddToPlaylist, setSongToAddToPlaylist] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Playback State
  const [currentSong, setCurrentSong] = useState(() => {
    try {
      const saved = localStorage.getItem('musicroom_current_song');
      return saved ? JSON.parse(saved) : DEFAULT_SONG;
    } catch {
      return DEFAULT_SONG;
    }
  });

  const [playback, setPlayback] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });

  const [volume, setVolume] = useState(() => {
    try {
      const v = localStorage.getItem('musicroom_volume');
      return v !== null ? Number(v) : 80;
    } catch {
      return 80;
    }
  });

  const [isMuted, setIsMuted] = useState(false);

  const [isAudioOnly, setIsAudioOnly] = useState(() => {
    try {
      return localStorage.getItem('musicroom_audio_only') === 'true';
    } catch {
      return false;
    }
  });

  const [radioMode, setRadioMode] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'

  // Synchronized Karaoke Lyrics State
  const [lyricsState, setLyricsState] = useState({
    loading: false,
    synced: false,
    lines: [],
    error: null,
    source: null
  });

  // Queue & Collections
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('musicroom_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('musicroom_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('musicroom_playlists');
      return saved ? JSON.parse(saved) : [
        {
          id: 'pl_favorites',
          name: 'My Vibe Playlist',
          createdAt: Date.now(),
          songs: []
        }
      ];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('musicroom_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('musicroom_recent_searches');
      return saved ? JSON.parse(saved) : ['Arijit Singh', 'Karan Aujla', 'Lo-Fi Chill', 'Diljit Dosanjh', 'The Weeknd'];
    } catch {
      return [];
    }
  });

  // Collaborative Party Room State
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomMessages, setRoomMessages] = useState([]);
  const [currentSocketId, setCurrentSocketId] = useState(socket.id || null);
  const [playingFrom, setPlayingFrom] = useState({ name: 'Trending Mix', type: 'playlist' });

  const isHost = activeRoom?.hostSocketId === currentSocketId;
  const canControl = !activeRoom || activeRoom.hostMode === 'friendly' || isHost;

  const playerRef = useRef(null);

  // Time Tracker: continuously keeps playback.currentTime and duration aligned
  useEffect(() => {
    const timer = setInterval(() => {
      const p = playerRef.current || (typeof window !== 'undefined' ? window.musicroom_player : null);
      if (p) {
        try {
          if (typeof p.getCurrentTime === 'function') {
            const cur = p.getCurrentTime() || 0;
            const dur = typeof p.getDuration === 'function' ? p.getDuration() || 0 : 0;
            setPlayback((prev) => ({
              ...prev,
              currentTime: cur,
              duration: dur > 0 ? dur : prev.duration
            }));
          }
        } catch (_) {}
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);

  // Synchronized Lyrics Fetcher
  const fetchLyrics = (song) => {
    const target = song || currentSong;
    if (!target || !target.title) return;
    setLyricsState({ loading: true, synced: false, lines: [], error: null, source: null });

    socket.emit('lyrics:get', {
      videoId: target.videoId,
      title: target.title,
      channelTitle: target.channelTitle,
      duration: target.duration || playback.duration
    }, (res) => {
      if (res?.success && Array.isArray(res.lines) && res.lines.length > 0) {
        setLyricsState({
          loading: false,
          synced: !!res.synced,
          lines: res.lines,
          error: null,
          source: res.source
        });
      } else {
        setLyricsState({
          loading: false,
          synced: false,
          lines: [],
          error: res?.error || 'Lyrics unavailable for this track',
          source: null
        });
      }
    });
  };

  // Pre-fetch lyrics automatically whenever currentSong changes
  useEffect(() => {
    if (currentSong?.videoId) {
      fetchLyrics(currentSong);
    }
  }, [currentSong?.videoId]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      if (currentSong) localStorage.setItem('musicroom_current_song', JSON.stringify(currentSong));
    } catch (_) {}
  }, [currentSong]);

  useEffect(() => {
    try {
      localStorage.setItem('musicroom_volume', String(volume));
    } catch (_) {}
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem('musicroom_audio_only', String(isAudioOnly));
    } catch (_) {}
  }, [isAudioOnly]);

  useEffect(() => {
    try {
      localStorage.setItem('musicroom_queue', JSON.stringify(queue));
    } catch (_) {}
  }, [queue]);

  useEffect(() => {
    try {
      localStorage.setItem('musicroom_liked_songs', JSON.stringify(likedSongs));
    } catch (_) {}
  }, [likedSongs]);

  useEffect(() => {
    try {
      localStorage.setItem('musicroom_playlists', JSON.stringify(playlists));
    } catch (_) {}
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem('musicroom_history', JSON.stringify(history.slice(0, 50)));
    } catch (_) {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('musicroom_recent_searches', JSON.stringify(recentSearches.slice(0, 15)));
    } catch (_) {}
  }, [recentSearches]);

  // Socket Connection and Room Event Handlers
  useEffect(() => {
    const handleConnect = () => setCurrentSocketId(socket.id);
    socket.on('connect', handleConnect);
    if (socket.connected) setCurrentSocketId(socket.id);

    const handleRoomMembers = (data) => {
      if (data?.members) setRoomMembers(data.members);
    };

    const handleChatMessage = (data) => {
      if (data?.message) setRoomMessages((prev) => [...prev, data.message]);
    };

    const handleQueueUpdated = (data) => {
      if (data?.queue) setQueue(data.queue);
    };

    const handleSongChanged = (data) => {
      if (data?.currentSong) {
        setCurrentSong(data.currentSong);
        setPlayback((prev) => ({
          ...prev,
          isPlaying: true,
          currentTime: 0
        }));
      }
      if (data?.playedHistory) {
        setHistory(data.playedHistory);
      }
    };

    const handlePlayerSynced = (data) => {
      if (data) {
        setPlayback((prev) => ({
          ...prev,
          isPlaying: data.isPlaying,
          currentTime: data.currentTime ?? prev.currentTime
        }));
      }
    };

    socket.on('room:members_updated', handleRoomMembers);
    socket.on('chat:message', handleChatMessage);
    socket.on('room:queue_updated', handleQueueUpdated);
    socket.on('player:song_changed', handleSongChanged);
    socket.on('player:synced', handlePlayerSynced);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room:members_updated', handleRoomMembers);
      socket.off('chat:message', handleChatMessage);
      socket.off('room:queue_updated', handleQueueUpdated);
      socket.off('player:song_changed', handleSongChanged);
      socket.off('player:synced', handlePlayerSynced);
    };
  }, []);

  // Playback Operations
  const playSong = (song, immediatePlay = true) => {
    if (!song || !song.videoId) return;

    // Push previous song to history if different
    if (currentSong && currentSong.videoId !== song.videoId) {
      setHistory((prev) => [currentSong, ...prev.filter((s) => s.videoId !== currentSong.videoId)].slice(0, 50));
    }

    if (activeRoom) {
      if (canControl) {
        socket.emit('player:change_song', {
          roomId: activeRoom.id,
          song,
          playNow: immediatePlay
        });
      }
    } else {
      setCurrentSong(song);
      setPlayback((prev) => ({
        ...prev,
        isPlaying: immediatePlay,
        currentTime: 0
      }));

      const p = playerRef.current || (typeof window !== 'undefined' ? window.musicroom_player : null);
      if (p) {
        try {
          if (typeof p.loadVideoById === 'function') {
            p.loadVideoById({ videoId: song.videoId, startSeconds: 0 });
            if (immediatePlay) {
              p.playVideo();
              setTimeout(() => {
                try {
                  if (typeof p.playVideo === 'function') p.playVideo();
                } catch (_) {}
              }, 300);
            }
          }
        } catch (_) {}
      }
    }
  };

  const togglePlayPause = () => {
    const nextPlaying = !playback.isPlaying;

    if (activeRoom) {
      if (canControl) {
        socket.emit('player:control', {
          roomId: activeRoom.id,
          action: nextPlaying ? 'play' : 'pause',
          currentTime: playback.currentTime
        });
      }
    } else {
      setPlayback((prev) => ({ ...prev, isPlaying: nextPlaying }));
      const p = playerRef.current || (typeof window !== 'undefined' ? window.musicroom_player : null);
      if (p) {
        try {
          if (nextPlaying) {
            p.playVideo();
          } else {
            p.pauseVideo();
          }
        } catch (_) {}
      }
    }
  };

  const seekTo = (seconds) => {
    if (activeRoom) {
      if (canControl) {
        socket.emit('player:control', {
          roomId: activeRoom.id,
          action: 'seek',
          currentTime: seconds
        });
      }
    } else {
      setPlayback((prev) => ({ ...prev, currentTime: seconds }));
      const p = playerRef.current || (typeof window !== 'undefined' ? window.musicroom_player : null);
      if (p && typeof p.seekTo === 'function') {
        try {
          p.seekTo(seconds, true);
        } catch (_) {}
      }
    }
  };

  const addToQueue = (song) => {
    if (!song || !song.videoId) return;
    if (activeRoom) {
      socket.emit('song:pick', {
        roomId: activeRoom.id,
        song,
        playNow: false
      });
    } else {
      setQueue((prev) => [...prev, song]);
    }
  };

  const playNext = (song) => {
    if (!song || !song.videoId) return;
    if (activeRoom) {
      socket.emit('song:pick', {
        roomId: activeRoom.id,
        song,
        playNow: false,
        playNext: true
      });
    } else {
      setQueue((prev) => [song, ...prev]);
    }
  };

  const removeFromQueue = (index) => {
    if (activeRoom) {
      socket.emit('queue:remove_item', {
        roomId: activeRoom.id,
        index
      });
    } else {
      setQueue((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  const reorderQueue = (fromIndex, toIndex) => {
    if (activeRoom) {
      socket.emit('queue:move_item', {
        roomId: activeRoom.id,
        fromIndex,
        toIndex
      });
    } else {
      setQueue((prev) => {
        const copy = [...prev];
        const [moved] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, moved);
        return copy;
      });
    }
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const startRadio = (song) => {
    const seed = song || currentSong;
    if (!seed || !seed.videoId) return;
    playSong(seed, true);
    setRadioMode(true);
    socket.emit('radio:get_tracks', { song: seed }, (res) => {
      if (res?.success && Array.isArray(res.tracks) && res.tracks.length > 0) {
        setQueue(res.tracks.filter((t) => t.videoId !== seed.videoId));
      }
    });
  };

  const nextSong = () => {
    if (repeatMode === 'one') {
      seekTo(0);
      return;
    }

    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue((prev) => prev.slice(1));
      playSong(nextTrack, true);
      return;
    }

    if (activeRoom) {
      socket.emit('queue:skip_next', { roomId: activeRoom.id });
    } else if (radioMode && currentSong) {
      // Endless Auto-Mix / Radio: fetch next related songs
      socket.emit('radio:get_tracks', { song: currentSong }, (res) => {
        if (res?.success && Array.isArray(res.tracks) && res.tracks.length > 0) {
          const unplayed = res.tracks.filter(
            (s) => s.videoId !== currentSong.videoId && !history.some((h) => h.videoId === s.videoId)
          );
          const next = unplayed.length > 0 ? unplayed[0] : res.tracks[0];
          // Queue the rest of the radio tracks for continuous play
          const remaining = unplayed.slice(1);
          if (remaining.length > 0) {
            setQueue(remaining);
          }
          playSong(next, true);
        } else {
          // Fallback to trending
          socket.emit('song:trending', { mood: selectedMood }, (res2) => {
            if (res2?.success && res2.songs && res2.songs.length > 0) {
              const next = res2.songs[Math.floor(Math.random() * res2.songs.length)];
              playSong(next, true);
            }
          });
        }
      });
    } else {
      setPlayback((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const prevSong = () => {
    if (playback.currentTime > 3) {
      seekTo(0);
      return;
    }
    if (history.length > 0) {
      const prevTrack = history[0];
      setHistory((prev) => prev.slice(1));
      playSong(prevTrack, true);
    } else {
      seekTo(0);
    }
  };

  // Liked Songs Management
  const isLiked = (videoId) => {
    if (!videoId) return false;
    return likedSongs.some((s) => s.videoId === videoId);
  };

  const toggleLike = (song) => {
    if (!song || !song.videoId) return;
    setLikedSongs((prev) => {
      const exists = prev.some((s) => s.videoId === song.videoId);
      if (exists) {
        return prev.filter((s) => s.videoId !== song.videoId);
      } else {
        return [song, ...prev];
      }
    });
  };

  // Playlists Management
  const createPlaylist = (name) => {
    if (!name || !name.trim()) return null;
    const newPl = {
      id: 'pl_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      createdAt: Date.now(),
      songs: []
    };
    setPlaylists((prev) => [newPl, ...prev]);
    return newPl;
  };

  const addSongToPlaylist = (playlistId, song) => {
    if (!playlistId || !song || !song.videoId) return;
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          if (pl.songs.some((s) => s.videoId === song.videoId)) return pl;
          return { ...pl, songs: [...pl.songs, song] };
        }
        return pl;
      })
    );
  };

  const removeSongFromPlaylist = (playlistId, videoId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, songs: pl.songs.filter((s) => s.videoId !== videoId) };
        }
        return pl;
      })
    );
  };

  const deletePlaylist = (playlistId) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
  };

  const playPlaylist = (playlist, shuffle = false) => {
    if (!playlist || !playlist.songs || playlist.songs.length === 0) return;
    let list = [...playlist.songs];
    if (shuffle) {
      list = list.sort(() => Math.random() - 0.5);
    }
    const [first, ...rest] = list;
    setPlayingFrom({
      name: playlist.name || 'My Playlist',
      type: 'playlist'
    });
    setQueue(rest);
    playSong(first, true);
  };

  const playFromCollection = (songs, startIndex = 0, collectionName = 'Playlist') => {
    if (!Array.isArray(songs) || songs.length === 0) return;
    const idx = Math.max(0, Math.min(songs.length - 1, startIndex));
    const target = songs[idx];
    const upNext = songs.slice(idx + 1);

    setPlayingFrom({
      name: collectionName || 'Playlist',
      type: 'collection'
    });
    setQueue(upNext);
    playSong(target, true);
  };

  const openPlaylist = (playlist) => {
    if (!playlist) return;
    setSelectedPlaylist(playlist);
    setActiveTab('playlist');
  };

  // Search History
  const addRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 15));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Toggle helpers
  const toggleAudioOnly = () => setIsAudioOnly((prev) => !prev);
  const toggleRadio = () => setRadioMode((prev) => !prev);
  const toggleShuffle = () => setIsShuffled((prev) => !prev);
  const cycleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const openSongMenu = (song) => setMenuSong(song);
  const closeSongMenu = () => setMenuSong(null);

  const openAddToPlaylistModal = (song) => {
    setSongToAddToPlaylist(song);
    setPlaylistModalMode('add_to_playlist');
  };

  // Party Room Join / Leave
  const joinPartyRoom = (roomData, socketId) => {
    setActiveRoom(roomData);
    if (socketId) setCurrentSocketId(socketId);
    if (roomData.currentSong) {
      setCurrentSong(roomData.currentSong);
      setPlayback({
        isPlaying: roomData.playback?.isPlaying || false,
        currentTime: roomData.playback?.currentTime || 0,
        duration: 0
      });
    }
    if (roomData.queue) setQueue(roomData.queue);
    if (roomData.members) setRoomMembers(roomData.members);
    if (roomData.messages) setRoomMessages(roomData.messages);
    setIsPartyModalOpen(false);
  };

  const leavePartyRoom = () => {
    socket.emit('room:leave');
    setActiveRoom(null);
    setRoomMembers([]);
    setRoomMessages([]);
    setIsPartyModalOpen(false);
    setIsChatDrawerOpen(false);
  };

  const value = {
    // Nav
    activeTab,
    setActiveTab,
    librarySubTab,
    setLibrarySubTab,
    selectedMood,
    setSelectedMood,
    isFullScreen,
    setIsFullScreen,
    isQueueOpen,
    setIsQueueOpen,
    isPartyModalOpen,
    setIsPartyModalOpen,
    isChatDrawerOpen,
    setIsChatDrawerOpen,
    menuSong,
    openSongMenu,
    closeSongMenu,
    playlistModalMode,
    setPlaylistModalMode,
    songToAddToPlaylist,
    openAddToPlaylistModal,
    isImportModalOpen,
    setIsImportModalOpen,
    searchQuery,
    setSearchQuery,

    // Playback
    currentSong,
    playback,
    setPlayback,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isAudioOnly,
    toggleAudioOnly,
    radioMode,
    toggleRadio,
    isShuffled,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
    playerRef,

    // Controls
    playSong,
    togglePlayPause,
    seekTo,
    nextSong,
    prevSong,
    startRadio,

    // Lyrics
    lyricsState,
    fetchLyrics,

    // Queue
    queue,
    addToQueue,
    playNext,
    removeFromQueue,
    reorderQueue,
    clearQueue,

    // Liked & Playlists & History
    likedSongs,
    isLiked,
    toggleLike,
    playlists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    playPlaylist,
    playingFrom,
    setPlayingFrom,
    playFromCollection,
    selectedPlaylist,
    setSelectedPlaylist,
    openPlaylist,
    history,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,

    // Party Room
    activeRoom,
    roomMembers,
    roomMessages,
    isHost,
    canControl,
    joinPartyRoom,
    leavePartyRoom
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
