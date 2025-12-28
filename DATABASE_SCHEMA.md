# Database Schema Design

## 🗄️ Database: PostgreSQL

## Entity-Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│     USERS       │         │   CHAT_ROOMS     │         │    MESSAGES     │
├─────────────────┤         ├──────────────────┤         ├─────────────────┤
│ id (PK)         │────┐    │ id (PK)          │    ┌────│ id (PK)         │
│ username        │    │    │ name             │    │    │ chat_room_id(FK)│
│ email           │    │    │ type             │    │    │ sender_id (FK)  │
│ password_hash   │    │    │ created_at       │    │    │ original_text   │
│ preferred_lang  │    │    │ updated_at       │    │    │ original_lang   │
│ created_at      │    │    └──────────────────┘    │    │ timestamp       │
│ updated_at      │    │             │              │    │ is_edited       │
│ last_seen       │    │             │              │    │ edited_at       │
│ is_active       │    │             │              │    └─────────────────┘
└─────────────────┘    │             │              │
         │             │             │              │
         │             │             │              │
         │             │    ┌────────▼───────────┐  │
         │             │    │ ROOM_PARTICIPANTS  │  │
         │             │    ├────────────────────┤  │
         │             └───►│ id (PK)            │  │
         │                  │ room_id (FK)       │  │
         └─────────────────►│ user_id (FK)       │  │
                            │ joined_at          │  │
                            │ role               │  │
                            │ is_muted           │  │
                            └────────────────────┘  │
                                                    │
         ┌──────────────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│  MESSAGE_TRANSLATIONS│
├─────────────────────┤
│ id (PK)             │
│ message_id (FK)     │
│ target_language     │
│ translated_text     │
│ created_at          │
└─────────────────────┘
```

## 📋 Table Definitions

### 1. **users** Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_online BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_last_seen ON users(last_seen);
```

**Fields Explanation:**
- `id`: Unique identifier for each user
- `username`: Unique username for login
- `email`: User's email address
- `password_hash`: Hashed password (using bcrypt)
- `preferred_language`: ISO 639-1 language code (en, es, fr, etc.)
- `display_name`: Name shown to other users
- `avatar_url`: Profile picture URL
- `is_online`: Real-time online status

---

### 2. **chat_rooms** Table

```sql
CREATE TABLE chat_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    description TEXT,
    avatar_url VARCHAR(500),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX idx_chat_rooms_created_by ON chat_rooms(created_by);
```

**Fields Explanation:**
- `id`: Unique identifier for each chat room
- `type`: 'direct' for 1-on-1, 'group' for multiple users
- `name`: Chat room name (optional for direct chats)
- `created_by`: User who created the room
- `is_active`: Soft delete flag

---

### 3. **room_participants** Table

```sql
CREATE TABLE room_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    last_read_message_id INTEGER,
    UNIQUE(room_id, user_id)
);

-- Indexes
CREATE INDEX idx_room_participants_room ON room_participants(room_id);
CREATE INDEX idx_room_participants_user ON room_participants(user_id);
CREATE INDEX idx_room_participants_active ON room_participants(room_id, user_id) 
    WHERE left_at IS NULL;
```

**Fields Explanation:**
- `room_id` + `user_id`: Links users to chat rooms
- `role`: 'admin' can manage room, 'member' is regular participant
- `left_at`: NULL if still in room, timestamp when left
- `last_read_message_id`: For unread message count

---

### 4. **messages** Table

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    original_text TEXT NOT NULL,
    original_language VARCHAR(10) NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' 
        CHECK (message_type IN ('text', 'image', 'file', 'voice')),
    attachment_url VARCHAR(500),
    reply_to_message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_messages_room ON messages(chat_room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Fields Explanation:**
- `original_text`: The message in sender's language
- `original_language`: Language code of the sender
- `message_type`: Type of message (text, image, etc.)
- `reply_to_message_id`: For threaded conversations
- `is_deleted`: Soft delete (show "Message deleted")

---

### 5. **message_translations** Table

```sql
CREATE TABLE message_translations (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    target_language VARCHAR(10) NOT NULL,
    translated_text TEXT NOT NULL,
    translation_provider VARCHAR(50) DEFAULT 'google',
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, target_language)
);

-- Indexes
CREATE INDEX idx_translations_message ON message_translations(message_id);
CREATE INDEX idx_translations_language ON message_translations(target_language);
```

**Fields Explanation:**
- `message_id`: Links to original message
- `target_language`: The language this was translated to
- `translated_text`: The translated message
- `translation_provider`: Which API was used (google, deepl)
- `confidence_score`: Translation quality (if provided by API)

---

### 6. **languages** Table (Reference Data)

```sql
CREATE TABLE languages (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    is_supported BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate with common languages
INSERT INTO languages (code, name, native_name) VALUES
    ('en', 'English', 'English'),
    ('es', 'Spanish', 'Español'),
    ('fr', 'French', 'Français'),
    ('de', 'German', 'Deutsch'),
    ('zh', 'Chinese', '中文'),
    ('ja', 'Japanese', '日本語'),
    ('ko', 'Korean', '한국어'),
    ('ar', 'Arabic', 'العربية'),
    ('hi', 'Hindi', 'हिन्दी'),
    ('pt', 'Portuguese', 'Português'),
    ('ru', 'Russian', 'Русский'),
    ('it', 'Italian', 'Italiano');
```

---

### 7. **sessions** Table (Optional - for JWT blacklisting)

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## 🔗 Relationships Summary

```
users (1) ──< (N) room_participants (N) >── (1) chat_rooms
  │                                               │
  │                                               │
  └─────> (1) ──< (N) messages (N) >─────────────┘
                        │
                        │
                        └──< (N) message_translations
```

**Relationships:**
- One user can be in many chat rooms (through room_participants)
- One chat room can have many users (through room_participants)
- One user can send many messages
- One chat room contains many messages
- One message can have many translations (one per target language)

---

## 📊 Sample Data Queries

### Get all messages in a chat room (translated for user)

```sql
SELECT 
    m.id,
    u.username as sender,
    COALESCE(mt.translated_text, m.original_text) as message_text,
    m.created_at,
    m.is_edited
FROM messages m
JOIN users u ON m.sender_id = u.id
LEFT JOIN message_translations mt 
    ON m.id = mt.message_id 
    AND mt.target_language = 'es'  -- User's preferred language
WHERE m.chat_room_id = 1
ORDER BY m.created_at DESC
LIMIT 50;
```

### Get unread message count for a user

```sql
SELECT 
    cr.id,
    cr.name,
    COUNT(m.id) as unread_count
FROM chat_rooms cr
JOIN room_participants rp ON cr.id = rp.room_id
LEFT JOIN messages m ON cr.id = m.chat_room_id 
    AND m.id > COALESCE(rp.last_read_message_id, 0)
WHERE rp.user_id = 1 
    AND rp.left_at IS NULL
GROUP BY cr.id, cr.name;
```

---

## 🔧 Database Optimizations

### Partitioning (for large scale)
```sql
-- Partition messages by month for better query performance
CREATE TABLE messages_2025_01 PARTITION OF messages
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### Materialized Views (for analytics)
```sql
-- Most active users
CREATE MATERIALIZED VIEW active_users_stats AS
SELECT 
    u.id,
    u.username,
    COUNT(m.id) as message_count,
    COUNT(DISTINCT m.chat_room_id) as rooms_count
FROM users u
LEFT JOIN messages m ON u.id = m.sender_id
GROUP BY u.id, u.username;
```

---

*This schema supports Phase 1 MVP and is extensible for future features.*
