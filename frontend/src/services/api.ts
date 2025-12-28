import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    preferredLang: string;
    displayName?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: number, data: any) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  updateMe: async (data: { displayName?: string; preferredLang?: string; avatarUrl?: string | null }) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  updateLanguage: async (userId: number, language: string) => {
    const response = await api.patch(`/users/${userId}/language`, { language });
    return response.data;
  },

  searchByUsername: async (username: string) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(username)}`);
    return response.data;
  },

  quickConnect: async (targetUserId: number) => {
    const response = await api.post('/users/quick-connect', { targetUserId });
    // Transform participants from {userId, user} to just user objects
    if (response.data.success && response.data.data?.room) {
      response.data.data.room.participants = response.data.data.room.participants?.map((p: any) => p.user || p) || [];
    }
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  getRooms: async () => {
    const response = await api.get('/chat-rooms');
    // Transform participants from {userId, user} to just user objects
    if (response.data.success && response.data.data?.rooms) {
      response.data.data.rooms = response.data.data.rooms.map((room: any) => ({
        ...room,
        participants: room.participants?.map((p: any) => p.user || p) || []
      }));
    }
    return response.data;
  },

  getRoom: async (roomId: number) => {
    const response = await api.get(`/chat-rooms/${roomId}`);
    // Transform participants from {userId, user} to just user objects
    if (response.data.success && response.data.data?.room) {
      response.data.data.room.participants = response.data.data.room.participants?.map((p: any) => p.user || p) || [];
    }
    return response.data;
  },

  createRoom: async (data: {
    name: string;
    isPrivate?: boolean;
    memberIds?: string[];
  }) => {
    const response = await api.post('/chat-rooms', data);
    // Transform participants from {userId, user} to just user objects
    if (response.data.success && response.data.data?.room) {
      response.data.data.room.participants = response.data.data.room.participants?.map((p: any) => p.user || p) || [];
    }
    return response.data;
  },

  createDirectMessage: async (otherUserId: number) => {
    const response = await api.post('/chat-rooms/direct', { otherUserId });
    // Transform participants from {userId, user} to just user objects
    if (response.data.success && response.data.data?.room) {
      response.data.data.room.participants = response.data.data.room.participants?.map((p: any) => p.user || p) || [];
    }
    return response.data;
  },

  getMessages: async (roomId: number, limit: number = 50, before?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    
    const response = await api.get(`/chat-rooms/${roomId}/messages?${params}`);
    return response.data;
  },

  addParticipant: async (roomId: number, participantId: number) => {
    const response = await api.post(`/chat-rooms/${roomId}/participants`, { participantId });
    return response.data;
  },

  leaveRoom: async (roomId: number) => {
    const response = await api.post(`/chat-rooms/${roomId}/leave`);
    return response.data;
  },

  quickConnect: async (targetUserId: number) => {
    const response = await api.post('/users/quick-connect', { targetUserId });
    // Transform participants from {userId, user} to just user objects
    if (response.data.success && response.data.data?.room) {
      response.data.data.room.participants = response.data.data.room.participants?.map((p: any) => p.user || p) || [];
    }
    return response.data;
  },

  decodeQR: async (encodedId: string) => {
    const response = await api.get(`/users/decode-qr/${encodedId}`);
    return response.data;
  },
};

// User search API
export const userSearchAPI = {
  searchUsers: async (query: string) => {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateMe: async (data: {
    displayName?: string;
    preferredLang?: string;
    avatarUrl?: string;
  }) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

// Languages API
export const languagesAPI = {
  getAll: async () => {
    const response = await api.get('/languages');
    return response.data;
  },
};

export default api;
