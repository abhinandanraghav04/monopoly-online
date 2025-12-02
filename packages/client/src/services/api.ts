const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  experience: number;
  totalGames: number;
  wins: number;
  losses: number;
  totalEarnings: number;
  achievements: string[];
  createdAt: Date;
  lastActive: Date;
}

export interface GameResult {
  id: string;
  players: string[];
  winnerId: string;
  durationMinutes: number;
  boardSize: number;
  earnings: Record<string, number>;
  finishedAt: Date;
  isWinner?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface LeaderboardResponse {
  total: number;
  page: number;
  limit: number;
  results: LeaderboardEntry[];
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  boardSize: number;
  startingMoney: number;
  status: 'WAITING' | 'READY' | 'IN_PROGRESS' | 'FINISHED';
  createdAt: Date;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  level: number;
  isReady: boolean;
  isHost: boolean;
}

export async function createUser(username: string, avatar?: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, avatar })
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
}

export async function getUser(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/user/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
}

export async function updateUser(id: string, data: { username?: string; avatar?: string }): Promise<User> {
  const response = await fetch(`${API_URL}/api/user/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
}

export async function getLeaderboard(
  sort = 'wins',
  page = 1,
  limit = 25
): Promise<LeaderboardResponse> {
  const params = new URLSearchParams({ sort, page: String(page), limit: String(limit) });
  const response = await fetch(`${API_URL}/api/leaderboard?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return response.json();
}

export async function saveGameResult(result: {
  players: string[];
  winnerId: string;
  durationMinutes: number;
  boardSize: number;
  earnings: Record<string, number>;
}): Promise<GameResult> {
  const response = await fetch(`${API_URL}/api/game-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  });

  if (!response.ok) {
    throw new Error('Failed to save game result');
  }

  return response.json();
}

export async function getGameHistory(userId: string): Promise<{ games: GameResult[] }> {
  const response = await fetch(`${API_URL}/api/game-history/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch game history');
  }

  return response.json();
}

export async function addFriend(userId: string, friendIdentifier: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/friends/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ friendUsername: friendIdentifier })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Failed to add friend');
  }
}

export async function getFriends(userId: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/friends/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch friends');
  }

  return response.json();
}

export async function getRooms(): Promise<Room[]> {
  const response = await fetch(`${API_URL}/api/rooms`);

  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }

  return response.json();
}

export async function getRoom(id: string): Promise<Room> {
  const response = await fetch(`${API_URL}/api/rooms/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }

  return response.json();
}
