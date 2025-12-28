import type { User, ChatRoom, Message, Language } from '../types';

// Mock data for development/demo purposes

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    preferredLang: 'en',
    isOnline: true,
  },
  {
    id: 2,
    username: 'maria_garcia',
    email: 'maria@example.com',
    displayName: 'María García',
    preferredLang: 'es',
    isOnline: true,
  },
  {
    id: 3,
    username: 'jean_dupont',
    email: 'jean@example.com',
    displayName: 'Jean Dupont',
    preferredLang: 'fr',
    isOnline: false,
  },
  {
    id: 4,
    username: 'wang_li',
    email: 'wang@example.com',
    displayName: 'Wang Li',
    preferredLang: 'zh',
    isOnline: true,
  },
];

export const MOCK_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];

export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 1,
    name: 'Language Learning Group',
    type: 'group',
    participants: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]],
    unreadCount: 3,
    lastMessage: {
      id: 1,
      senderId: 2,
      senderName: 'María García',
      text: 'Hello everyone!',
      originalText: '¡Hola a todos!',
      originalLang: 'es',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isTranslated: true,
    },
  },
  {
    id: 2,
    type: 'direct',
    participants: [MOCK_USERS[0], MOCK_USERS[3]],
    unreadCount: 0,
    lastMessage: {
      id: 2,
      senderId: 4,
      senderName: 'Wang Li',
      text: 'See you tomorrow!',
      originalText: '明天见!',
      originalLang: 'zh',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isTranslated: true,
    },
  },
];

export const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      senderId: 1,
      senderName: 'John Doe',
      text: 'Hello everyone! Ready to practice?',
      originalText: 'Hello everyone! Ready to practice?',
      originalLang: 'en',
      timestamp: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 2,
      senderId: 2,
      senderName: 'María García',
      text: 'Hello! Yes, I am ready.',
      originalText: '¡Hola! Sí, estoy lista.',
      originalLang: 'es',
      timestamp: new Date(Date.now() - 500000).toISOString(),
      isTranslated: true,
    },
    {
      id: 3,
      senderId: 3,
      senderName: 'Jean Dupont',
      text: 'Good evening everyone',
      originalText: 'Bonsoir à tous',
      originalLang: 'fr',
      timestamp: new Date(Date.now() - 400000).toISOString(),
      isTranslated: true,
    },
    {
      id: 4,
      senderId: 1,
      senderName: 'John Doe',
      text: 'Great! Let\'s start with introductions',
      originalText: 'Great! Let\'s start with introductions',
      originalLang: 'en',
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
  ],
  2: [
    {
      id: 5,
      senderId: 4,
      senderName: 'Wang Li',
      text: 'Hi! How are you?',
      originalText: '你好！你好吗？',
      originalLang: 'zh',
      timestamp: new Date(Date.now() - 7300000).toISOString(),
      isTranslated: true,
    },
    {
      id: 6,
      senderId: 1,
      senderName: 'John Doe',
      text: 'I\'m good! Thanks for asking.',
      originalText: 'I\'m good! Thanks for asking.',
      originalLang: 'en',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
};

// Simple mock translation function
export const mockTranslate = (text: string, targetLang: string): string => {
  // In a real app, this would call an API
  // For demo, we'll return the original text with a note
  const translations: Record<string, Record<string, string>> = {
    'Hello everyone!': {
      es: '¡Hola a todos!',
      fr: 'Bonjour à tous!',
      de: 'Hallo zusammen!',
      zh: '大家好！',
    },
    'How are you?': {
      es: '¿Cómo estás?',
      fr: 'Comment allez-vous?',
      de: 'Wie geht es dir?',
      zh: '你好吗？',
    },
  };

  return translations[text]?.[targetLang] || text;
};
