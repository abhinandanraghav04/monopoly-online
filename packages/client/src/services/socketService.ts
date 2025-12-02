import { io, Socket } from 'socket.io-client';
import { Player, Room } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  createRoom(payload: {
    name: string;
    boardSize: number;
    startingMoney: number;
    maxPlayers: number;
    hostId: string;
    hostUsername: string;
    hostAvatar: string;
    hostLevel: number;
  }) {
    this.socket?.emit('CREATE_ROOM', payload);
  }

  joinRoom(roomId: string, player: Player) {
    this.socket?.emit('JOIN_ROOM', { roomId, player });
  }

  leaveRoom(roomId: string, playerId: string) {
    this.socket?.emit('LEAVE_ROOM', { roomId, playerId });
  }

  toggleReady(roomId: string, playerId: string, isReady: boolean) {
    this.socket?.emit('PLAYER_READY', { roomId, playerId, isReady });
  }

  onPlayerJoined(callback: (data: { roomId: string; player: Player }) => void) {
    this.socket?.on('PLAYER_JOINED', callback);
  }

  onPlayerLeft(callback: (data: { roomId: string; playerId: string }) => void) {
    this.socket?.on('PLAYER_LEFT', callback);
  }

  onPlayerReady(callback: (data: { roomId: string; playerId: string; isReady: boolean }) => void) {
    this.socket?.on('PLAYER_READY', callback);
  }

  onGameEnded(callback: (data: { roomId: string; winnerId: string; leaderboard: unknown }) => void) {
    this.socket?.on('GAME_ENDED', callback);
  }

  onLeaderboardUpdate(callback: (data: { leaderboard: unknown }) => void) {
    this.socket?.on('LEADERBOARD_UPDATE', callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();
