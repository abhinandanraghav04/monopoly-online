# Deployment & Testing Scripts

This directory contains scripts for testing and verifying the Monopoly Online deployment.

## Scripts

### 1. Load Testing (`load-test.js`)

Simulates 8 concurrent players across all 4 board sizes to test production readiness.

**Usage:**

```bash
# Test production backend
npm run load-test -- https://monopoly-online-backend.herokuapp.com

# Test local backend
npm run load-test -- http://localhost:4000

# Direct execution
node scripts/load-test.js <backend-url>
```

**What it tests:**

- 8 simultaneous player connections per board size
- WebSocket stability
- Room creation and joining
- Player ready state synchronization
- Message latency and throughput
- Error rates

**Expected output:**

- Connections established: 32 (8 players × 4 board sizes)
- Connections failed: 0
- Errors encountered: 0
- Average latency: < 200ms (good), < 500ms (acceptable)

---

### 2. Deployment Verification (`verify-deployment.sh`)

Quick sanity check to verify backend API endpoints are responding correctly.

**Usage:**

```bash
# Verify production
npm run verify-deployment -- https://monopoly-online-backend.herokuapp.com https://monopoly-online.vercel.app

# Verify local
npm run verify-deployment -- http://localhost:4000 http://localhost:5173

# Direct execution
./scripts/verify-deployment.sh <backend-url> <frontend-url>
```

**What it tests:**

- Backend API accessibility
- User creation endpoint
- Leaderboard endpoint
- Rooms listing endpoint
- Frontend accessibility (optional)

**Expected output:**

- All tests passed: ✓
- Tests failed: 0

---

## Requirements

- **Node.js**: 18+ (for native fetch API support)
- **Dependencies**: Run `npm install` in the project root
- **Backend**: Must be running and accessible

---

## Interpreting Results

### Load Test Results

**✓ PASS Criteria:**

```
Connections Established:     32 (or 8 × number of board sizes tested)
Connections Failed:          0
Errors Encountered:          0
Average Latency:             < 500ms
```

**✗ FAIL Indicators:**

- Connection failures > 0: WebSocket or network issues
- Errors encountered > 0: Backend logic errors or timeouts
- Average latency > 1000ms: Performance bottleneck

### Deployment Verification Results

**✓ PASS Criteria:**

```
Tests Passed: 4-5
Tests Failed: 0
```

**✗ FAIL Indicators:**

- Backend not accessible: Server not running or wrong URL
- User creation failed: API endpoint issues
- Leaderboard/rooms failed: Database or logic errors

---

## Troubleshooting

### Load Test Issues

**Problem:** "Fetch API is not available"

**Solution:** Upgrade to Node.js 18 or later

---

**Problem:** All connections fail

**Solution:**
- Verify backend URL is correct
- Check backend is running: `curl <backend-url>/api/rooms`
- Verify firewall allows WebSocket connections
- Check CORS configuration allows origin

---

**Problem:** High latency or timeouts

**Solution:**
- Check backend server resources (CPU, memory)
- Verify network connectivity
- Reduce test duration or player count in script
- Check for backend bottlenecks in logs

---

### Verification Script Issues

**Problem:** "Backend is not accessible"

**Solution:**
- Verify backend is running
- Check URL is correct (include protocol: `http://` or `https://`)
- Test manually: `curl <backend-url>/api/rooms`

---

**Problem:** "User creation failed"

**Solution:**
- Check backend logs for errors
- Verify API endpoint is correct: `POST /api/user`
- Test manually:
  ```bash
  curl -X POST <backend-url>/api/user \
    -H "Content-Type: application/json" \
    -d '{"username":"TestUser"}'
  ```

---

## Next Steps

After successful verification:

1. ✅ All scripts pass
2. 📊 Monitor production metrics
3. 🧪 Run manual QA testing
4. 🚀 Share live URL with users
5. 📈 Set up analytics and error tracking

---

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Full production deployment instructions
- [Quick Start](../QUICKSTART.md) - Get running quickly
- [Main README](../README.md) - Project overview

---

**Ready to deploy! 🚀**
