export interface GameResult {
  id: string;
  players: string[];
  winnerId: string;
  durationMinutes: number;
  boardSize: number;
  earnings: Record<string, number>;
  finishedAt: Date;
}

export interface GameHistoryResponse {
  games: GameResult[];
}
