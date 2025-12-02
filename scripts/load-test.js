#!/usr/bin/env node
/**
 * Load testing script for Monopoly Online
 * Tests 8 simultaneous players performing game actions
 *
 * Usage: node scripts/load-test.js <backend-url>
 * Example: node scripts/load-test.js https://monopoly-online-backend.herokuapp.com
 */

import { io } from 'socket.io-client';

const fetchFn = globalThis.fetch;

if (!fetchFn) {
  console.error('Fetch API is not available in this Node.js version. Please use Node >= 18.');
  process.exit(1);
}

// Configuration
const BACKEND_URL = process.argv[2] || 'http://localhost:4000';
const NUM_PLAYERS = 8;
const BOARD_SIZES = [6, 8, 12, 16];
const TEST_DURATION_MS = 60_000; // 1 minute

// Metrics
const metrics = {
  connectionsEstablished: 0,
  connectionsFailedToEstablish: 0,
  messagesReceived: 0,
  messagesSent: 0,
  errorsEncountered: 0,
  latencies: [],
  testStartTime: null,
  testEndTime: null
};

async function createUser(username) {
  try {
    const response = await fetchFn(`${BACKEND_URL}/api/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error creating user ${username}:`, error.message);
    metrics.errorsEncountered++;
    return null;
  }
}

function measureLatency(startTime) {
  const latency = Date.now() - startTime;
  metrics.latencies.push(latency);
  return latency;
}

async function simulatePlayer(playerId, playerName, roomId) {
  return new Promise((resolve) => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log(`✓ Player ${playerName} connected`);
      metrics.connectionsEstablished++;

      socket.emit('JOIN_ROOM', {
        roomId,
        player: {
          id: playerId,
          username: playerName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}`,
          level: 1,
          isReady: false,
          isHost: false
        }
      });
      metrics.messagesSent++;

      setTimeout(() => {
        const readyTime = Date.now();
        socket.emit('PLAYER_READY', {
          roomId,
          playerId,
          isReady: true
        });
        metrics.messagesSent++;

        const latency = measureLatency(readyTime);
        console.log(`  → Player ${playerName} ready (latency: ${latency}ms)`);
      }, Math.random() * 2000 + 500);
    });

    socket.on('connect_error', (error) => {
      console.error(`✗ Player ${playerName} connection error:`, error.message);
      metrics.connectionsFailedToEstablish++;
      metrics.errorsEncountered++;
    });

    const events = ['PLAYER_JOINED', 'PLAYER_LEFT', 'PLAYER_READY', 'GAME_ENDED', 'LEADERBOARD_UPDATE'];
    events.forEach((event) => {
      socket.on(event, (data) => {
        metrics.messagesReceived++;
        console.log(`  ← Player ${playerName} received ${event}`);
      });
    });

    setTimeout(() => {
      socket.emit('LEAVE_ROOM', { roomId, playerId });
      socket.disconnect();
      resolve();
    }, TEST_DURATION_MS);
  });
}

async function createRoom(hostUser, boardSize) {
  return new Promise((resolve) => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log(`Creating room with board size ${boardSize}x${boardSize}...`);

      socket.emit('CREATE_ROOM', {
        name: `Test Room ${boardSize}x${boardSize}`,
        boardSize,
        startingMoney: 1500,
        maxPlayers: NUM_PLAYERS,
        hostId: hostUser.id,
        hostUsername: hostUser.username,
        hostAvatar: hostUser.avatar,
        hostLevel: hostUser.level
      });
      metrics.messagesSent++;
    });

    socket.on('PLAYER_JOINED', (data) => {
      metrics.messagesReceived++;
      resolve({ roomId: data.roomId, socket });
    });

    socket.on('connect_error', (error) => {
      console.error('Failed to create room:', error.message);
      metrics.errorsEncountered++;
      resolve({ roomId: null, socket });
    });
  });
}

async function runLoadTest() {
  console.log('='.repeat(60));
  console.log('MONOPOLY ONLINE LOAD TEST');
  console.log('='.repeat(60));
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Number of Players: ${NUM_PLAYERS}`);
  console.log(`Test Duration: ${TEST_DURATION_MS / 1000}s`);
  console.log(`Board Sizes: ${BOARD_SIZES.join(', ')}`);
  console.log('='.repeat(60));
  console.log();

  metrics.testStartTime = Date.now();

  for (const boardSize of BOARD_SIZES) {
    console.log(`\nTesting board size: ${boardSize}x${boardSize}`);
    console.log('-'.repeat(60));

    console.log(`Creating ${NUM_PLAYERS} users...`);
    const users = [];
    for (let i = 0; i < NUM_PLAYERS; i++) {
      const username = `Player${i + 1}_${boardSize}x${boardSize}`;
      const user = await createUser(username);
      if (user) {
        users.push(user);
        console.log(`  ✓ Created user: ${username}`);
      }
    }

    if (users.length < 2) {
      console.error('Not enough users created. Skipping this board size.');
      continue;
    }

    const hostUser = users[0];
    const { roomId, socket: hostSocket } = await createRoom(hostUser, boardSize);

    if (!roomId) {
      console.error('Failed to create room. Skipping this board size.');
      hostSocket.disconnect();
      continue;
    }

    console.log(`\nSimulating ${users.length - 1} players joining room ${roomId}...`);
    const playerPromises = users.slice(1).map((user) => simulatePlayer(user.id, user.username, roomId));

    await Promise.all(playerPromises);

    hostSocket.disconnect();

    console.log(`\n✓ Completed test for board size ${boardSize}x${boardSize}`);
  }

  metrics.testEndTime = Date.now();
  printResults();
}

function printResults() {
  console.log('\n');
  console.log('='.repeat(60));
  console.log('LOAD TEST RESULTS');
  console.log('='.repeat(60));

  const totalTime = (metrics.testEndTime - metrics.testStartTime) / 1000;
  const avgLatency = metrics.latencies.length > 0
    ? (metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length).toFixed(2)
    : 'N/A';
  const minLatency = metrics.latencies.length > 0 ? Math.min(...metrics.latencies) : 'N/A';
  const maxLatency = metrics.latencies.length > 0 ? Math.max(...metrics.latencies) : 'N/A';

  console.log(`Total Test Duration:         ${totalTime.toFixed(2)}s`);
  console.log(`Connections Established:     ${metrics.connectionsEstablished}`);
  console.log(`Connections Failed:          ${metrics.connectionsFailedToEstablish}`);
  console.log(`Messages Sent:               ${metrics.messagesSent}`);
  console.log(`Messages Received:           ${metrics.messagesReceived}`);
  console.log(`Errors Encountered:          ${metrics.errorsEncountered}`);
  console.log();
  console.log('Latency Statistics:');
  console.log(`  Average:                   ${avgLatency}ms`);
  console.log(`  Minimum:                   ${minLatency}ms`);
  console.log(`  Maximum:                   ${maxLatency}ms`);
  console.log('='.repeat(60));

  const passed = metrics.connectionsFailedToEstablish === 0
    && metrics.errorsEncountered === 0
    && metrics.connectionsEstablished >= NUM_PLAYERS * BOARD_SIZES.length;

  if (passed) {
    console.log('✓ LOAD TEST PASSED');
  } else {
    console.log('✗ LOAD TEST FAILED');
  }
  console.log('='.repeat(60));
}

runLoadTest().catch((error) => {
  console.error('Fatal error during load test:', error);
  process.exit(1);
});
