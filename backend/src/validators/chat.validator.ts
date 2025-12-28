import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Room name is required')
      .max(100, 'Room name must not exceed 100 characters'),
    isGroup: z.boolean().default(false),
    participantIds: z
      .array(z.number().int().positive('Participant ID must be a positive integer'))
      .min(1, 'At least one participant is required')
      .max(50, 'Maximum 50 participants allowed'),
  }),
});

export const directMessageSchema = z.object({
  body: z.object({
    otherUserId: z.number().int().positive('User ID must be a positive integer'),
  }),
});

export const addParticipantSchema = z.object({
  params: z.object({
    roomId: z.string().regex(/^\d+$/, 'Room ID must be a number').transform(Number),
  }),
  body: z.object({
    participantId: z.number().int().positive('Participant ID must be a positive integer'),
  }),
});

export const getRoomSchema = z.object({
  params: z.object({
    roomId: z.string().regex(/^\d+$/, 'Room ID must be a number').transform(Number),
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    roomId: z.string().regex(/^\d+$/, 'Room ID must be a number').transform(Number),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
  }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>['body'];
export type DirectMessageInput = z.infer<typeof directMessageSchema>['body'];
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export type GetRoomInput = z.infer<typeof getRoomSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
