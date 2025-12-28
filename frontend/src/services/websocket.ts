import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

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

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
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
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
      return;
    }
    
    console.log('🚪 Joining room:', roomId);
    this.socket.emit('join_room', { room_id: roomId });
  }

  leaveRoom(roomId: number) {
    if (!this.socket?.connected) return;
    
    console.log('🚪 Leaving room:', roomId);
    this.socket.emit('leave_room', { room_id: roomId });
  }

  sendMessage(roomId: number, text: string, messageType: string = 'text') {
    if (!this.socket?.connected) {
      console.warn('Socket not connected');
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
      this.socket.disconnect();
      this.socket = null;
      this.callbacks = {};
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
