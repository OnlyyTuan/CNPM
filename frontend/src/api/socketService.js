import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api.config';

let socket = null; // The socket instance is now mutable

/**
 * Initializes a new socket connection.
 * If a socket already exists, it will be disconnected before creating a new one.
 * A new instance is created with the latest token from localStorage.
 */
const initSocket = () => {
  // If a socket instance exists, disconnect it to ensure a clean start
  if (socket) {
    socket.disconnect();
  }

  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Socket initialization failed: No token found.');
    return;
  }

  console.log('Initializing new socket connection...');
  socket = io(SOCKET_URL, {
    // autoConnect is true by default with io(), no need to call connect() explicitly
    auth: {
      token,
    },
  });

  // Setup base listeners for the new socket instance
  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });
};

/**
 * Disconnects and completely removes the socket instance.
 */
const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket instance has been disconnected and destroyed.');
  }
};

const on = (eventName, callback) => {
  if (socket) {
    socket.on(eventName, callback);
  } else {
    console.error(`Cannot attach listener for "${eventName}": Socket is not initialized.`);
  }
};

const off = (eventName, callback) => {
  if (socket) {
    socket.off(eventName, callback);
  }
};

const emit = (eventName, data) => {
  if (socket) {
    socket.emit(eventName, data);
  } else {
    console.error(`Cannot emit event "${eventName}": Socket is not initialized.`);
  }
};

const removeAllListeners = (eventName) => {
    if (socket) {
        socket.removeAllListeners(eventName);
    }
};

export default {
  initSocket,
  disconnect,
  on,
  off,
  emit,
  removeAllListeners,
};