import { io } from 'socket.io-client';

// Connect with no URL in production (or Vite proxy), fallback to :3000 if direct
const URL = import.meta.env.PROD 
  ? undefined 
  : (window.location.port === '5173' ? 'http://localhost:3000' : undefined);

export const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

