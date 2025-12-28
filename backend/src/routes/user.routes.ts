import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getMe, updateMe, searchUsers } from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, searchUsersSchema } from '../validators/user.validator.js';
import { apiLimiter, searchLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', apiLimiter, getMe);
router.put('/me', apiLimiter, validate(updateProfileSchema), updateMe);
router.get('/search', searchLimiter, validate(searchUsersSchema), searchUsers);

export default router;
