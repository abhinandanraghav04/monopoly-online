import { create } from 'zustand';
import { getGameHistory, type GameResult } from './api';

interface GameHistoryState {
  games: GameResult[];
  loading: boolean;
  error?: string;
  fetchHistory: (userId: string) => Promise<void>;
}

export const useGameHistoryStore = create<GameHistoryState>((set) => ({
  games: [],
  loading: false,
  error: undefined,
  fetchHistory: async (userId: string) => {
    set({ loading: true, error: undefined });
    try {
      const { games } = await getGameHistory(userId);
      set({ games, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));
