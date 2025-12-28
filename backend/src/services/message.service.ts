import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { translationService } from './translation.service.js';

const prisma = new PrismaClient();

interface CreateMessageData {
  chatRoomId: number;
  senderId: number;
  originalText: string;
  originalLang?: string;
  messageType?: string;
  replyToId?: number;
}

interface MessageWithTranslations {
  id: number;
  chatRoomId: number;
  senderId: number | null;
  originalText: string;
  originalLang: string;
  messageType: string;
  createdAt: Date;
  sender: {
    id: number;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  translations: Array<{
    id: number;
    targetLanguage: string;
    translatedText: string;
  }>;
}

export class MessageService {
  /**
   * Create a message and translate it for all room participants
   */
  async createMessage(data: CreateMessageData): Promise<MessageWithTranslations> {
    try {
      // Detect source language if not provided
      let sourceLang = data.originalLang;
      if (!sourceLang) {
        sourceLang = await translationService.detectLanguage(data.originalText);
        logger.info(`Detected language: ${sourceLang} for message: ${data.originalText}`);
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          chatRoomId: data.chatRoomId,
          senderId: data.senderId,
          originalText: data.originalText,
          originalLang: sourceLang,
          messageType: data.messageType || 'text',
          replyToId: data.replyToId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Get all participants in the room
      const participants = await prisma.roomParticipant.findMany({
        where: {
          roomId: data.chatRoomId,
          leftAt: null, // Only active participants
        },
        include: {
          user: {
            select: {
              id: true,
              preferredLang: true,
            },
          },
        },
      });

      // Get unique target languages (excluding source language)
      const targetLanguages = [
        ...new Set(
          participants
            .map((p) => p.user.preferredLang)
            .filter((lang) => lang !== sourceLang)
        ),
      ];

      logger.info(`Translating to languages: ${targetLanguages.join(', ')}`);

      // Translate message to all target languages
      const translations = await translationService.translateToMultipleLanguages(
        data.originalText,
        targetLanguages,
        sourceLang
      );

      // Save translations to database
      const translationRecords = await Promise.all(
        Array.from(translations.entries()).map(([lang, text]) =>
          prisma.messageTranslation.create({
            data: {
              messageId: message.id,
              targetLanguage: lang,
              translatedText: text,
              translationProvider: 'google',
            },
          })
        )
      );

      return {
        ...message,
        translations: translationRecords,
      };
    } catch (error) {
      logger.error('Failed to create message', { error, data });
      throw error;
    }
  }

  /**
   * Get message with translation for specific language
   */
  async getMessageForUser(
    messageId: number,
    userLanguage: string
  ): Promise<{ text: string; isOriginal: boolean }> {
    try {
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          translations: {
            where: { targetLanguage: userLanguage },
          },
        },
      });

      if (!message) {
        throw new Error('Message not found');
      }

      // If user's language matches original, return original
      if (message.originalLang === userLanguage) {
        return {
          text: message.originalText,
          isOriginal: true,
        };
      }

      // Return translation if available
      const translation = message.translations[0];
      if (translation) {
        return {
          text: translation.translatedText,
          isOriginal: false,
        };
      }

      // Fallback to original if no translation exists
      return {
        text: message.originalText,
        isOriginal: true,
      };
    } catch (error) {
      logger.error('Failed to get message for user', { error, messageId, userLanguage });
      throw error;
    }
  }

  /**
   * Update last read message for a user in a room
   */
  async updateLastRead(userId: number, roomId: number, messageId: number): Promise<void> {
    try {
      await prisma.roomParticipant.updateMany({
        where: {
          userId,
          roomId,
        },
        data: {
          lastReadMessageId: messageId,
        },
      });
    } catch (error) {
      logger.error('Failed to update last read message', { error, userId, roomId, messageId });
    }
  }

  /**
   * Get unread message count for user in a room
   */
  async getUnreadCount(userId: number, roomId: number): Promise<number> {
    try {
      const participant = await prisma.roomParticipant.findFirst({
        where: {
          userId,
          roomId,
        },
      });

      if (!participant?.lastReadMessageId) {
        // If no last read message, count all messages
        return await prisma.message.count({
          where: {
            chatRoomId: roomId,
            senderId: { not: userId }, // Exclude own messages
          },
        });
      }

      // Count messages after last read
      return await prisma.message.count({
        where: {
          chatRoomId: roomId,
          senderId: { not: userId },
          id: { gt: participant.lastReadMessageId },
        },
      });
    } catch (error) {
      logger.error('Failed to get unread count', { error, userId, roomId });
      return 0;
    }
  }
}

export const messageService = new MessageService();
