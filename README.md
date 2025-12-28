# 🌍 MultiLingualChat - Real-time Translation Chat Application

> Break down language barriers with real-time translation and pronunciation learning across 100+ languages

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-black)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

## 📖 Overview

MultiLingualChat is a modern, real-time chat application that automatically translates messages between users speaking different languages. Users can communicate seamlessly in their preferred language while messages are instantly translated for other participants.

## ✨ Features

### 🔐 Authentication & User Management
- **JWT Authentication** - Secure user registration and login
- **User Profiles** - Customizable display names and avatars
- **Language Preferences** - Choose from 100+ supported languages
- **Real-time Language Switching** - Change your preferred language on-the-fly without logging out

### 💬 Messaging
- **Real-time Messaging** - Instant message delivery with Socket.IO WebSockets
- **Auto-Translation** - Messages automatically translated using MyMemory Translation API (free, no API key needed)
- **Message History** - Persistent message storage with SQLite/Prisma
- **Group & Direct Chats** - Support for both one-on-one and group conversations
- **Typing Indicators** - See when others are typing
- **Read Receipts** - Track message read status
- **Voice-to-Text Input** - Speak in your language and it's automatically converted to text (Web Speech API)

### 🌐 Translation & Learning
- **100+ Languages Supported** - Including: English, Spanish, Chinese, Japanese, Korean, Hindi, Arabic, Russian, French, German, Italian, Portuguese, and 90+ more
- **Language Search** - Quickly find languages with searchable dropdown
- **Language Learning Mode** - Shows both original and translated messages side-by-side
- **Romanization/Transliteration** - Pronunciation guides for non-Latin scripts
  - Japanese kanji → romaji (Hepburn system)
  - Chinese characters → pinyin
  - Korean Hangul → romanization
  - Arabic, Russian, Greek, Thai, Hebrew, Hindi, and 90+ more
- **Smart Translation Display** - Original text shown with translation for context

### 🔗 Connection Options
- **QR Code Sharing** - Generate and share QR codes to instantly connect with others
- **QR Code Scanning** - Scan QR codes with your device camera to start chatting
- **Connect by Username** - Search and connect with users by their username
- **Quick Connect** - Add users to existing or new chat rooms

### 👥 User Experience
- **Online/Offline Status** - See who's currently available
- **Presence Tracking** - Real-time status updates
- **Beautiful UI** - Modern gradient design with Material-UI components
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Clean Interface** - Intuitive navigation and chat experience

### 🔒 Security
- **Input Validation** - Zod schema validation for all inputs
- **Rate Limiting** - Protection against spam and abuse
- **Password Hashing** - Secure bcrypt password encryption
- **JWT Tokens** - Secure authentication with HTTP-only cookies
- **CORS Protection** - Configured origins for API security

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** ([Download](https://nodejs.org/))
- **npm or yarn** package manager
- **Docker** (optional, for containerized deployment)

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd MultiLingualChat

# Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and configure as needed

# Start with Docker Compose
docker-compose up -d --build

# Access the application
# Frontend: http://localhost
# Backend: http://localhost:3000
```

#### Option 2: Manual Setup

**Backend Setup:**

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env file with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Build TypeScript
npm run build

# Start server
npm run dev
```

**Frontend Setup:**

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with backend URL

# Start development server
npm run dev

# Access at http://localhost:5173
```

### Configuration

**Backend (.env):**
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

## 📚 Usage

### Getting Started

1. **Register an Account**
   - Choose your preferred language from 100+ options
   - Set your display name
   - Create a secure password

2. **Start Chatting**
   - Click the "+" button to connect with others
   - Use QR codes or search by username
   - Send messages in your language

3. **Enable Learn Mode**
   - Toggle the Learn Mode switch to see original messages
   - View romanization/pronunciation for non-Latin scripts
   - Practice reading in the original language

4. **Use Voice Input**
   - Click the microphone button in the chat
   - Speak in your language
   - Text appears automatically

5. **Switch Languages On-the-Fly**
   - Click your language indicator (e.g., "EN")
   - Search for a new language
   - Messages reload in the new language

### Browser Support

- ✅ **Chrome/Edge** - Full support (recommended for voice input)
- ✅ **Safari** - Full support
- ⚠️ **Firefox** - Translation and chat work, but voice input not supported (Web Speech API limitation)

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 20.19.6
- **Framework:** Express 4.18
- **Language:** TypeScript 5.3
- **Database:** SQLite with Prisma 5.22 ORM
- **WebSockets:** Socket.IO 4.6
- **Authentication:** JWT + bcrypt
- **Translation:** MyMemory Translation API (free, no key required)
- **Romanization:** 
  - kuroshiro + kuromoji (Japanese)
  - transliteration (100+ languages)

### Frontend
- **Framework:** React 19
- **Language:** TypeScript 5.9
- **Build Tool:** Vite 7.2
- **UI Library:** Material-UI 5.18
- **State Management:** Zustand
- **Routing:** React Router 7
- **WebSockets:** Socket.IO Client 4.8
- **Voice Input:** Web Speech API (browser native)

### DevOps
- **Containerization:** Docker & Docker Compose
- **Deployment:** Ready for Render, AWS, or any Node.js host
- **CI/CD:** GitHub Actions ready

## 📁 Project Structure

```
MultiLingualChat/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Romanization, logger, etc.
│   │   └── server.ts         # App entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API & WebSocket clients
│   │   ├── store/            # Zustand state management
│   │   ├── types/            # TypeScript types
│   │   ├── utils/            # Helper functions, language data
│   │   └── main.tsx          # App entry point
│   └── package.json
├── docker-compose.yml        # Docker orchestration
└── README.md                 # This file
```

## 🗄️ Database Schema

### Users
- Authentication (username, email, password)
- Profile (displayName, preferredLang, avatarUrl)
- Status (isOnline, lastSeen)

### Chat Rooms
- Type (direct, group)
- Participants
- Messages

### Messages
- Content (text, originalText, originalLang)
- Metadata (timestamp, sender, room)
- Message Translations (cached translations per language)

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/search` - Search users by username
- `PUT /api/v1/users/me` - Update current user profile
- `POST /api/v1/users/qr-code` - Generate QR code for user
- `POST /api/v1/users/quick-connect` - Connect via QR code

### Chat Rooms
- `GET /api/v1/chat-rooms` - Get user's chat rooms
- `POST /api/v1/chat-rooms` - Create new chat room
- `GET /api/v1/chat-rooms/:id` - Get room details
- `GET /api/v1/chat-rooms/:id/messages` - Get room messages (auto-translated)

### WebSocket Events
- `message_sent` - New message created
- `new_message` - Message received
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `message_read` - Message read by user
- `participant_joined` - User joined room
- `participant_left` - User left room

## 🌟 Key Features Explained

### Real-time Translation
Messages are translated when:
1. **Sending**: Original text stored with detected language
2. **Receiving**: Translated to each user's preferred language
3. **Language Switch**: All messages reload in new language

### Romanization System
- **Japanese**: Full kanji→romaji with kuroshiro (e.g., はじめまして → hajimemashite)
- **Universal**: Transliteration for 100+ languages (Chinese, Korean, Arabic, Russian, etc.)
- **Smart Display**: Only shows for non-Latin scripts in Learn Mode

### QR Code System
- **Generation**: User-specific QR codes with encrypted user ID
- **Scanning**: Camera-based QR scanning with auto-connect
- **Quick Connect**: Instantly creates/joins chat room

### Voice Input
- **Web Speech API**: Browser-native speech recognition
- **Language-Aware**: Automatically uses user's preferred language
- **Real-time**: Speech appears as text while speaking
- **Fallback**: Shows alert if browser doesn't support it

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test

# Manual testing
# 1. Create two users with different languages
# 2. Send messages between them
# 3. Verify translations appear correctly
# 4. Test Learn Mode romanization
# 5. Test voice input
# 6. Test QR code connection
```

## 🚀 Deployment

### Environment Variables (Production)

**Backend:**
```env
NODE_ENV=production
DATABASE_URL=file:./prod.db
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://your-domain.com
PORT=3000
```

**Frontend:**
```env
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
```

### Deployment Platforms

**Render:**
- Deploy backend as Web Service
- Deploy frontend as Static Site
- Set environment variables in dashboard

**AWS/DigitalOcean:**
- Use Docker Compose for easy deployment
- Configure reverse proxy (nginx) for frontend
- Set up SSL certificates (Let's Encrypt)

**Vercel/Netlify (Frontend only):**
- Deploy frontend with Vite build
- Configure API proxy or CORS

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **MyMemory Translation API** - Free translation service
- **kuroshiro** - Japanese romanization library
- **transliteration** - Universal romanization library
- **Material-UI** - Beautiful React components
- **Socket.IO** - Real-time WebSocket library

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the documentation files:
  - `SETUP_GUIDE.md` - Detailed installation instructions
  - `API_DESIGN.md` - Complete API reference
  - `DATABASE_SCHEMA.md` - Database structure
  - `TECH_STACK.md` - Technology overview

## 🗺️ Roadmap

### Completed ✅
- Real-time chat with Socket.IO
- Auto-translation (100+ languages)
- QR code connection
- Voice-to-text input
- Language learning mode with romanization
- On-the-fly language switching

### Coming Soon 🔜
- Text-to-speech for messages
- Translation confidence indicators
- Cultural context hints
- Emoji and slang handling
- Message reactions
- File/image sharing with caption translation
- Mobile app (React Native)
- End-to-end encryption

---

**Made with ❤️ for global communication**
