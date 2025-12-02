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

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalEarnings: number;
  averageGameLength: number;
  favoriteBoardSize: string;
}

export interface CreateUserInput {
  username: string;
  avatar?: string;
}

export interface UpdateUserInput {
  username?: string;
  avatar?: string;
}
