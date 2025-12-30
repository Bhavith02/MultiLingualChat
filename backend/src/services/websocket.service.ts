import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { messageService } from './message.service.js';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: number;
  email: string;
}

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

interface SendMessageData {
  room_id: number;
  text: string;
  message_type?: string;
  reply_to_id?: number;
}

export const setupWebSocket = (io: Server) => {
  // Track user sockets for targeted messaging
  const userSockets = new Map<number, Set<string>>(); // userId -> Set of socket IDs

  // Authentication middleware for WebSocket
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected via WebSocket: ${socket.userId} (${socket.id})`);

    // Track this socket for the user
    if (socket.userId) {
      if (!userSockets.has(socket.userId)) {
        userSockets.set(socket.userId, new Set());
      }
      userSockets.get(socket.userId)!.add(socket.id);
    }

    // Update user online status
    if (socket.userId) {
      prisma.user.update({
        where: { id: socket.userId },
        data: { isOnline: true, lastSeen: new Date() },
      }).catch((err) => logger.error('Failed to update online status', err));
    }

    // Join room
    socket.on('join_room', async ({ room_id }) => {
      socket.join(`room_${room_id}`);
      logger.info(`User ${socket.userId} joined room ${room_id}`);
      
      socket.to(`room_${room_id}`).emit('participant_joined', {
        room_id,
        user_id: socket.userId,
      });

      // Send unread count
      if (socket.userId) {
        const unreadCount = await messageService.getUnreadCount(socket.userId, room_id);
        socket.emit('unread_count', { room_id, count: unreadCount });
      }
    });

    // Leave room
    socket.on('leave_room', ({ room_id }) => {
      socket.leave(`room_${room_id}`);
      logger.info(`User ${socket.userId} left room ${room_id}`);
      
      socket.to(`room_${room_id}`).emit('participant_left', {
        room_id,
        user_id: socket.userId,
      });
    });

    // Send message with translation
    socket.on('send_message', async (data: SendMessageData) => {
      try {
        if (!socket.userId) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        logger.info(`Message from user ${socket.userId} in room ${data.room_id}`);

        // Get user's preferred language
        const user = await prisma.user.findUnique({
          where: { id: socket.userId },
          select: { preferredLang: true },
        });

        // Create message with translations
        const message = await messageService.createMessage({
          chatRoomId: data.room_id,
          senderId: socket.userId,
          originalText: data.text,
          originalLang: user?.preferredLang || 'en',
          messageType: data.message_type || 'text',
          replyToId: data.reply_to_id,
        });

        // Get all participants with their preferred languages
        const participants = await prisma.roomParticipant.findMany({
          where: { roomId: data.room_id, leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                preferredLang: true,
              },
            },
          },
        });

        // Send personalized message to each participant (except sender gets it via acknowledgment)
        for (const participant of participants) {
          if (participant.user.id === socket.userId) continue; // Skip sender
          
          const userLang = participant.user.preferredLang;
          const messageForUser = await messageService.getMessageForUser(message.id, userLang);

          // Get all sockets for this participant
          const participantSockets = userSockets.get(participant.user.id);
          if (participantSockets) {
            for (const socketId of participantSockets) {
              // Send new message event
              io.to(socketId).emit('new_message', {
                message: {
                  id: message.id,
                  room_id: data.room_id,
                  sender_id: message.senderId,
                  sender: message.sender,
                  text: messageForUser.text,
                  is_original: messageForUser.isOriginal,
                  original_text: message.originalText,
                  original_lang: messageForUser.originalLang,
                  romanization: messageForUser.romanization,
                  message_type: message.messageType,
                  created_at: message.createdAt,
                  target_language: userLang,
                },
              });
              
              // Also send room update notification to refresh chat list
              io.to(socketId).emit('room_updated', {
                room_id: data.room_id,
              });
            }
          }
        }

        // Send acknowledgment to sender with their version of the message
        const senderMessage = await messageService.getMessageForUser(message.id, user?.preferredLang || 'en');
        socket.emit('message_sent', { 
          message_id: message.id,
          message: {
            id: message.id,
            room_id: data.room_id,
            sender_id: message.senderId,
            sender: message.sender,
            text: senderMessage.text,
            is_original: senderMessage.isOriginal,
            original_text: message.originalText,
            original_lang: senderMessage.originalLang,
            romanization: senderMessage.romanization,
            message_type: message.messageType,
            created_at: message.createdAt,
            target_language: user?.preferredLang || 'en',
          },
        });
      } catch (error) {
        logger.error('Error sending message', { error, data });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ room_id }) => {
      socket.to(`room_${room_id}`).emit('user_typing', {
        room_id,
        user_id: socket.userId,
      });
    });

    socket.on('typing_stop', ({ room_id }) => {
      socket.to(`room_${room_id}`).emit('user_stopped_typing', {
        room_id,
        user_id: socket.userId,
      });
    });

    // Mark message as read
    socket.on('mark_read', async ({ room_id, message_id }) => {
      if (!socket.userId) return;
      
      try {
        await messageService.updateLastRead(socket.userId, room_id, message_id);
        
        // Notify other participants
        socket.to(`room_${room_id}`).emit('message_read', {
          room_id,
          user_id: socket.userId,
          message_id,
        });
      } catch (error) {
        logger.error('Error marking message as read', { error });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      logger.info(`User disconnected: ${socket.userId} (${socket.id})`);
      
      // Remove this socket from user's socket set
      if (socket.userId && userSockets.has(socket.userId)) {
        userSockets.get(socket.userId)!.delete(socket.id);
        // If no more sockets for this user, remove the entry
        if (userSockets.get(socket.userId)!.size === 0) {
          userSockets.delete(socket.userId);
        }
      }
      
      // Update user's online status
      if (socket.userId) {
        try {
          await prisma.user.update({
            where: { id: socket.userId },
            data: { isOnline: false, lastSeen: new Date() },
          });
        } catch (error) {
          logger.error('Failed to update offline status', error);
        }
      }
    });
  });
};
