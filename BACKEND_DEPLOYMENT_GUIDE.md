# Monopoly Nexus - Backend Deployment Guide

**Frontend Live URL**: https://monopoly-online-cyan.vercel.app

## The Issue: "Unable to load rooms"

The frontend is fully functional but needs a backend server to create and manage game rooms. Follow this guide to get the backend running in 5 minutes.

## Quick Deploy: Render.com (FREE)

### Step 1: Create Render Account
- Go to render.com
- Click "Sign up" and use GitHub

### Step 2: Create New Web Service
- Dashboard → New → Web Service  
- Connect repository: abhinandanraghav04/monopoly-online
- Name: monopoly-server
- Branch: main
- Build Command: cd packages/server && npm install
- Start Command: npm start
- Plan: Free

### Step 3: Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
PORT=4000
JWT_SECRET=use-a-random-secret-key-here
DATABASE_URL=sqlite:///./monopoly.db
```

### Step 4: Copy Backend URL
Wait 5 minutes for deployment, then copy the URL from Render (example: https://monopoly-server-xyz.onrender.com)

### Step 5: Update Vercel Environment Variable
- Go to vercel.com → monopoly-online → Settings → Environment Variables
- Add: VITE_API_URL = [your Render URL from Step 4]
- Save and wait for redeploy

### Step 6: Test!
- Visit https://monopoly-online-cyan.vercel.app
- "Create Room" button should now work
- Test multiplayer by opening game in 2-8 browser tabs

## Done!
Your full multiplayer Monopoly game is now live and playable!
