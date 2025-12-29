import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  preferredLang: z.string().default('en'),
  displayName: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Email already exists');
      }
      throw new AppError(400, 'VALIDATION_ERROR', 'Username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        preferredLang: data.preferredLang,
        displayName: data.displayName || data.username,
      },
      select: {
        id: true,
        username: true,
        email: true,
        preferredLang: true,
        displayName: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    res.status(201).json({
      user,
      token,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    console.log('Login attempt for email:', data.email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      console.log('User not found for email:', data.email);
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    console.log('User found:', user.username, 'Hash exists:', !!user.passwordHash);

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    // Update last seen
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date(), isOnline: true },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        preferredLang: user.preferredLang,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        lastSeen: user.lastSeen,
        isOnline: true,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    (void req);
    // In a real app, you might want to blacklist the token or clear session
    // For now, we just send success response
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
