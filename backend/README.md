# MultiLingual Chat Backend

Backend server for the MultiLingual Chat application - a real-time chat platform with automatic message translation.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional for development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and API keys
```

3. Set up the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI
- `npm test` - Run tests

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update user profile
- `GET /api/v1/users/search` - Search users

### Chat Rooms
- `GET /api/v1/chat-rooms` - Get all chat rooms
- `POST /api/v1/chat-rooms` - Create chat room
- `GET /api/v1/chat-rooms/:id` - Get chat room details
- `GET /api/v1/chat-rooms/:id/messages` - Get messages

### Languages
- `GET /api/v1/languages` - Get supported languages

## 🔌 WebSocket Events

### Client → Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server → Client
- `new_message` - New message received
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `participant_joined` - User joined room
- `participant_left` - User left room

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 License

MIT
