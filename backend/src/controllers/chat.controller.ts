import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { messageService } from '../services/message.service.js';
import { logger } from '../utils/logger.js';
import { romanize } from '../utils/romanization.js';

const prisma = new PrismaClient();

// Validation schemas
const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  isPrivate: z.boolean().default(false),
  memberIds: z.array(z.string()).optional(), // User IDs to add to the room
});

const getMessagesSchema = z.object({
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('50'),
  before: z.string().optional(), // Message ID for pagination
});

// Get all chat rooms for current user
export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const rooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { rooms },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new chat room
export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const data = createRoomSchema.parse(req.body);

    // Create room with creator as first member
    const memberIds = data.memberIds ? data.memberIds.map(id => parseInt(id)) : [];
    if (!memberIds.includes(userId)) {
      memberIds.push(userId);
    }

    const room = await prisma.chatRoom.create({
      data: {
        name: data.name,
        type: data.isPrivate ? 'direct' : 'group',
        createdBy: userId,
        participants: {
          create: memberIds.map((id) => ({
            userId: id,
            joinedAt: new Date(),
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { room },
      message: 'Chat room created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get chat room details
export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { roomId } = req.params;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: parseInt(roomId) },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeen: true,
                preferredLang: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!room) {
      throw new AppError(404, 'NOT_FOUND', 'Chat room not found');
    }

    // Check if user is a member
    const isMember = room.participants.some((participant) => participant.userId === userId);
    if (!isMember) {
      throw new AppError(403, 'FORBIDDEN', 'You are not a member of this chat room');
    }

    res.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

// Get messages in a chat room
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { roomId } = req.params;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const { limit, before } = getMessagesSchema.parse(req.query);

    // Check if user is a member of the room
    const membership = await prisma.roomParticipant.findFirst({
      where: {
        roomId: parseInt(roomId),
        userId,
      },
    });

    if (!membership) {
      throw new AppError(403, 'FORBIDDEN', 'You are not a member of this chat room');
    }

    // Build query for pagination
    const whereClause: any = { chatRoomId: parseInt(roomId) };
    if (before) {
      const beforeMessage = await prisma.message.findUnique({
        where: { id: parseInt(before) },
        select: { createdAt: true },
      });
      if (beforeMessage) {
        whereClause.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        translations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Get user's preferred language
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferredLang: true },
    });

    const userLang = user?.preferredLang || 'en';
    logger.info(`Fetching messages for user ${userId} with language: ${userLang}`);

    // Translate each message to user's language
    const translatedMessages = await Promise.all(
      messages.map(async (message) => {
        const translation = await messageService.getMessageForUser(message.id, userLang);
        
        // Always romanize the original text to help user learn pronunciation of the original language
        // This helps users understand how to pronounce what the sender actually said
        const romanization = await romanize(message.originalText, message.originalLang);
        
        logger.info(`Message ${message.id}: original="${message.originalText}" (${message.originalLang}), translated="${translation.text}" (${userLang}), isOriginal=${translation.isOriginal}, romanization=${romanization || 'none'}`);
        
        return {
          id: message.id,
          chatRoomId: message.chatRoomId,
          senderId: message.senderId,
          sender: message.sender,
          text: translation.text,
          originalText: message.originalText,
          originalLang: message.originalLang,
          romanization,
          isOriginal: translation.isOriginal,
          messageType: message.messageType,
          createdAt: message.createdAt,
        };
      })
    );

    res.json({
      success: true,
      data: {
        messages: translatedMessages.reverse(), // Return in chronological order
        hasMore: messages.length === limit,
      },
    });
  } catch (error) {
    next(error);
  }
};
