# Monopoly Online - Production Deployment Guide

This comprehensive guide explains how to deploy the Monopoly Online application to production using Vercel (frontend) and Heroku or Railway (backend).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Heroku/Railway)](#backend-deployment)
3. [Frontend Deployment (Vercel)](#frontend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Load Testing](#load-testing)
6. [Final Verification Checklist](#final-verification-checklist)
7. [Local Development Setup](#local-development-setup)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] Node.js 18+ installed locally
- [x] Git repository hosted on GitHub
- [x] Vercel account (free tier works)
- [x] Heroku or Railway account (free tier works)
- [x] All dependencies installed: `npm install`
- [x] All tests passing: `npm test`

---

## Backend Deployment

### Option A: Heroku

#### Step 1: Create Heroku App

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create a new app
heroku create monopoly-online-backend

# OR if you want a custom name
heroku create your-custom-backend-name
```

#### Step 2: Configure Environment Variables

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=4000
heroku config:set DATABASE_URL=your-database-url-if-needed
heroku config:set JWT_SECRET=your-super-secret-jwt-key
```

Or configure them in the Heroku Dashboard:
1. Go to your app's Settings tab
2. Click "Reveal Config Vars"
3. Add the following variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (generate a secure random string)
   - `DATABASE_URL`: (if using a database)

#### Step 3: Deploy Backend

**Using Git Push:**

```bash
# Add Heroku remote
heroku git:remote -a monopoly-online-backend

# Since we're using a monorepo, we need to deploy the server subdirectory
# Create a subtree deployment
git subtree push --prefix packages/server heroku main
```

**Using GitHub Integration:**

1. Go to Heroku Dashboard → Deploy tab
2. Choose "GitHub" as deployment method
3. Connect to your `monopoly-online` repository
4. Enable Automatic Deploys from `main` branch
5. Click "Deploy Branch"

#### Step 4: Verify Backend

```bash
# Check logs
heroku logs --tail

# Test the API
curl https://monopoly-online-backend.herokuapp.com/api/rooms
```

Your backend URL will be: `https://monopoly-online-backend.herokuapp.com`

---

### Option B: Railway

#### Step 1: Create Railway Project

1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `monopoly-online` repository

#### Step 2: Configure Service

1. Set the root directory to `packages/server`
2. Railway will auto-detect the Node.js environment

#### Step 3: Add Environment Variables

In Railway Dashboard → Variables tab, add:

```
NODE_ENV=production
PORT=4000
JWT_SECRET=your-super-secret-jwt-key
```

#### Step 4: Deploy

Railway will automatically deploy. Your backend URL will be something like:
`https://monopoly-online-backend.up.railway.app`

---

## Frontend Deployment

### Step 1: Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your `monopoly-online` repository

### Step 2: Configure Project Settings

**Framework Preset:** Vite

**Root Directory:** `packages/client`

**Build Command:**
```bash
npm run build
```

**Output Directory:** `dist`

**Install Command:**
```bash
npm install
```

### Step 3: Set Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
VITE_API_URL=https://monopoly-online-backend.herokuapp.com
VITE_SOCKET_URL=https://monopoly-online-backend.herokuapp.com
```

**Important:** Replace the URLs with your actual backend URL from Step 1.

### Step 4: Deploy

Click "Deploy" - Vercel will build and deploy your frontend.

Your live URL will be: `https://monopoly-online.vercel.app` (or custom domain)

---

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Heroku sets this automatically) | `4000` |
| `DATABASE_URL` | Database connection string (if using DB) | `postgresql://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key-256-bits` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `https://monopoly-online-backend.herokuapp.com` |
| `VITE_SOCKET_URL` | WebSocket endpoint | `https://monopoly-online-backend.herokuapp.com` |

---

## Load Testing

Before load testing, run the quick verification script to ensure the backend is reachable:

```bash
npm run verify-deployment -- https://monopoly-online-backend.herokuapp.com https://monopoly-online.vercel.app
```

### Prerequisites

Install dependencies:

```bash
npm install
```

### Running the Load Test

Test with production backend:

```bash
npm run load-test -- https://monopoly-online-backend.herokuapp.com
```

Test with local backend:

```bash
npm run load-test -- http://localhost:4000
```

### What the Load Test Does

The script (`scripts/load-test.js`) automatically:

1. **Creates 8 test users** for each board size
2. **Tests all 4 board sizes**: 6x6, 8x8, 12x12, 16x16
3. **Simulates concurrent gameplay**:
   - Creates game rooms
   - 8 players join simultaneously
   - Players toggle ready status
   - Monitors WebSocket connections
4. **Measures performance metrics**:
   - Connection success rate
   - Message latency (avg, min, max)
   - Error rates
   - Response times
5. **Reports results** with pass/fail status

### Expected Results

✓ **PASS Criteria:**
- All 8 players connect successfully per board size
- Zero connection failures
- Zero errors encountered
- Average latency < 200ms (good), < 500ms (acceptable)

### Sample Output

```
============================================================
MONOPOLY ONLINE LOAD TEST
============================================================
Backend URL: https://monopoly-online-backend.herokuapp.com
Number of Players: 8
Test Duration: 60s
Board Sizes: 6, 8, 12, 16
============================================================

Testing board size: 6x6
------------------------------------------------------------
Creating 8 users...
  ✓ Created user: Player1_6x6
  ✓ Created user: Player2_6x6
  ...
Creating room with board size 6x6...
Room xyz123 created successfully
...

============================================================
LOAD TEST RESULTS
============================================================
Total Test Duration:         245.32s
Connections Established:     32
Connections Failed:          0
Messages Sent:               128
Messages Received:           256
Errors Encountered:          0

Latency Statistics:
  Average:                   127.45ms
  Minimum:                   45ms
  Maximum:                   320ms
============================================================
✓ LOAD TEST PASSED
============================================================
```

---

## Final Verification Checklist

Before sharing the live URL, verify:

### Multiplayer & Performance
- [ ] 8 players can join and play simultaneously
- [ ] All 4 board sizes work (6x6, 8x8, 12x12, 16x16)
- [ ] No lag or desynchronization between players
- [ ] WebSocket connections remain stable
- [ ] Game state persists correctly

### Game Features
- [ ] Players can create and join rooms
- [ ] Dice rolling works for all players
- [ ] Property purchasing works
- [ ] Rent collection functions properly
- [ ] Turn system rotates correctly
- [ ] Game ends correctly with winner declared

### UI & UX
- [ ] Audio effects play on all actions
- [ ] Animations are smooth (target 60 FPS)
- [ ] UI is responsive on desktop and mobile
- [ ] Leaderboard displays correctly
- [ ] Game history shows past games

### Data & Persistence
- [ ] User profiles save correctly
- [ ] Game results are recorded
- [ ] Leaderboard updates in real-time
- [ ] Friend system works
- [ ] Achievements unlock properly

### Production Environment
- [ ] HTTPS enabled on both frontend and backend
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] Error logging active
- [ ] No console errors in production

---

## Local Development Setup

For local development and testing:

### 1. Clone Repository

```bash
git clone https://github.com/your-username/monopoly-online.git
cd monopoly-online
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

**Backend** (`packages/server/.env`):
```env
PORT=4000
NODE_ENV=development
```

**Frontend** (`packages/client/.env.development`):
```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

### 4. Run Development Servers

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately in different terminals
npm run dev:server  # Terminal 1
npm run dev:client  # Terminal 2
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **WebSocket**: ws://localhost:4000

---

## Troubleshooting

### Backend Issues

**Problem:** Backend fails to start on Heroku

**Solution:**
- Check `heroku logs --tail` for errors
- Verify `package.json` has correct `start` script
- Ensure `Procfile` exists in `packages/server/`
- Check that PORT environment variable is not hardcoded

**Problem:** CORS errors in production

**Solution:**
```javascript
// In packages/server/src/index.ts
app.use(cors({
  origin: ['https://monopoly-online.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

### Frontend Issues

**Problem:** Environment variables not loading

**Solution:**
- Ensure variables start with `VITE_`
- Redeploy after changing environment variables in Vercel
- Clear browser cache and hard refresh

**Problem:** WebSocket connection fails

**Solution:**
- Verify `VITE_SOCKET_URL` matches backend URL exactly
- Check backend allows WebSocket connections
- Ensure no CORS blocking WebSocket handshake

### Load Test Issues

**Problem:** Load test times out or fails

**Solution:**
- Check backend is running: `curl <backend-url>/api/rooms`
- Verify firewall/network allows WebSocket connections
- Reduce `NUM_PLAYERS` or `TEST_DURATION_MS` in script
- Check Node.js version is 18+ (for native fetch API)

---

## Live URLs & Repository

Once deployed, you'll have:

- **Live Game URL**: https://monopoly-online.vercel.app
- **Backend API**: https://monopoly-online-backend.herokuapp.com
- **GitHub Repository**: https://github.com/your-username/monopoly-online

---

## Next Steps

1. Share the live URL with users/testers
2. Monitor application logs for errors
3. Set up error tracking (Sentry, LogRocket, etc.)
4. Configure custom domain (optional)
5. Set up CI/CD for automatic deployments
6. Add monitoring/analytics (Vercel Analytics, etc.)

---

## Support & Documentation

- Main README: [`README.md`](./README.md)
- API Documentation: [`packages/server/README.md`](./packages/server/README.md)
- Client Documentation: [`packages/client/README.md`](./packages/client/README.md)

---

**Deployment Complete! 🎉**

Your Monopoly Online game is now live and ready for 8-player action!
