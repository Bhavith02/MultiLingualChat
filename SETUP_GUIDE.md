# 🛠️ Setup Guide - MultiLingualChat

Complete installation and configuration guide for development and production.

## 📋 Prerequisites

### Required
- **Node.js** 20.19.6 or higher ([Download](https://nodejs.org/))
- **npm** 10.9.2 or higher (comes with Node.js)
- **Git** (for cloning repository)

### Optional
- **Docker** & **Docker Compose** (for containerized deployment)
- **PostgreSQL** or **MySQL** (if not using SQLite)

## 🚀 Quick Setup (Development)

### 1. Clone Repository

```bash
git clone <repository-url>
cd MultiLingualChat
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: Seed database with test data
npx prisma db seed

# Start development server
npm run dev
```

**Backend will run on:** `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with backend URL
nano .env

# Start development server
npm run dev
```

**Frontend will run on:** `http://localhost:5173`

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=file:./dev.db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Optional: Additional allowed origins (comma-separated)
# ADDITIONAL_ORIGINS=http://10.63.34.160:5173
```

**Important:**
- Change `JWT_SECRET` to a strong random string in production
- `DATABASE_URL` uses SQLite by default (no setup needed)
- For PostgreSQL: `postgresql://user:password@localhost:5432/multilingual_chat`
- For MySQL: `mysql://user:password@localhost:3306/multilingual_chat`

### Frontend Environment Variables

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

**Network Access:**
If accessing from other devices on your network:

```env
VITE_API_URL=http://YOUR_IP:3000
VITE_WS_URL=ws://YOUR_IP:3000
```

Replace `YOUR_IP` with your machine's local IP address.

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

**Access:**
- Frontend: `http://localhost`
- Backend: `http://localhost:3000`

### Docker Configuration

The `docker-compose.yml` is pre-configured. To customize:

```yaml
environment:
  - JWT_SECRET=your-custom-secret
  - DATABASE_URL=postgresql://...
  - PORT=3000
```

## 🗄️ Database Setup

### SQLite (Default)

No additional setup required. Database file created automatically at `backend/prisma/dev.db`.

### PostgreSQL

```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Create database
createdb multilingual_chat

# Update backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/multilingual_chat"

# Run migrations
cd backend
npx prisma migrate dev
```

### MySQL

```bash
# Install MySQL
# Ubuntu/Debian
sudo apt install mysql-server

# macOS
brew install mysql

# Create database
mysql -u root -p
CREATE DATABASE multilingual_chat;
exit;

# Update backend/.env
DATABASE_URL="mysql://user:password@localhost:3306/multilingual_chat"

# Run migrations
cd backend
npx prisma migrate dev
```

## 🔧 Development Commands

### Backend

```bash
cd backend

# Development server (with hot reload)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# View database schema
npx prisma db pull

# Reset database
npx prisma migrate reset
```

### Frontend

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Production Deployment

### Build for Production

**Backend:**
```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Output in: dist/
```

### Environment Variables (Production)

**Backend:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=<strong-random-secret-minimum-32-characters>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
```

**Frontend:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Deployment Platforms

#### Render

**Backend (Web Service):**
1. Connect GitHub repository
2. Select `backend` as root directory
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm start`
5. Add environment variables in dashboard

**Frontend (Static Site):**
1. Connect GitHub repository
2. Select `frontend` as root directory
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add environment variables

#### AWS / DigitalOcean

```bash
# Clone on server
git clone <repo-url>
cd MultiLingualChat

# Setup using Docker
docker-compose -f docker-compose.prod.yml up -d

# Or manual setup
cd backend && npm install && npm run build && pm2 start dist/server.js
cd ../frontend && npm install && npm run build
# Serve frontend/dist with nginx
```

#### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
```

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Errors

```bash
# Reset database
cd backend
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Failed

- Check `VITE_WS_URL` in frontend/.env
- Ensure backend is running
- Check firewall settings
- Verify CORS configuration in backend

### Voice Input Not Working

- Use Chrome, Edge, or Safari (Firefox doesn't support Web Speech API)
- Allow microphone permissions in browser
- Check HTTPS (required for production)

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test

# E2E tests (if implemented)
npm run test:e2e
```

## 📝 Notes

### Language Support
- 100+ languages supported
- No API key required (using MyMemory free tier)
- Translation happens server-side
- Romanization for non-Latin scripts

### Browser Compatibility
- **Chrome/Edge**: Full support (recommended)
- **Safari**: Full support
- **Firefox**: Translation works, voice input not supported

### Performance
- SQLite suitable for small-medium deployments
- For high traffic, use PostgreSQL with connection pooling
- Consider Redis for session storage in production

### Security
- Always use strong JWT_SECRET in production
- Enable HTTPS for production deployments
- Keep dependencies updated
- Configure rate limiting appropriately

## 🆘 Getting Help

1. Check [README.md](README.md) for overview
2. Review [API_DESIGN.md](API_DESIGN.md) for API details
3. Check [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for database structure
4. Check [FEATURES.md](FEATURES.md) for feature list
5. Open an issue on GitHub

---

*Last Updated: December 28, 2025*
