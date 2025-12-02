import { randomUUID } from 'node:crypto';
import { CreateUserInput, UpdateUserInput, User } from '../models/User.js';
import { GameResult } from '../models/Game.js';
import { CreateRoomInput, Player, Room } from '../models/Room.js';

interface FriendRelationship {
  userId: string;
  friendId: string;
  createdAt: Date;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const achievements: Achievement[] = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game.',
    icon: '🏆'
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Earn 10,000 total credits.',
    icon: '🎲'
  }
];

export class DataStore {
  private users: Map<string, User> = new Map();
  private games: GameResult[] = [];
  private rooms: Map<string, Room> = new Map();
  private friends: FriendRelationship[] = [];

  createUser(input: CreateUserInput): User {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      id,
      username: input.username,
      avatar: input.avatar ?? this.generateAvatar(input.username),
      level: 1,
      experience: 0,
      totalGames: 0,
      wins: 0,
      losses: 0,
      totalEarnings: 0,
      achievements: [],
      createdAt: now,
      lastActive: now
    };

    this.users.set(id, user);
    return user;
  }

  updateUser(id: string, input: UpdateUserInput): User | undefined {
    const existing = this.users.get(id);
    if (!existing) return undefined;

    const updated: User = {
      ...existing,
      username: input.username ?? existing.username,
      avatar: input.avatar ?? existing.avatar,
      lastActive: new Date()
    };

    this.users.set(id, updated);
    return updated;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  findUserByUsername(username: string): User | undefined {
    const normalized = username.trim().toLowerCase();
    return this.getUsers().find((user) => user.username.toLowerCase() === normalized);
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  createRoom(input: CreateRoomInput): Room {
    const id = randomUUID();
    const now = new Date();

    const host: Player = {
      id: input.hostId,
      username: input.hostUsername,
      avatar: input.hostAvatar,
      level: input.hostLevel,
      isReady: true,
      isHost: true
    };

    const room: Room = {
      id,
      name: input.name,
      hostId: input.hostId,
      players: [host],
      maxPlayers: input.maxPlayers,
      boardSize: input.boardSize,
      startingMoney: input.startingMoney,
      status: 'WAITING',
      createdAt: now
    };

    this.rooms.set(id, room);
    return room;
  }

  getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  joinRoom(roomId: string, player: Player): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    if (room.players.some((p) => p.id === player.id)) return room;
    if (room.players.length >= room.maxPlayers) return undefined;

    room.players.push(player);
    this.updateRoomStatus(room);
    return room;
  }

  leaveRoom(roomId: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    room.players = room.players.filter((player) => player.id !== playerId);
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return undefined;
    }

    if (room.hostId === playerId) {
      const newHost = room.players[0];
      room.hostId = newHost.id;
      room.players = room.players.map((player, index) => ({
        ...player,
        isHost: index === 0
      }));
    }

    this.updateRoomStatus(room);
    return room;
  }

  toggleReady(roomId: string, playerId: string, ready: boolean): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    room.players = room.players.map((player) =>
      player.id === playerId ? { ...player, isReady: ready } : player
    );

    this.updateRoomStatus(room);
    return room;
  }

  saveGameResult(result: GameResult): void {
    this.games.push(result);

    result.players.forEach((playerId) => {
      const user = this.users.get(playerId);
      if (!user) return;

      const earnings = result.earnings[playerId] ?? 0;
      const didWin = result.winnerId === playerId;

      const updated: User = {
        ...user,
        totalGames: user.totalGames + 1,
        wins: user.wins + (didWin ? 1 : 0),
        losses: user.losses + (didWin ? 0 : 1),
        totalEarnings: user.totalEarnings + earnings,
        level: this.calculateLevel(user.experience + earnings),
        experience: user.experience + earnings,
        lastActive: new Date()
      };

      const unlocked = this.determineAchievements(updated);
      updated.achievements = Array.from(new Set([...updated.achievements, ...unlocked]));

      this.users.set(playerId, updated);
    });
  }

  getGameHistory(userId: string): GameResult[] {
    return this.games.filter((game) => game.players.includes(userId));
  }

  getLeaderboard(sortBy: 'wins' | 'winRate' | 'level'): User[] {
    const users = this.getUsers();
    switch (sortBy) {
      case 'winRate':
        return users.sort((a, b) => this.calculateWinRate(b) - this.calculateWinRate(a));
      case 'level':
        return users.sort((a, b) => b.level - a.level);
      case 'wins':
      default:
        return users.sort((a, b) => b.wins - a.wins);
    }
  }

  addFriend(userId: string, friendId: string): void {
    if (this.friends.some((rel) => rel.userId === userId && rel.friendId === friendId)) {
      return;
    }

    const now = new Date();
    this.friends.push({ userId, friendId, createdAt: now });
    this.friends.push({ userId: friendId, friendId: userId, createdAt: now });
  }

  getFriends(userId: string): User[] {
    const friendIds = this.friends
      .filter((rel) => rel.userId === userId)
      .map((rel) => rel.friendId);

    return friendIds
      .map((id) => this.users.get(id))
      .filter((user): user is User => Boolean(user));
  }

  private updateRoomStatus(room: Room): void {
    const readyPlayers = room.players.filter((player) => player.isReady).length;
    if (readyPlayers === room.players.length && room.players.length >= 2) {
      room.status = 'READY';
    } else {
      room.status = 'WAITING';
    }
  }

  private determineAchievements(user: User): string[] {
    const unlocked: string[] = [];

    if (user.wins >= 1 && !user.achievements.includes('first_win')) {
      unlocked.push('first_win');
    }

    if (user.totalEarnings >= 10_000 && !user.achievements.includes('high_roller')) {
      unlocked.push('high_roller');
    }

    return unlocked;
  }

  private calculateWinRate(user: User): number {
    if (user.totalGames === 0) return 0;
    return (user.wins / user.totalGames) * 100;
  }

  private calculateLevel(experience: number): number {
    return Math.floor(experience / 1000) + 1;
  }

  private generateAvatar(username: string): string {
    const hash = Array.from(username)
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      .toString(16)
      .padStart(6, '0')
      .slice(0, 6);

    return `https://ui-avatars.com/api/?background=${hash}&color=fff&name=${encodeURIComponent(
      username
    )}`;
  }
}

export const dataStore = new DataStore();
export const achievementCatalog = achievements;
