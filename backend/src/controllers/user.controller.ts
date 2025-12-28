import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Validation schemas
const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  preferredLang: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

// Get current user profile
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        preferredLang: true,
        avatarUrl: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const data = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        preferredLang: true,
        avatarUrl: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Search users
export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
    }

    const searchQuery = req.query.q as string;

    console.log('Search query:', searchQuery, 'User ID:', userId);

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } }, // Exclude current user
          {
            OR: [
              { username: { contains: searchQuery } },
              { displayName: { contains: searchQuery } },
              { email: { contains: searchQuery } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isOnline: true,
        lastSeen: true,
      },
      take: 20, // Limit results
    });

    console.log('Found users:', users.length, users);

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};
