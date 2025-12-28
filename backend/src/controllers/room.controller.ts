import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Create or get existing direct message room between two users
 */
export const createOrGetDirectMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { otherUserId } = req.body;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    if (!otherUserId) {
      throw new AppError(400, 'VALIDATION_ERROR', 'otherUserId is required');
    }

    if (userId === otherUserId) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Cannot create DM with yourself');
    }

    // Check if direct message room already exists
    const existingRooms = await prisma.chatRoom.findMany({
      where: {
        type: 'direct',
        participants: {
          every: {
            userId: {
              in: [userId, otherUserId],
            },
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
      },
    });

    // Find room with exactly these two users
    const existingRoom = existingRooms.find(
      (room) =>
        room.participants.length === 2 &&
        room.participants.every((p) => [userId, otherUserId].includes(p.userId))
    );

    if (existingRoom) {
      res.json({
        success: true,
        data: { room: existingRoom },
        message: 'Direct message room already exists',
      });
      return;
    }

    // Get other user details
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });

    if (!otherUser) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    // Create new direct message room
    const room = await prisma.chatRoom.create({
      data: {
        type: 'direct',
        name: null, // DM rooms typically don't have names
        createdBy: userId,
        participants: {
          create: [
            { userId, joinedAt: new Date() },
            { userId: otherUserId, joinedAt: new Date() },
          ],
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
      },
    });

    res.status(201).json({
      success: true,
      data: { room },
      message: 'Direct message room created',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a participant to a group chat room
 */
export const addParticipant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { roomId } = req.params;
    const { participantId } = req.body;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    // Check if room exists and user is a member
    const room = await prisma.chatRoom.findUnique({
      where: { id: parseInt(roomId) },
      include: {
        participants: true,
      },
    });

    if (!room) {
      throw new AppError(404, 'NOT_FOUND', 'Chat room not found');
    }

    if (room.type === 'direct') {
      throw new AppError(400, 'VALIDATION_ERROR', 'Cannot add participants to direct messages');
    }

    const isUserMember = room.participants.some((p) => p.userId === userId);
    if (!isUserMember) {
      throw new AppError(403, 'FORBIDDEN', 'You are not a member of this room');
    }

    // Check if participant already in room
    const existingParticipant = room.participants.find((p) => p.userId === participantId);
    if (existingParticipant) {
      throw new AppError(400, 'VALIDATION_ERROR', 'User is already a participant');
    }

    // Add participant
    await prisma.roomParticipant.create({
      data: {
        roomId: parseInt(roomId),
        userId: participantId,
        joinedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Participant added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Leave a chat room
 */
export const leaveRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { roomId } = req.params;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    // Update participant's leftAt timestamp
    await prisma.roomParticipant.updateMany({
      where: {
        roomId: parseInt(roomId),
        userId,
      },
      data: {
        leftAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Left room successfully',
    });
  } catch (error) {
    next(error);
  }
};
