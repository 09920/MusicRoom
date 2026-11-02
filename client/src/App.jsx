import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Home from './pages/Home';
import Room from './pages/Room';
import Navbar from './components/Navbar';

const getPersistentUserId = () => {
  try {
    let id = localStorage.getItem('musicroom_user_id');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('musicroom_user_id', id);
    }
    return id;
  } catch {
    return 'usr_' + Math.random().toString(36).substring(2, 9);
  }
};

export default function App() {
  const [userId] = useState(getPersistentUserId);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentSocketId, setCurrentSocketId] = useState(socket.id || null);
  const [initialRoomId, setInitialRoomId] = useState('');

  useEffect(() => {
    // 1. Detect query param ?room=xxxx or path /room/xxxx
    const params = new URLSearchParams(window.location.search);
    const roomFromQuery = params.get('room');
    if (roomFromQuery) {
      setInitialRoomId(roomFromQuery);
    } else {
      const pathParts = window.location.pathname.split('/');
      if (pathParts[1] === 'room' && pathParts[2]) {
        setInitialRoomId(pathParts[2]);
      }
    }

    // 2. Track socket connection
    const onConnect = () => {
      setCurrentSocketId(socket.id);
    };

    socket.on('connect', onConnect);
    if (socket.connected) {
      setCurrentSocketId(socket.id);
    }

    return () => {
      socket.off('connect', onConnect);
    };
  }, []);

  const handleRoomJoined = (roomData, socketId) => {
    setCurrentRoom(roomData);
    if (socketId) setCurrentSocketId(socketId);

    // Update URL without refreshing page
    window.history.pushState({}, '', `/?room=${roomData.id}`);
  };

  const handleLeaveRoom = () => {
    socket.emit('room:leave');
    setCurrentRoom(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-body">
      {currentRoom ? (
        <Room
          initialRoom={currentRoom}
          currentSocketId={currentSocketId}
          userId={userId}
          onLeaveRoom={handleLeaveRoom}
        />
      ) : (
        <Home
          onRoomJoined={handleRoomJoined}
          initialRoomId={initialRoomId}
          userId={userId}
        />
      )}
    </div>
  );
}

