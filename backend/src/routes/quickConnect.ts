import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

// Validation schema for quick connect
const quickConnectSchema = z.object({
  body: z.object({
    targetUserId: z.number().int().positive(),
  }),
});

/**
 * POST /api/v1/users/quick-connect
 * Create a direct message room with another user via QR code scan
 */
router.post(
  '/quick-connect',
  authenticate,
  validate(quickConnectSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targetUserId } = req.body;
      const currentUserId = req.user?.userId;

      if (!currentUserId) {
        throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
      }

      // Prevent self-connection
      if (targetUserId === currentUserId) {
        return res.status(400).json({ 
          success: false,
          error: 'Cannot connect with yourself' 
        });
      }

      // Check if target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          username: true,
          displayName: true,
          preferredLang: true,
        },
      });

      if (!targetUser) {
        return res.status(404).json({ 
          success: false,
          error: 'User not found' 
        });
      }

      // Check if a DM room already exists between these users
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          type: 'direct',
          AND: [
            { participants: { some: { userId: currentUserId } } },
            { participants: { some: { userId: targetUserId } } },
          ],
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  preferredLang: true,
                },
              },
            },
          },
        },
      });

      if (existingRoom) {
        // Return existing room
        return res.json({
          success: true,
          message: 'Existing chat found',
          data: {
            room: existingRoom,
            isNew: false,
          },
        });
      }

      // Create new DM room
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          id: true,
          username: true,
          displayName: true,
          preferredLang: true,
        },
      });

      if (!currentUser) {
        throw new AppError(404, 'USER_NOT_FOUND', 'Current user not found');
      }

      // For direct messages, don't set a name - let the frontend display the other user's name
      const newRoom = await prisma.chatRoom.create({
        data: {
          name: null, // Direct messages don't need a room name
          type: 'direct',
          participants: {
            create: [
              {
                userId: currentUserId,
                role: 'member',
              },
              {
                userId: targetUserId,
                role: 'member',
              },
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
                  preferredLang: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Chat created successfully',
        data: {
          room: newRoom,
          isNew: true,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/v1/users/decode-qr/:encodedId
 * Decode and verify a QR code user ID
 */
router.get('/decode-qr/:encodedId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { encodedId } = req.params;
    
    // Decode base64 user ID
    const decodedId = parseInt(Buffer.from(encodedId, 'base64').toString('utf-8'), 10);
    
    if (isNaN(decodedId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid QR code format' 
      });
    }

    // Fetch user info
    const user = await prisma.user.findUnique({
      where: { id: decodedId },
      select: {
        id: true,
        username: true,
        displayName: true,
        preferredLang: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    return res.json({ 
      success: true,
      data: { user } 
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
