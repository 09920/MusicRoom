// server/roomManager.js
const crypto = require('crypto');

// Generate readable random room ID like 'a8f3-91cd-77b2'
function generateRoomId() {
  const p1 = crypto.randomBytes(2).toString('hex');
  const p2 = crypto.randomBytes(2).toString('hex');
  const p3 = crypto.randomBytes(2).toString('hex');
  return `${p1}-${p2}-${p3}`;
}

// In-memory store for active rooms
const rooms = new Map();

class RoomManager {
  /**
   * Create a new room
   */
  createRoom({ name, hostName, pin = null, hostMode = 'friendly', mood = 'Hindi' }, hostSocketId) {
    const roomId = generateRoomId();

    const room = {
      id: roomId,
      name: name?.trim() || `${hostName}'s Room`,
      pin: pin ? String(pin).trim() : null,
      hostMode: hostMode === 'single' ? 'single' : 'friendly',
      mood: mood || 'Hindi',
      hostSocketId,
      createdAt: Date.now(),
      members: [
        {
          id: hostSocketId,
          name: hostName.trim() || 'Host',
          isHost: true,
          joinedAt: Date.now()
        }
      ],
      currentSong: null, // Fresh start: no default song
      playback: {
        isPlaying: false,
        currentTime: 0,
        lastUpdated: Date.now()
      },
      history: [],
      queue: [],
      messages: [], // In-room live chat messages
      autoMode: true, // Radio on by default
      emptyTimeout: null
    };

    rooms.set(roomId, room);
    return room;
  }

  /**
   * Get room by ID
   */
  getRoom(roomId) {
    if (!roomId) return null;
    return rooms.get(roomId.toLowerCase().trim()) || null;
  }

  /**
   * Get accurate current playback second
   */
  getCurrentPlaybackTime(room) {
    if (!room || !room.playback || !room.currentSong) return 0;
    if (!room.playback.isPlaying) {
      return room.playback.currentTime;
    }
    const elapsed = (Date.now() - room.playback.lastUpdated) / 1000;
    return Math.max(0, room.playback.currentTime + elapsed);
  }

  /**
   * Join an existing room
   */
  joinRoom(roomId, { name, pin }, socketId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return { error: 'Room not found' };
    }

    // Check PIN if room is protected
    if (room.pin && room.pin !== String(pin).trim()) {
      return { error: 'Incorrect PIN' };
    }

    // Room capacity limit (~10 people as specified in Section 8)
    if (room.members.length >= 15) {
      return { error: 'Room is full (max 15 listeners)' };
    }

    // Cancel empty room cleanup timer if active
    if (room.emptyTimeout) {
      clearTimeout(room.emptyTimeout);
      room.emptyTimeout = null;
    }

    // Check if user is already in members (e.g. reconnect)
    const existingIndex = room.members.findIndex(m => m.id === socketId);
    if (existingIndex !== -1) {
      room.members[existingIndex].name = name || room.members[existingIndex].name;
    } else {
      const isFirst = room.members.length === 0;
      room.members.push({
        id: socketId,
        name: name?.trim() || `Guest ${room.members.length + 1}`,
        isHost: isFirst,
        joinedAt: Date.now()
      });
      if (isFirst) {
        room.hostSocketId = socketId;
      }
    }

    return { room };
  }

  /**
   * Remove a member on disconnect or leave
   */
  leaveRoom(socketId) {
    for (const [roomId, room] of rooms.entries()) {
      const memberIndex = room.members.findIndex(m => m.id === socketId);
      if (memberIndex !== -1) {
        const leftMember = room.members[memberIndex];
        room.members.splice(memberIndex, 1);

        // If host left, reassign host to the next senior member if available
        if (room.hostSocketId === socketId && room.members.length > 0) {
          room.members[0].isHost = true;
          room.hostSocketId = room.members[0].id;
        }

        // If room is now empty, schedule auto-deletion after 15 minutes
        if (room.members.length === 0) {
          room.emptyTimeout = setTimeout(() => {
            rooms.delete(roomId);
          }, 15 * 60 * 1000);
        }

        return { room, leftMember };
      }
    }
    return null;
  }

  /**
   * Check if a socket has permission to control music
   */
  canControlMusic(room, socketId) {
    if (!room) return false;
    if (room.hostMode === 'friendly') return true;
    if (room.hostSocketId === socketId) return true;
    // Safe fallback: if only 1 listener is in the room, they are always the host
    if (room.members.length <= 1 && room.members.some(m => m.id === socketId)) {
      room.hostSocketId = socketId;
      return true;
    }
    return false;
  }

  /**
   * Update playback state (play, pause, seek)
   */
  updatePlayback(roomId, socketId, { action, currentTime }) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (!this.canControlMusic(room, socketId)) {
      return { error: 'Only the host can control playback in Single Host mode' };
    }

    const member = room.members.find(m => m.id === socketId);
    const actorName = member ? member.name : 'Someone';

    const now = Date.now();
    const time = typeof currentTime === 'number' && !isNaN(currentTime) ? Math.max(0, currentTime) : this.getCurrentPlaybackTime(room);

    if (action === 'play') {
      room.playback.isPlaying = true;
      room.playback.currentTime = time;
      room.playback.lastUpdated = now;
    } else if (action === 'pause') {
      room.playback.isPlaying = false;
      room.playback.currentTime = time;
      room.playback.lastUpdated = now;
    } else if (action === 'seek') {
      room.playback.currentTime = time;
      room.playback.lastUpdated = now;
    }

    return {
      room,
      action,
      actorName,
      currentTime: time,
      isPlaying: room.playback.isPlaying
    };
  }

  /**
   * Change current song
   */
  changeSong(roomId, socketId, song) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (!this.canControlMusic(room, socketId)) {
      return { error: 'Only the host can change songs in Single Host mode' };
    }

    const member = room.members.find(m => m.id === socketId);
    const actorName = member ? member.name : 'Someone';

    room.currentSong = {
      videoId: song.videoId,
      title: song.title || 'Untitled Video',
      channelTitle: song.channelTitle || '',
      thumbnail: song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`,
      duration: song.duration || 0
    };

    // Add to history (keep last 50 songs)
    room.history.unshift(song.videoId);
    if (room.history.length > 50) {
      room.history.pop();
    }

    // Reset playback to start of new song
    room.playback = {
      isPlaying: true,
      currentTime: 0,
      lastUpdated: Date.now()
    };

    return {
      room,
      song: room.currentSong,
      actorName
    };
  }

  /**
   * Add a single song to queue or play now
   */
  addSingleSong(roomId, socketId, song, playNow = false) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (!this.canControlMusic(room, socketId)) {
      return { error: 'Only the host can add or change songs in Single Host mode' };
    }

    const member = room.members.find(m => m.id === socketId);
    const actorName = member ? member.name : 'Someone';

    // If playNow requested OR room currently has no song loaded, play immediately
    if (playNow || !room.currentSong) {
      const changeResult = this.changeSong(roomId, socketId, song);
      return {
        playedNow: true,
        ...changeResult,
        queue: room.queue
      };
    }

    // Otherwise add to queue
    const queueItem = {
      queueId: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      videoId: song.videoId,
      title: song.title || 'Untitled Song',
      channelTitle: song.channelTitle || '',
      thumbnail: song.thumbnail || `https://i.ytimg.com/vi/${song.videoId}/hqdefault.jpg`,
      duration: song.duration || 0,
      addedBy: actorName
    };

    room.queue.push(queueItem);

    return {
      playedNow: false,
      room,
      song: queueItem,
      queue: room.queue,
      actorName
    };
  }

  /**
   * Add songs to room queue
   */
  addSongsToQueue(roomId, socketId, songs) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (!this.canControlMusic(room, socketId)) {
      return { error: 'Only the host can modify the queue in Single Host mode' };
    }

    const member = room.members.find(m => m.id === socketId);
    const addedBy = member ? member.name : 'Someone';

    const formattedSongs = songs.map((s, idx) => ({
      queueId: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      videoId: s.videoId,
      title: s.title || 'Untitled Song',
      channelTitle: s.channelTitle || '',
      thumbnail: s.thumbnail || `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg`,
      duration: s.duration || 0,
      addedBy
    }));

    room.queue.push(...formattedSongs);

    return {
      room,
      addedCount: formattedSongs.length,
      queue: room.queue,
      addedBy
    };
  }

  /**
   * Play a specific song from queue
   */
  playQueueItem(roomId, socketId, queueId) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (!this.canControlMusic(room, socketId)) {
      return { error: 'Only the host can change songs in Single Host mode' };
    }

    const index = room.queue.findIndex(item => item.queueId === queueId);
    if (index === -1) return { error: 'Song not found in queue' };

    const [selectedSong] = room.queue.splice(index, 1);
    const changeResult = this.changeSong(roomId, socketId, selectedSong);

    return {
      ...changeResult,
      queue: room.queue
    };
  }

  /**
   * Play the next song in the queue (e.g. when current song finishes)
   */
  playNextInQueue(roomId) {
    const room = this.getRoom(roomId);
    if (!room || room.queue.length === 0) return null;

    const nextSong = room.queue.shift();
    return this.changeSong(roomId, room.hostSocketId, nextSong);
  }

  /**
   * Remove an item from the queue
   */
  removeFromQueue(roomId, socketId, queueId) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (!this.canControlMusic(room, socketId)) {
      return { error: 'Only the host can modify the queue in Single Host mode' };
    }

    const index = room.queue.findIndex(item => item.queueId === queueId);
    if (index !== -1) {
      room.queue.splice(index, 1);
    }

    return { room, queue: room.queue };
  }

  /**
   * Clear the entire queue
   */
  clearQueue(roomId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (!this.canControlMusic(room, socketId)) {
      return { error: 'Only the host can modify the queue in Single Host mode' };
    }

    room.queue = [];
    return { room, queue: room.queue };
  }

  /**
   * Toggle Auto Mode (Radio)
   */
  toggleAutoMode(roomId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    if (!this.canControlMusic(room, socketId)) {
      return { error: 'Only the host can toggle Auto Mode in Single Host mode' };
    }

    room.autoMode = !room.autoMode;
    const member = room.members.find(m => m.id === socketId);
    const actorName = member ? member.name : 'Someone';

    return { room, autoMode: room.autoMode, actorName };
  }

  /**
   * Add a chat message
   */
  addChatMessage(roomId, socketId, text) {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Room not found' };

    const member = room.members.find(m => m.id === socketId);
    if (!member) return { error: 'Member not found' };

    const cleanText = text?.trim();
    if (!cleanText) return { error: 'Message cannot be empty' };

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: socketId,
      senderName: member.name,
      isHost: member.isHost,
      text: cleanText.slice(0, 300), // Max 300 characters
      timestamp: Date.now()
    };

    room.messages.push(message);
    if (room.messages.length > 50) {
      room.messages.shift(); // Keep last 50 messages
    }

    return { room, message };
  }

  /**
   * Get all active rooms map entries
   */
  getAllActiveRooms() {
    return Array.from(rooms.entries());
  }

  /**
   * Get public state for a room (safe to send over socket)
   */
  getPublicRoomState(room) {
    if (!room) return null;
    return {
      id: room.id,
      name: room.name,
      hasPin: Boolean(room.pin),
      hostMode: room.hostMode,
      mood: room.mood,
      autoMode: room.autoMode,
      hostSocketId: room.hostSocketId,
      members: room.members,
      currentSong: room.currentSong,
      playback: {
        isPlaying: room.playback.isPlaying,
        currentTime: this.getCurrentPlaybackTime(room),
        lastUpdated: room.playback.lastUpdated
      },
      queue: room.queue,
      messages: room.messages || []
    };
  }
}

module.exports = new RoomManager();
