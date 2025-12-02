import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import usersRouter from './routes/users.js';
import gamesRouter from './routes/games.js';
import leaderboardRouter from './routes/leaderboard.js';
import friendsRouter from './routes/friends.js';
import roomsRouter from './routes/rooms.js';
import { dataStore } from './store/DataStore.js';
import { Player } from './models/Room.js';
import { randomUUID } from 'node:crypto';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/user', usersRouter);
app.use('/api', gamesRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/rooms', roomsRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

type LobbyEvents =
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PLAYER_READY'
  | 'GAME_ENDED'
  | 'LEADERBOARD_UPDATE';

type RoomPayloads = {
  PLAYER_JOINED: { roomId: string; player: Player };
  PLAYER_LEFT: { roomId: string; playerId: string };
  PLAYER_READY: { roomId: string; playerId: string; isReady: boolean };
  GAME_ENDED: { roomId: string; winnerId: string; leaderboard: unknown };
  LEADERBOARD_UPDATE: { leaderboard: unknown };
};

const emit = <K extends LobbyEvents>(event: K, payload: RoomPayloads[K]) => {
  io.emit(event, payload);
};

io.on('connection', (socket) => {
  socket.on('CREATE_ROOM', (payload: {
    name: string;
    boardSize: number;
    startingMoney: number;
    maxPlayers: number;
    hostId: string;
    hostUsername: string;
    hostAvatar: string;
    hostLevel: number;
  }) => {
    const room = dataStore.createRoom(payload);
    socket.join(room.id);
    emit('PLAYER_JOINED', { roomId: room.id, player: room.players[0] });
  });

  socket.on('JOIN_ROOM', (payload: {
    roomId: string;
    player: Player;
  }) => {
    const { roomId, player } = payload;
    const room = dataStore.joinRoom(roomId, player);

    if (room) {
      socket.join(roomId);
      emit('PLAYER_JOINED', { roomId, player });
    }
  });

  socket.on('LEAVE_ROOM', (payload: { roomId: string; playerId: string }) => {
    const { roomId, playerId } = payload;
    const room = dataStore.leaveRoom(roomId, playerId);

    socket.leave(roomId);
    emit('PLAYER_LEFT', { roomId, playerId });

    if (!room) {
      io.to(roomId).emit('PLAYER_LEFT', { roomId, playerId });
    }
  });

  socket.on('PLAYER_READY', (payload: { roomId: string; playerId: string; isReady: boolean }) => {
    const { roomId, playerId, isReady } = payload;
    const room = dataStore.toggleReady(roomId, playerId, isReady);

    if (room) {
      emit('PLAYER_READY', { roomId, playerId, isReady });
      if (room.status === 'READY') {
        const result = {
          id: randomUUID(),
          players: room.players.map((player) => player.id),
          winnerId: room.players[0]?.id ?? '',
          durationMinutes: 40,
          boardSize: room.boardSize,
          earnings: Object.fromEntries(room.players.map((player, index) => [player.id, index === 0 ? 2000 : 1500])),
          finishedAt: new Date()
        };
        dataStore.saveGameResult(result);
        emit('GAME_ENDED', { roomId, winnerId: result.winnerId, leaderboard: dataStore.getLeaderboard('wins') });
        emit('LEADERBOARD_UPDATE', { leaderboard: dataStore.getLeaderboard('wins') });
      }
    }
  });
});

const PORT = process.env.PORT ?? 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
