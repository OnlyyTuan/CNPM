import { create } from "zustand";
import socketService from "../api/socketService";

const token = localStorage.getItem("token") || null;
const user = JSON.parse(localStorage.getItem("user")) || null;

const useAuthStore = create((set, get) => ({
  // Auth state
  token: token,
  user: user,
  isLoggedIn: !!token,
  role: user ? user.role : null,

  // Message cache state
  messageCache: {}, // { [otherUserId]: [messages] }

  // Auth actions
  login: ({ token, user }) => {
    // Store credentials in localStorage first, as socketService reads from it
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Update the state
    set({
      token: token,
      user: user,
      isLoggedIn: true,
      role: user.role,
    });

    // Now, initialize the socket connection and listeners with the new credentials
    socketService.initSocket();
    get().initializeSocketListeners();
  },

  logout: () => {
    socketService.disconnect(); // This now disconnects and destroys the socket instance
    set({
      token: null,
      user: null,
      isLoggedIn: false,
      role: null,
      messageCache: {}, // Clear cache on logout
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Message cache actions
  addMessageToCache: (message) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const otherUserId = message.senderId === currentUser.id ? message.recipientId : message.senderId;

    set((state) => {
      const existingMessages = state.messageCache[otherUserId] || [];
      // Avoid adding duplicates
      if (existingMessages.some((m) => m.id === message.id)) {
        return state;
      }
      const updatedMessages = [...existingMessages, message].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      return {
        messageCache: {
          ...state.messageCache,
          [otherUserId]: updatedMessages,
        },
      };
    });
  },

  // Action to load historical messages into the cache
  loadMessagesForDriver: (driverId, messages) => {
    set((state) => ({
      messageCache: {
        ...state.messageCache,
        [driverId]: messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
      },
    }));
  },

  // Action to initialize the global listener
  initializeSocketListeners: () => {
    // Ensure we don't attach the listener multiple times
    socketService.off('receive_message'); // Remove any existing listener first
    
    socketService.on('receive_message', (message) => {
      console.log('%c[Global Listener] Received message:', 'background: #222; color: #bada55', message);
      get().addMessageToCache(message);
    });
  },
}));

export default useAuthStore;
