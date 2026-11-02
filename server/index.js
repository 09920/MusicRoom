// server/index.js
require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const roomManager = require('./roomManager');
const playlistParser = require('./playlistParser');
const searchService = require('./searchService');
const autoModeService = require('./autoModeService');

const app = express();
const server = http.createServer(app);

// Cross-origin setup for dev and production
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Search API endpoint (with caching)
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json({ results: [] });
    }
    const results = await searchService.searchSongs(query, process.env.YOUTUBE_API_KEY);
    res.json({ results });
  } catch (err) {
    console.error('Search endpoint error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Check if room exists and if it requires a PIN
app.get('/api/room/:roomId', (req, res) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    id: room.id,
    name: room.name,
    hasPin: Boolean(room.pin),
    hostMode: room.hostMode,
    memberCount: room.members.length
  });
});

// Serve frontend build if available (for production / Render)
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Active background imports map: socketId -> AbortController
const activeImports = new Map();

// WebSockets Connection Logic
io.on('connection', (socket) => {
  let currentRoomId = null;

  const resolveRoomId = (payload) => {
    const rid = payload?.roomId || currentRoomId;
    if (rid && rid !== currentRoomId) {
      currentRoomId = rid;
      socket.join(rid);
    }
    return currentRoomId;
  };

  // Re-link socket to room upon network reconnect or app foregrounding
  socket.on('room:reconnect', (payload, callback) => {
    const rid = resolveRoomId(payload);
    if (!rid) {
      if (typeof callback === 'function') callback({ success: false, error: 'No room ID' });
      return;
    }
    const result = roomManager.reconnectMember(rid, payload || {}, socket.id);
    if (!result || !result.room) {
      if (typeof callback === 'function') callback({ success: false, error: 'Room expired or closed' });
      return;
    }

    currentRoomId = result.room.id;
    socket.join(result.room.id);

    // Sync clean deduplicated members list to all devices in the room
    io.in(result.room.id).emit('room:member_joined', {
      member: result.member,
      members: result.room.members,
      message: null // Transparent reconnect without toast spam
    });

    const state = roomManager.getPublicRoomState(result.room);
    if (typeof callback === 'function') {
      callback({ success: true, room: state });
    }
  });

  // 1. Create Room
  socket.on('room:create', (payload, callback) => {
    try {
      const { name, hostName, pin, hostMode, mood, userId } = payload || {};
      const room = roomManager.createRoom(
        { name, hostName, pin, hostMode, mood, userId },
        socket.id
      );

      currentRoomId = room.id;
      socket.join(room.id);

      const state = roomManager.getPublicRoomState(room);
      if (typeof callback === 'function') {
        callback({ success: true, room: state });
      }
    } catch (err) {
      console.error('Error creating room:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Failed to create room' });
      }
    }
  });

  // 2. Join Room
  socket.on('room:join', (payload, callback) => {
    try {
      const { roomId, name, pin, userId } = payload || {};
      const result = roomManager.joinRoom(roomId, { name, pin, userId }, socket.id);

      if (result.error) {
        if (typeof callback === 'function') {
          callback({ success: false, error: result.error });
        }
        return;
      }

      currentRoomId = result.room.id;
      socket.join(result.room.id);

      const state = roomManager.getPublicRoomState(result.room);

      // Reply to joining user with full current room state (including calculated playback position)
      if (typeof callback === 'function') {
        callback({ success: true, room: state, yourSocketId: socket.id });
      }

      // Notify others in the room
      const joinedMember = result.room.members.find(m => m.id === socket.id);
      socket.to(result.room.id).emit('room:member_joined', {
        member: joinedMember,
        members: result.room.members,
        message: `${joinedMember?.name || 'A friend'} joined the room`
      });
    } catch (err) {
      console.error('Error joining room:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Failed to join room' });
      }
    }
  });

  // 3. Playback Control (Play, Pause, Seek)
  socket.on('player:control', (payload) => {
    const rid = resolveRoomId(payload);
    if (!rid) return;

    const { action, currentTime } = payload || {};
    const result = roomManager.updatePlayback(rid, socket.id, {
      action,
      currentTime
    });

    if (result.error) {
      socket.emit('room:toast', { type: 'error', message: result.error });
      return;
    }

    // Broadcast playback change to ALL members in the room (including sender)
    io.in(rid).emit('player:synced', {
      action: result.action,
      currentTime: result.currentTime,
      isPlaying: result.isPlaying,
      actorName: result.actorName,
      lastUpdated: result.room.playback.lastUpdated
    });
  });

  // 4. Change Song / Play Now
  socket.on('player:change_song', (payload) => {
    const rid = resolveRoomId(payload);
    const song = payload?.song || payload;
    if (!rid || !song || !song.videoId) return;

    const result = roomManager.changeSong(rid, socket.id, song);
    if (result.error) {
      socket.emit('room:toast', { type: 'error', message: result.error });
      return;
    }

    // Broadcast new song to all members in the room
    io.in(rid).emit('player:song_changed', {
      currentSong: result.song,
      actorName: result.actorName,
      playedHistory: result.room.playedHistory || [],
      playback: {
        isPlaying: true,
        currentTime: 0,
        lastUpdated: result.room.playback.lastUpdated
      }
    });
  });

  // Cancel in-flight playlist import
  socket.on('playlist:cancel_import', () => {
    if (activeImports.has(socket.id)) {
      try {
        activeImports.get(socket.id).abort();
      } catch {}
      activeImports.delete(socket.id);
    }
  });

  // 4b. Import Playlist (YouTube or Spotify)
  socket.on('playlist:import', async (payload, callback) => {
    const rid = resolveRoomId(payload);
    if (!rid) return;

    const importAbort = new AbortController();
    activeImports.set(socket.id, importAbort);

    try {
      const { url } = payload || {};
      if (!url || typeof url !== 'string') {
        if (typeof callback === 'function') callback({ success: false, error: 'Please enter a valid link' });
        activeImports.delete(socket.id);
        return;
      }

      const ytPlaylistId = playlistParser.extractYouTubePlaylistId(url);
      const spotifyPlaylistId = playlistParser.extractSpotifyPlaylistId(url);

      let songs = [];
      let spotifyTracks = null;

      if (ytPlaylistId) {
        songs = await playlistParser.fetchYouTubePlaylist(ytPlaylistId, process.env.YOUTUBE_API_KEY);
      } else if (spotifyPlaylistId) {
        spotifyTracks = await playlistParser.fetchSpotifyPlaylist(spotifyPlaylistId);
        if (!spotifyTracks || spotifyTracks.length === 0) {
          if (typeof callback === 'function') {
            callback({ success: false, error: 'No songs found in this Spotify playlist.' });
          }
          activeImports.delete(socket.id);
          return;
        }

        // Fast parallel resolution of first 6 tracks for immediate playback (< 2 seconds)
        const initialBatch = spotifyTracks.slice(0, 6);
        const resolvedInitial = await Promise.all(
          initialBatch.map(track => {
            const query = `${track.title} ${track.subtitle || ''}`;
            return playlistParser.searchYouTubeVideo(query, process.env.YOUTUBE_API_KEY).catch(() => null);
          })
        );

        songs = resolvedInitial.filter(Boolean);

        // Fallback retry if first batch had few matches
        if (songs.length < 2 && spotifyTracks.length > 6) {
          const nextBatch = spotifyTracks.slice(6, 12);
          const nextResolved = await Promise.all(
            nextBatch.map(track => {
              const query = `${track.title} ${track.subtitle || ''}`;
              return playlistParser.searchYouTubeVideo(query, process.env.YOUTUBE_API_KEY).catch(() => null);
            })
          );
          songs.push(...nextResolved.filter(Boolean));
        }
      } else {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Unrecognized playlist URL. Must be YouTube or Spotify playlist link.' });
        }
        activeImports.delete(socket.id);
        return;
      }

      if (!songs || songs.length === 0) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'No playable songs found. Please check that the playlist is public.' });
        }
        activeImports.delete(socket.id);
        return;
      }

      // Add to room queue
      const addResult = roomManager.addSongsToQueue(currentRoomId, socket.id, songs);
      if (addResult.error) {
        if (typeof callback === 'function') callback({ success: false, error: addResult.error });
        activeImports.delete(socket.id);
        return;
      }

      // If room is fresh/idle, start the first song from the imported playlist
      const currentRoom = roomManager.getRoom(currentRoomId);
      if (currentRoom && (!currentRoom.currentSong || !currentRoom.playback.isPlaying) && addResult.queue.length > 0) {
        const nextSongResult = roomManager.playNextInQueue(currentRoomId);
        if (nextSongResult && nextSongResult.room) {
          io.in(currentRoomId).emit('player:song_changed', {
            currentSong: nextSongResult.room.currentSong,
            actorName: addResult.addedBy,
            playedHistory: nextSongResult.room.playedHistory || [],
            playback: nextSongResult.room.playback
          });
        }
      }

      // Broadcast updated queue to everyone in the room
      io.in(currentRoomId).emit('room:queue_updated', {
        queue: addResult.room.queue
      });

      // Stream remaining tracks (up to 100 songs) in small polite batches silently
      if (spotifyTracks && spotifyTracks.length > 6) {
        const remainingTracks = spotifyTracks.slice(6, 100);
        (async () => {
          const BATCH_SIZE = 4;
          for (let i = 0; i < remainingTracks.length; i += BATCH_SIZE) {
            if (importAbort.signal.aborted) break; // User canceled import
            const activeRoom = roomManager.getRoom(currentRoomId);
            if (!activeRoom) break; // Room was closed or left

            const chunk = remainingTracks.slice(i, i + BATCH_SIZE);
            const chunkResolved = await Promise.all(
              chunk.map(track => {
                const query = `${track.title} ${track.subtitle || ''}`;
                return playlistParser.searchYouTubeVideo(query, process.env.YOUTUBE_API_KEY).catch(() => null);
              })
            );

            if (importAbort.signal.aborted) break;

            const validChunk = chunkResolved.filter(Boolean);
            if (validChunk.length > 0) {
              const appendRes = roomManager.addSongsToQueue(currentRoomId, socket.id, validChunk);
              if (appendRes && appendRes.room) {
                // Silently push updated queue without popup messages
                io.in(currentRoomId).emit('room:queue_updated', {
                  queue: appendRes.room.queue
                });
              }
            }

            await new Promise(r => setTimeout(r, 650));
          }
        })().catch(bgErr => console.warn('Background playlist loading notice:', bgErr.message))
          .finally(() => activeImports.delete(socket.id));
      } else {
        activeImports.delete(socket.id);
      }

      if (typeof callback === 'function') {
        const isStreaming = spotifyTracks && spotifyTracks.length > 6;
        callback({ 
          success: true, 
          count: songs.length,
          message: isStreaming 
            ? `Added first ${songs.length} songs! Resolving remaining tracks into queue...`
            : `Added ${songs.length} songs to queue`
        });
      }
    } catch (err) {
      activeImports.delete(socket.id);
      console.error('Playlist import failed:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message || 'Failed to import playlist' });
      }
    }
  });

  // 4c. Play specific song from queue
  socket.on('queue:play_item', (payload) => {
    const rid = resolveRoomId(payload);
    if (!rid) return;
    const { queueId } = payload || {};
    const result = roomManager.playQueueItem(rid, socket.id, queueId);

    if (result.error) {
      socket.emit('room:toast', { type: 'error', message: result.error });
      return;
    }

    io.in(rid).emit('player:song_changed', {
      currentSong: result.song,
      actorName: result.actorName,
      playedHistory: result.room.playedHistory || [],
      playback: result.room.playback
    });

    io.in(rid).emit('room:queue_updated', {
      queue: result.queue
    });
  });

  // 4d. Skip to next song in queue OR auto-pick if queue empty
  socket.on('queue:skip_next', async (payload) => {
    const rid = resolveRoomId(payload);
    if (!rid) return;
    const room = roomManager.getRoom(rid);
    if (!room) return;

    // Check permissions
    if (!roomManager.canControlMusic(room, socket.id)) {
      socket.emit('room:toast', { type: 'error', message: 'Only host can skip in Single Host mode' });
      return;
    }

    // 1. If queue has songs, play next
    if (room.queue.length > 0) {
      const nextSongResult = roomManager.playNextInQueue(rid);
      if (nextSongResult && nextSongResult.room) {
        io.in(rid).emit('player:song_changed', {
          currentSong: nextSongResult.room.currentSong,
          actorName: 'Next in Queue',
          playedHistory: nextSongResult.room.playedHistory || [],
          playback: nextSongResult.room.playback
        });
        io.in(rid).emit('room:queue_updated', {
          queue: nextSongResult.room.queue
        });
      }
      return;
    }

    // 2. If queue is empty and Auto Mode (Radio) is ON, auto-pick next song!
    if (room.autoMode) {
      io.in(rid).emit('room:toast', { type: 'info', message: '📻 Radio is picking next song...' });
      const autoSong = await autoModeService.pickNextSong(room, process.env.YOUTUBE_API_KEY);

      if (autoSong) {
        const changeResult = roomManager.changeSong(rid, room.hostSocketId, autoSong);
        io.in(rid).emit('player:song_changed', {
          currentSong: changeResult.song,
          actorName: '📻 Radio Auto-Pick',
          playedHistory: changeResult.room.playedHistory || [],
          playback: changeResult.room.playback
        });
        io.in(rid).emit('room:toast', {
          type: 'success',
          message: `📻 Radio picked: ${autoSong.title}`
        });
        return;
      }
    }

    // 3. Queue empty & Auto mode off
    socket.emit('room:toast', { type: 'info', message: 'No more songs in queue! Turn on Radio or add songs.' });
  });

  // 4d-2. Toggle Auto Mode (Radio)
  socket.on('room:toggle_automode', async (payload) => {
    const rid = resolveRoomId(payload);
    if (!rid) return;
    const result = roomManager.toggleAutoMode(rid, socket.id);
    if (result.error) {
      socket.emit('room:toast', { type: 'error', message: result.error });
      return;
    }

    io.in(rid).emit('room:automode_updated', {
      autoMode: result.autoMode,
      message: `${result.actorName} turned Radio ${result.autoMode ? 'ON' : 'OFF'}`
    });

    // If Radio was enabled and room is currently idle (no song & empty queue), start playing immediately!
    const room = roomManager.getRoom(rid);
    if (result.autoMode && room && !room.currentSong && room.queue.length === 0) {
      io.in(rid).emit('room:toast', { type: 'info', message: '📻 Radio is starting the session...' });
      const autoSong = await autoModeService.pickNextSong(room, process.env.YOUTUBE_API_KEY);
      if (autoSong) {
        const changeResult = roomManager.changeSong(rid, room.hostSocketId, autoSong);
        io.in(rid).emit('player:song_changed', {
          currentSong: changeResult.song,
          actorName: '📻 Radio Auto-Pick',
          playedHistory: changeResult.room.playedHistory || [],
          playback: changeResult.room.playback
        });
        io.in(rid).emit('room:toast', {
          type: 'success',
          message: `📻 Radio picked: ${autoSong.title}`
        });
      }
    }
  });

  // 4d-3. In-Room Live Chat Message
  socket.on('chat:send', (payload) => {
    const rid = resolveRoomId(payload);
    if (!rid) return;
    const { text } = payload || {};
    const result = roomManager.addChatMessage(rid, socket.id, text);

    if (result.error) {
      socket.emit('room:toast', { type: 'error', message: result.error });
      return;
    }

    // Broadcast new chat message to everyone in the room
    io.in(rid).emit('chat:message', {
      message: result.message
    });
  });

  // 4e. Remove song from queue
  socket.on('queue:remove_item', (payload) => {
    const rid = resolveRoomId(payload);
    if (!rid) return;
    const { queueId } = payload || {};
    const result = roomManager.removeFromQueue(rid, socket.id, queueId);

    if (result.error) {
      socket.emit('room:toast', { type: 'error', message: result.error });
      return;
    }

    io.in(rid).emit('room:queue_updated', {
      queue: result.queue
    });
  });

  // 4f. Socket-based Song Search
  socket.on('song:search', async (payload, callback) => {
    try {
      const { query } = payload || {};
      const results = await searchService.searchSongs(query, process.env.YOUTUBE_API_KEY);
      if (typeof callback === 'function') {
        callback({ success: true, results });
      }
    } catch (err) {
      console.error('Socket search error:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: 'Search failed' });
      }
    }
  });

  // 4g. Pick Song from Search (Play Now or Add to Queue)
  socket.on('song:pick', (payload) => {
    const rid = resolveRoomId(payload);
    if (!rid) return;
    const { song, playNow } = payload || {};
    if (!song || !song.videoId) return;

    const result = roomManager.addSingleSong(rid, socket.id, song, playNow);
    if (result.error) {
      socket.emit('room:toast', { type: 'error', message: result.error });
      return;
    }

    if (result.playedNow) {
      // Broadcast new song
      io.in(rid).emit('player:song_changed', {
        currentSong: result.song,
        actorName: result.actorName,
        playedHistory: result.room.playedHistory || [],
        playback: result.room.playback
      });
      io.in(rid).emit('room:queue_updated', {
        queue: result.queue
      });
    } else {
      // Added to queue
      io.in(rid).emit('room:queue_updated', {
        queue: result.queue,
        message: `${result.actorName} added "${song.title}" to the queue`
      });
    }
  });

  // 5. Explicit Leave Room
  socket.on('room:leave', () => {
    if (currentRoomId) {
      const leaveResult = roomManager.leaveRoom(socket.id);
      socket.leave(currentRoomId);
      if (leaveResult && leaveResult.room) {
        io.in(currentRoomId).emit('room:member_left', {
          member: leaveResult.leftMember,
          members: leaveResult.room.members,
          message: `${leaveResult.leftMember?.name || 'A friend'} left the room`
        });
      }
      currentRoomId = null;
    }
  });

  // 6. Handle Disconnection
  socket.on('disconnect', () => {
    if (currentRoomId) {
      const leaveResult = roomManager.leaveRoom(socket.id);
      if (leaveResult && leaveResult.room) {
        io.in(currentRoomId).emit('room:member_left', {
          member: leaveResult.leftMember,
          members: leaveResult.room.members,
          message: `${leaveResult.leftMember?.name || 'A friend'} disconnected`
        });
      }
    }
  });
});

// Periodic Sync Heartbeat (every 10 seconds) to counter audio drift
setInterval(() => {
  const activeRooms = roomManager.getAllActiveRooms();
  for (const [roomId, room] of activeRooms) {
    if (room.members.length > 0 && room.playback.isPlaying) {
      const currentTime = roomManager.getCurrentPlaybackTime(room);
      io.in(roomId).emit('player:heartbeat', {
        currentTime,
        isPlaying: room.playback.isPlaying,
        timestamp: Date.now()
      });
    }
  }
}, 10000);

// Client fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('MusicRoom API Server is running. Client build not found.');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎶 MusicRoom Server running on http://localhost:${PORT}`);
});
