import { create } from 'zustand';
import { getLeaderboard, type LeaderboardEntry } from './api';

export type LeaderboardFilterRange = 'all-time' | 'month' | 'week';
export type LeaderboardSort = 'wins' | 'winRate' | 'level';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error?: string;
  range: LeaderboardFilterRange;
  sort: LeaderboardSort;
  fetchLeaderboard: (options?: { page?: number; sort?: LeaderboardSort }) => Promise<void>;
  setRange: (range: LeaderboardFilterRange) => void;
  setSort: (sort: LeaderboardSort) => void;
  reset: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  total: 0,
  page: 1,
  limit: 25,
  loading: false,
  error: undefined,
  range: 'all-time',
  sort: 'wins',
  fetchLeaderboard: async (options) => {
    const { page, sort } = options ?? {};
    const state = get();
    const nextPage = page ?? state.page;
    const nextSort = sort ?? state.sort;

    set({ loading: true, error: undefined });
    try {
      const response = await getLeaderboard(nextSort, nextPage, state.limit);
      set({
        entries: response.results,
        total: response.total,
        page: response.page,
        limit: response.limit,
        loading: false,
        sort: nextSort
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  setRange: (range) => {
    set({ range });
  },
  setSort: (sort) => {
    set({ sort });
  },
  reset: () => {
    set({ entries: [], total: 0, page: 1, limit: 25, loading: false, error: undefined, range: 'all-time', sort: 'wins' });
  }
}));
