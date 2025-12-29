import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

interface SocketMessage {
  message: {
    id: number;
    room_id: number;
    sender_id: number;
    sender: {
      id: number;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
    text: string;
    is_original: boolean;
    original_text: string;
    original_lang?: string;
    romanization?: string;
    message_type: string;
    created_at: string;
    target_language?: string;
  };
}

interface SocketCallbacks {
  onMessage: (roomId: number, message: Message) => void;
  onParticipantJoined: (data: { room_id: number; user_id: number }) => void;
  onParticipantLeft: (data: { room_id: number; user_id: number }) => void;
  onTyping: (data: { room_id: number; user_id: number }) => void;
  onStoppedTyping: (data: { room_id: number; user_id: number }) => void;
  onUnreadCount: (data: { room_id: number; count: number }) => void;
  onError: (data: { message: string }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: Partial<SocketCallbacks> = {};
  private token: string | null = null;
  private currentRooms: Set<number> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    this.token = token;
    
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    console.log('🔌 Connecting to WebSocket:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      // Rejoin all rooms after reconnection
      if (this.currentRooms.size > 0) {
        console.log('🔄 Rejoining rooms after reconnection:', Array.from(this.currentRooms));
        this.currentRooms.forEach(roomId => {
          this.socket?.emit('join_room', { room_id: roomId });
        });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected. Reason:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, need to reconnect manually
        console.log('🔄 Server disconnected, attempting to reconnect...');
        setTimeout(() => {
          if (this.token && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.connect(this.token);
          }
        }, 2000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.callbacks.onError?.({
          message: 'Failed to connect to server. Please refresh the page.',
        });
      }
    });

    this.socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data);
      this.callbacks.onError?.(data);
    });

    this.socket.on('new_message', (data: SocketMessage) => {
      console.log('📨 New message received:', data);
      
      const message: Message = {
        id: data.message.id,
        senderId: data.message.sender_id,
        senderName: data.message.sender.displayName || data.message.sender.username,
        senderAvatar: data.message.sender.avatarUrl,
        text: data.message.text,
        originalText: data.message.original_text,
        originalLang: data.message.original_lang,
        romanization: data.message.romanization,
        isOriginal: data.message.is_original,
        timestamp: data.message.created_at,
      };

      this.callbacks.onMessage?.(data.message.room_id, message);
    });

    this.socket.on('message_sent', (data: { message_id: number; message?: any }) => {
      console.log('✅ Message sent confirmation:', data);
      
      // If message data is included, add it to the chat
      if (data.message) {
        const message: Message = {
          id: data.message.id,
          senderId: data.message.sender_id,
          senderName: data.message.sender.displayName || data.message.sender.username,
          senderAvatar: data.message.sender.avatarUrl,
          text: data.message.text,
          originalText: data.message.original_text,
          originalLang: data.message.original_lang,
          romanization: data.message.romanization,
          isOriginal: data.message.is_original,
          timestamp: data.message.created_at,
        };
        
        this.callbacks.onMessage?.(data.message.room_id, message);
      }
    });

    this.socket.on('participant_joined', (data: { room_id: number; user_id: number }) => {
      console.log('👋 Participant joined:', data);
      this.callbacks.onParticipantJoined?.(data);
    });

    this.socket.on('participant_left', (data: { room_id: number; user_id: number }) => {
      console.log('👋 Participant left:', data);
      this.callbacks.onParticipantLeft?.(data);
    });

    this.socket.on('user_typing', (data: { room_id: number; user_id: number }) => {
      this.callbacks.onTyping?.(data);
    });

    this.socket.on('user_stopped_typing', (data: { room_id: number; user_id: number }) => {
      this.callbacks.onStoppedTyping?.(data);
    });

    this.socket.on('unread_count', (data: { room_id: number; count: number }) => {
      this.callbacks.onUnreadCount?.(data);
    });

    this.socket.on('message_read', (data: { room_id: number; user_id: number; message_id: number }) => {
      console.log('✓✓ Message read:', data);
    });
  }

  setCallbacks(callbacks: Partial<SocketCallbacks>) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  joinRoom(roomId: number) {
    this.currentRooms.add(roomId);
    
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, will join room after connection');
      return;
    }
    
    console.log('🚪 Joining room:', roomId);
    this.socket.emit('join_room', { room_id: roomId });
  }

  leaveRoom(roomId: number) {
    this.currentRooms.delete(roomId);
    
    if (!this.socket?.connected) return;
    
    console.log('🚪 Leaving room:', roomId);
    this.socket.emit('leave_room', { room_id: roomId });
  }

  sendMessage(roomId: number, text: string, messageType: string = 'text') {
    if (!this.socket?.connected) {
      console.error('❌ Cannot send message: Socket not connected');
      this.callbacks.onError?.({
        message: 'Not connected to server. Please check your connection.',
      });
      return;
    }

    console.log('📤 Sending message:', { roomId, text });
    this.socket.emit('send_message', {
      room_id: roomId,
      text,
      message_type: messageType,
    });
  }

  markAsRead(roomId: number, messageId: number) {
    if (!this.socket?.connected) return;

    this.socket.emit('mark_read', {
      room_id: roomId,
      message_id: messageId,
    });
  }

  startTyping(roomId: number) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('typing_start', { room_id: roomId });
  }

  stopTyping(roomId: number) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('typing_stop', { room_id: roomId });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.callbacks = {};
      this.currentRooms.clear();
      this.token = null;
      this.reconnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
