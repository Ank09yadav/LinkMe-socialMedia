// src/socket.js
import { io } from 'socket.io-client';

// Use your backend URL from environment variables or a default
const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

let socket = null;

export const initializeSocket = (userId) => {
  // Only create a new socket if one doesn't exist and we have a userId
  if (!socket && userId) {
    socket = io(URL, {
      // Pass the userId in the query to join the private room on the backend
      query: { userId },
      withCredentials: true,
    });
  }
};

export const getSocket = () => {
  if (!socket) {
    console.warn("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};