# 🚀 Deployment Guide - Render + Vercel

## Quick Deploy (10-15 minutes)

### Step 1: Deploy Backend to Render (5-7 minutes)

1. **Go to Render**: https://render.com
2. **Sign Up/Login** with GitHub
3. Click **"New +"** → **"Web Service"**
4. **Connect Repository**: 
   - Select `Bhavith02/MultiLingualChat`
   - Click "Connect"
5. **Configure Service**:
   - **Name**: `multilingual-chat-api` (or any name)
   - **Region**: Oregon (free tier)
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: 
     ```
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**: 
     ```
     npm start
     ```
   - **Plan**: Free

6. **Environment Variables** - Click "Advanced" and add:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=file:./prod.db
   JWT_SECRET=<click "Generate" to create random secret>
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-app.vercel.app
   ```
   
   **Note**: Leave FRONTEND_URL blank for now, we'll update it after deploying frontend

7. Click **"Create Web Service"**
8. Wait 5-7 minutes for deployment
9. **Copy your backend URL**: e.g., `https://multilingual-chat-api.onrender.com`

### Step 2: Deploy Frontend to Vercel (3-5 minutes)

1. **Go to Vercel**: https://vercel.com
2. **Sign Up/Login** with GitHub
3. Click **"Add New..."** → **"Project"**
4. **Import Repository**:
   - Find `Bhavith02/MultiLingualChat`
   - Click "Import"
5. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

6. **Environment Variables** - Add these:
   ```
   VITE_API_URL=https://multilingual-chat-api.onrender.com
   VITE_WS_URL=wss://multilingual-chat-api.onrender.com
   ```
   
   **Replace with your actual Render URL from Step 1**

7. Click **"Deploy"**
8. Wait 2-3 minutes
9. **Copy your frontend URL**: e.g., `https://multilingual-chat.vercel.app`

### Step 3: Update Backend CORS (2 minutes)

1. Go back to **Render Dashboard**
2. Select your `multilingual-chat-api` service
3. Go to **"Environment"** tab
4. **Edit** `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://multilingual-chat.vercel.app
   ```
   **Use your actual Vercel URL**
5. Service will auto-redeploy (~2 minutes)

### Step 4: Test Your App! 🎉

1. Open your Vercel URL (frontend)
2. Register a new account
3. Try all features:
   - Send messages
   - Change language
   - Use voice input
   - Generate QR code
   - Test Learn Mode

### Share Your App 📱

Share your Vercel URL with anyone! They can:
- Scan your QR code to connect
- Register their own account
- Chat in their preferred language

---

## Troubleshooting

### Backend Issues

**Build fails on Render:**
- Check logs in Render dashboard
- Ensure `backend/package.json` has all dependencies
- Verify Prisma schema is valid

**Database connection error:**
- Render free tier uses SQLite in temp storage
- Data will reset on each deploy
- For persistent data, upgrade to Render PostgreSQL

**API not responding:**
- Check health endpoint: `https://your-api.onrender.com/health`
- Verify environment variables are set
- Check Render logs for errors

### Frontend Issues

**Can't connect to backend:**
- Verify `VITE_API_URL` in Vercel environment variables
- Check browser console for CORS errors
- Ensure backend `FRONTEND_URL` matches Vercel URL

**WebSocket not working:**
- Verify `VITE_WS_URL` uses `wss://` not `ws://`
- Check backend logs for WebSocket connections
- Some networks block WebSockets (try different network)

**Voice input not working:**
- Vercel serves over HTTPS automatically (required for voice)
- Grant microphone permissions in browser
- Use Chrome/Edge/Safari (Firefox doesn't support it)

### Render Free Tier Limitations

- **Cold starts**: Service spins down after 15 minutes of inactivity
- **First request slow**: Takes ~30 seconds to wake up
- **Database**: SQLite data resets on redeploy
- **Solution**: Upgrade to paid plan for always-on + PostgreSQL

### Performance Tips

**For production use:**
1. Upgrade Render to paid plan ($7/month) for:
   - Always-on (no cold starts)
   - PostgreSQL database (persistent)
   - Better performance

2. Consider deploying backend to:
   - Railway (similar to Render)
   - Fly.io (better global performance)
   - AWS/DigitalOcean (more control)

---

## Environment Variables Reference

### Backend (Render)
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./prod.db
JWT_SECRET=<random-secret-minimum-32-chars>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_WS_URL=wss://your-backend.onrender.com
```

---

## Alternative: Deploy Both to Vercel

You can also deploy both to Vercel using serverless functions, but it requires more configuration. The Render + Vercel approach is simpler for beginners.

---

## Updating Your App

**Backend updates:**
```bash
git add .
git commit -m "Update backend"
git push origin master
# Render auto-deploys
```

**Frontend updates:**
```bash
git add .
git commit -m "Update frontend"
git push origin master
# Vercel auto-deploys
```

Both platforms have automatic deployments enabled by default!

---

**Your app is now live and sharable! 🌍**
