export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  preferredLang: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string | null;
  text: string;
  originalText?: string;
  originalLang?: string;
  romanization?: string; // Romanized/transliterated version for pronunciation
  isOriginal?: boolean;
  timestamp: string;
  isEdited?: boolean;
  isTranslated?: boolean;
}

export interface ChatRoom {
  id: number;
  name?: string;
  type: 'direct' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  avatarUrl?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
