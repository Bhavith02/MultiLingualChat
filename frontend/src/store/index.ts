import { create } from 'zustand';
import type { User, ChatRoom, Message } from '../types';
import { websocketService } from '../services/websocket';

interface AppStore {
  user: User | null;
  token: string | null;
  chatRooms: ChatRoom[];
  activeRoomId: number | null;
  messages: Record<number, Message[]>;
  typingUsers: Record<number, number[]>; // roomId -> userIds[]
  unreadCounts: Record<number, number>; // roomId -> count
  isSocketConnected: boolean;
  languageLearningMode: boolean; // Show both original and translated
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setChatRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (roomId: number | null) => void;
  setMessages: (roomId: number, messages: Message[]) => void;
  addMessage: (roomId: number, message: Message) => void;
  setTypingUsers: (roomId: number, userIds: number[]) => void;
  addTypingUser: (roomId: number, userId: number) => void;
  removeTypingUser: (roomId: number, userId: number) => void;
  setUnreadCount: (roomId: number, count: number) => void;
  setSocketConnected: (connected: boolean) => void;
  toggleLanguageLearningMode: () => void;
  initializeWebSocket: () => void;
  disconnectWebSocket: () => void;
  logout: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  chatRooms: [],
  activeRoomId: null,
  messages: {},
  typingUsers: {},
  unreadCounts: {},
  isSocketConnected: false,
  languageLearningMode: localStorage.getItem('languageLearningMode') === 'true',

  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },

  setChatRooms: (chatRooms) => set({ chatRooms }),
  
  setActiveRoom: (activeRoomId) => {
    const previousRoomId = get().activeRoomId;
    
    // Leave previous room
    if (previousRoomId && previousRoomId !== activeRoomId) {
      websocketService.leaveRoom(previousRoomId);
    }
    
    // Join new room
    if (activeRoomId) {
      websocketService.joinRoom(activeRoomId);
    }
    
    set({ activeRoomId });
  },
  
  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [roomId]: messages },
    })),
  
  addMessage: (roomId, message) =>
    set((state) => {
      const currentMessages = state.messages[roomId] || [];
      // Update existing message or add new one
      const existingIndex = currentMessages.findIndex(m => m.id === message.id);
      
      if (existingIndex !== -1) {
        // Update existing message (in case translation arrives later)
        const updatedMessages = [...currentMessages];
        updatedMessages[existingIndex] = message;
        return {
          messages: {
            ...state.messages,
            [roomId]: updatedMessages,
          },
        };
      }
      
      // Add new message
      return {
        messages: {
          ...state.messages,
          [roomId]: [...currentMessages, message],
        },
      };
    }),

  setTypingUsers: (roomId, userIds) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [roomId]: userIds },
    })),

  addTypingUser: (roomId, userId) =>
    set((state) => {
      const current = state.typingUsers[roomId] || [];
      if (current.includes(userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [roomId]: [...current, userId],
        },
      };
    }),

  removeTypingUser: (roomId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [roomId]: (state.typingUsers[roomId] || []).filter((id) => id !== userId),
      },
    })),

  setUnreadCount: (roomId, count) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [roomId]: count },
    })),

  setSocketConnected: (connected) => set({ isSocketConnected: connected }),

  toggleLanguageLearningMode: () =>
    set((state) => {
      const newMode = !state.languageLearningMode;
      localStorage.setItem('languageLearningMode', String(newMode));
      return { languageLearningMode: newMode };
    }),

  initializeWebSocket: () => {
    const { token, addMessage, addTypingUser, removeTypingUser, setUnreadCount } = get();
    
    if (!token) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    // Setup WebSocket callbacks
    websocketService.setCallbacks({
      onMessage: (roomId, message) => {
        addMessage(roomId, message);
      },
      onTyping: ({ room_id, user_id }) => {
        addTypingUser(room_id, user_id);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
          removeTypingUser(room_id, user_id);
        }, 3000);
      },
      onStoppedTyping: ({ room_id, user_id }) => {
        removeTypingUser(room_id, user_id);
      },
      onUnreadCount: ({ room_id, count }) => {
        setUnreadCount(room_id, count);
      },
      onError: (data) => {
        console.error('WebSocket error:', data);
      },
    });

    // Connect
    websocketService.connect(token);
    set({ isSocketConnected: true });
  },

  disconnectWebSocket: () => {
    websocketService.disconnect();
    set({ isSocketConnected: false });
  },
  
  logout: () => {
    websocketService.disconnect();
    localStorage.removeItem('token');
    set({ 
      user: null, 
      token: null, 
      chatRooms: [], 
      activeRoomId: null, 
      messages: {},
      typingUsers: {},
      unreadCounts: {},
      isSocketConnected: false,
    });
  },
}));
