# Monopoly Online - Quick Start Guide

Get your Monopoly Online game up and running in minutes!

---

## For Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Servers

```bash
npm run dev
```

This starts both the backend (port 4000) and frontend (port 5173).

### 3. Open the Game

Navigate to: **http://localhost:5173**

---

## For Production Deployment

### Backend (Heroku)

1. Create Heroku app:
   ```bash
   heroku create monopoly-online-backend
   ```

2. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   ```

3. Deploy:
   ```bash
   git subtree push --prefix packages/server heroku main
   ```

### Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and import your repo
2. Set root directory to `packages/client`
3. Add environment variables:
   - `VITE_API_URL`: Your Heroku backend URL
   - `VITE_SOCKET_URL`: Your Heroku backend URL
4. Deploy!

---

## Testing

### Run Tests

```bash
npm test
```

### Verify Deployment

```bash
npm run verify-deployment -- https://your-backend-url.herokuapp.com
```

### Load Test (8 Players)

```bash
npm run load-test -- https://your-backend-url.herokuapp.com
```

---

## Documentation

- **Full Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Main README**: [README.md](./README.md)
- **Server Docs**: [packages/server/README.md](./packages/server/README.md)
- **Client Docs**: [packages/client/README.md](./packages/client/README.md)

---

## Support

For detailed instructions, troubleshooting, and configuration options, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

**Happy Gaming! 🎲🏠**
