export interface Player {
  id: string;
  username: string;
  avatar: string;
  level: number;
  isReady: boolean;
  isHost: boolean;
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

export interface CreateRoomInput {
  name: string;
  boardSize: number;
  startingMoney: number;
  maxPlayers: number;
  hostId: string;
  hostUsername: string;
  hostAvatar: string;
  hostLevel: number;
}
