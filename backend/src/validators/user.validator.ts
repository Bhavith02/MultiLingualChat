import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    displayName: z
      .string()
      .min(1, 'Display name cannot be empty')
      .max(50, 'Display name must not exceed 50 characters')
      .optional(),
    preferredLanguage: z
      .string()
      .length(2, 'Language code must be 2 characters (e.g., en, es, fr)')
      .optional(),
    bio: z
      .string()
      .max(500, 'Bio must not exceed 500 characters')
      .optional(),
    avatarUrl: z
      .string()
      .url('Invalid avatar URL')
      .max(500, 'Avatar URL must not exceed 500 characters')
      .optional(),
  }),
});

export const searchUsersSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, 'Search query is required')
      .max(100, 'Search query must not exceed 100 characters'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
