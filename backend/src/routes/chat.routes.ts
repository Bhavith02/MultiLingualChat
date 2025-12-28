import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getRooms, createRoom, getRoom, getMessages } from '../controllers/chat.controller.js';
import {
  createOrGetDirectMessage,
  addParticipant,
  leaveRoom,
} from '../controllers/room.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createRoomSchema,
  directMessageSchema,
  addParticipantSchema,
  getRoomSchema,
  getMessagesSchema,
} from '../validators/chat.validator.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);
router.use(apiLimiter);

router.get('/', getRooms);
router.post('/', validate(createRoomSchema), createRoom);
router.post('/direct', validate(directMessageSchema), createOrGetDirectMessage);
router.get('/:roomId', validate(getRoomSchema), getRoom);
router.get('/:roomId/messages', validate(getMessagesSchema), getMessages);
router.post('/:roomId/participants', validate(addParticipantSchema), addParticipant);
router.post('/:roomId/leave', validate(getRoomSchema), leaveRoom);

export default router;
