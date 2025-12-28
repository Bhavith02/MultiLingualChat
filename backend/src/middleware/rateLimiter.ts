import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Message rate limiter
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit to 30 messages per minute
  message: {
    success: false,
    error: 'Slow down! Too many messages sent.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limiter
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit to 20 searches per minute
  message: {
    success: false,
    error: 'Too many search requests, please wait a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
