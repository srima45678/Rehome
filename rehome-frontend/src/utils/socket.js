// socket.js
// Creates a single Socket.io connection
// shared across the whole app
// Like a phone line that stays open

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Create socket instance
// autoConnect: false = we manually connect when user logs in
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling']
});

export default socket;