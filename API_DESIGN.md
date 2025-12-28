# API Design Documentation

## 🌐 Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://api.multilingualchat.com/api/v1`

## 🔐 Authentication
All protected endpoints require JWT token in the header:
```
Authorization: Bearer <jwt_token>
```

---

## 📡 REST API Endpoints

### 🔑 Authentication Endpoints

#### 1. Register New User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "preferred_language": "en",
  "display_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "preferred_language": "en",
      "display_name": "John Doe",
      "created_at": "2025-12-26T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists"
  }
}
```

---

#### 2. Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "preferred_language": "en",
      "display_name": "John Doe",
      "avatar_url": null,
      "last_seen": "2025-12-26T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

#### 3. Logout
```http
POST /auth/logout
```
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### 4. Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

---

### 👤 User Endpoints

#### 5. Get Current User Profile
```http
GET /users/me
```
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "preferred_language": "en",
    "display_name": "John Doe",
    "avatar_url": "https://cdn.example.com/avatars/1.jpg",
    "bio": "Language enthusiast",
    "created_at": "2025-12-26T10:30:00Z",
    "is_online": true
  }
}
```

---

#### 6. Update User Profile
```http
PUT /users/me
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "display_name": "John Smith",
  "preferred_language": "es",
  "bio": "Aprendiendo español",
  "avatar_url": "https://cdn.example.com/avatars/new.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "display_name": "John Smith",
    "preferred_language": "es",
    "bio": "Aprendiendo español",
    "avatar_url": "https://cdn.example.com/avatars/new.jpg",
    "updated_at": "2025-12-26T11:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

#### 7. Search Users
```http
GET /users/search?q=john&limit=10
```
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "john_doe",
        "display_name": "John Doe",
        "avatar_url": "https://cdn.example.com/avatars/1.jpg",
        "preferred_language": "en",
        "is_online": true
      },
      {
        "id": 5,
        "username": "johnny_5",
        "display_name": "Johnny Five",
        "avatar_url": null,
        "preferred_language": "fr",
        "is_online": false
      }
    ],
    "total": 2
  }
}
```

---

### 💬 Chat Room Endpoints

#### 8. Get All Chat Rooms for User
```http
GET /chat-rooms?page=1&limit=20
```
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": 1,
        "name": "Spanish Learning Group",
        "type": "group",
        "description": "Practice Spanish together",
        "avatar_url": "https://cdn.example.com/rooms/1.jpg",
        "participant_count": 5,
        "last_message": {
          "text": "¡Hola a todos!",
          "sender": "maria_garcia",
          "timestamp": "2025-12-26T10:45:00Z"
        },
        "unread_count": 3,
        "created_at": "2025-12-20T08:00:00Z"
      },
      {
        "id": 2,
        "name": null,
        "type": "direct",
        "description": null,
        "avatar_url": null,
        "participants": [
          {
            "id": 3,
            "username": "alice_wang",
            "display_name": "Alice Wang",
            "preferred_language": "zh"
          }
        ],
        "last_message": {
          "text": "See you tomorrow!",
          "sender": "alice_wang",
          "timestamp": "2025-12-25T22:30:00Z"
        },
        "unread_count": 0,
        "created_at": "2025-12-15T14:20:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_rooms": 2
    }
  }
}
```

---

#### 9. Create Chat Room
```http
POST /chat-rooms
```
**Headers:** `Authorization: Bearer <token>`

**Request Body (Direct Chat):**
```json
{
  "type": "direct",
  "participant_ids": [3]
}
```

**Request Body (Group Chat):**
```json
{
  "type": "group",
  "name": "French Study Group",
  "description": "Daily French practice",
  "participant_ids": [3, 5, 7]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "room": {
      "id": 10,
      "name": "French Study Group",
      "type": "group",
      "description": "Daily French practice",
      "created_by": 1,
      "participants": [
        {
          "id": 1,
          "username": "john_doe",
          "role": "admin"
        },
        {
          "id": 3,
          "username": "alice_wang",
          "role": "member"
        }
      ],
      "created_at": "2025-12-26T11:15:00Z"
    }
  },
  "message": "Chat room created successfully"
}
```

---

#### 10. Get Chat Room Details
```http
GET /chat-rooms/:roomId
```
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Spanish Learning Group",
    "type": "group",
    "description": "Practice Spanish together",
    "avatar_url": "https://cdn.example.com/rooms/1.jpg",
    "created_by": 2,
    "created_at": "2025-12-20T08:00:00Z",
    "participants": [
      {
        "id": 1,
        "username": "john_doe",
        "display_name": "John Doe",
        "preferred_language": "en",
        "avatar_url": "https://cdn.example.com/avatars/1.jpg",
        "role": "member",
        "joined_at": "2025-12-20T08:05:00Z",
        "is_online": true
      },
      {
        "id": 2,
        "username": "maria_garcia",
        "display_name": "María García",
        "preferred_language": "es",
        "avatar_url": "https://cdn.example.com/avatars/2.jpg",
        "role": "admin",
        "joined_at": "2025-12-20T08:00:00Z",
        "is_online": false
      }
    ]
  }
}
```

---

#### 11. Add Participants to Room
```http
POST /chat-rooms/:roomId/participants
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "user_ids": [8, 9]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Participants added successfully"
}
```

---

#### 12. Leave Chat Room
```http
DELETE /chat-rooms/:roomId/leave
```
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Left chat room successfully"
}
```

---

### 📨 Message Endpoints

#### 13. Get Messages from Chat Room
```http
GET /chat-rooms/:roomId/messages?page=1&limit=50&before=2025-12-26T10:00:00Z
```
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50, max: 100)
- `before`: Get messages before this timestamp (for pagination)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 101,
        "sender": {
          "id": 2,
          "username": "maria_garcia",
          "display_name": "María García",
          "avatar_url": "https://cdn.example.com/avatars/2.jpg"
        },
        "text": "Hello everyone!",
        "original_text": "¡Hola a todos!",
        "original_language": "es",
        "message_type": "text",
        "timestamp": "2025-12-26T10:45:00Z",
        "is_edited": false,
        "reply_to": null
      },
      {
        "id": 100,
        "sender": {
          "id": 1,
          "username": "john_doe",
          "display_name": "John Doe",
          "avatar_url": "https://cdn.example.com/avatars/1.jpg"
        },
        "text": "Good morning!",
        "original_text": "Good morning!",
        "original_language": "en",
        "message_type": "text",
        "timestamp": "2025-12-26T10:30:00Z",
        "is_edited": false,
        "reply_to": null
      }
    ],
    "pagination": {
      "has_more": true,
      "next_before": "2025-12-26T10:30:00Z"
    }
  }
}
```

---

#### 14. Mark Messages as Read
```http
POST /chat-rooms/:roomId/read
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "last_read_message_id": 101
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

#### 15. Edit Message
```http
PUT /messages/:messageId
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Updated message text"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 101,
    "text": "Updated message text",
    "is_edited": true,
    "edited_at": "2025-12-26T11:00:00Z"
  }
}
```

---

#### 16. Delete Message
```http
DELETE /messages/:messageId
```
**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

### 🌍 Language Endpoints

#### 17. Get Supported Languages
```http
GET /languages
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "languages": [
      {
        "code": "en",
        "name": "English",
        "native_name": "English"
      },
      {
        "code": "es",
        "name": "Spanish",
        "native_name": "Español"
      },
      {
        "code": "fr",
        "name": "French",
        "native_name": "Français"
      }
    ]
  }
}
```

---

## 🔌 WebSocket Events

### Connection
```javascript
// Client connects to WebSocket
const socket = io('wss://api.multilingualchat.com', {
  auth: {
    token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});
```

---

### 📤 Client → Server Events

#### 1. Join Room
```javascript
socket.emit('join_room', {
  room_id: 1
});
```

**Server Response:**
```javascript
socket.on('room_joined', {
  room_id: 1,
  message: 'Successfully joined room'
});
```

---

#### 2. Leave Room
```javascript
socket.emit('leave_room', {
  room_id: 1
});
```

---

#### 3. Send Message
```javascript
socket.emit('send_message', {
  room_id: 1,
  text: 'Hello everyone!',
  language: 'en',
  reply_to_message_id: null  // optional
});
```

**Server Acknowledgement:**
```javascript
socket.on('message_sent', {
  message_id: 102,
  timestamp: '2025-12-26T11:30:00Z'
});
```

---

#### 4. Start Typing
```javascript
socket.emit('typing_start', {
  room_id: 1
});
```

---

#### 5. Stop Typing
```javascript
socket.emit('typing_stop', {
  room_id: 1
});
```

---

### 📥 Server → Client Events

#### 1. New Message Received
```javascript
socket.on('new_message', {
  message: {
    id: 102,
    room_id: 1,
    sender: {
      id: 2,
      username: 'maria_garcia',
      display_name: 'María García',
      avatar_url: 'https://cdn.example.com/avatars/2.jpg'
    },
    text: 'How are you?',  // Translated to receiver's language
    original_text: '¿Cómo estás?',
    original_language: 'es',
    timestamp: '2025-12-26T11:30:00Z',
    is_edited: false
  }
});
```

---

#### 2. Message Edited
```javascript
socket.on('message_edited', {
  message_id: 101,
  room_id: 1,
  new_text: 'Updated message',
  edited_at: '2025-12-26T11:35:00Z'
});
```

---

#### 3. Message Deleted
```javascript
socket.on('message_deleted', {
  message_id: 101,
  room_id: 1
});
```

---

#### 4. User Typing
```javascript
socket.on('user_typing', {
  room_id: 1,
  user: {
    id: 2,
    username: 'maria_garcia',
    display_name: 'María García'
  }
});
```

---

#### 5. User Stopped Typing
```javascript
socket.on('user_stopped_typing', {
  room_id: 1,
  user_id: 2
});
```

---

#### 6. User Online Status
```javascript
socket.on('user_status_changed', {
  user_id: 2,
  is_online: true,
  last_seen: '2025-12-26T11:40:00Z'
});
```

---

#### 7. New Participant Joined
```javascript
socket.on('participant_joined', {
  room_id: 1,
  user: {
    id: 5,
    username: 'alice_wang',
    display_name: 'Alice Wang',
    preferred_language: 'zh',
    joined_at: '2025-12-26T11:45:00Z'
  }
});
```

---

#### 8. Participant Left
```javascript
socket.on('participant_left', {
  room_id: 1,
  user_id: 5,
  username: 'alice_wang'
});
```

---

## 📊 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `TRANSLATION_ERROR` | 500 | Translation service failed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 🔒 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Message sending**: 60 messages per minute per room
- **API calls**: 100 requests per minute per user
- **WebSocket connections**: 10 concurrent connections per user

---

*API Version: v1.0 - Last Updated: December 26, 2025*
