import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token expired',
      },
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Internal server error' 
        : message,
    },
  });
};

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
