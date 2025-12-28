import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

export default router;
