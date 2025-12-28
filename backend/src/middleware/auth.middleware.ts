import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

interface JwtPayload {
  userId: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};
