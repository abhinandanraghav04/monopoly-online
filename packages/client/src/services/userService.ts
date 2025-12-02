import { create } from 'zustand';
import { addFriend, createUser, getFriends, getUser, updateUser, type User } from './api';

interface UserState {
  currentUser?: User;
  friends: User[];
  loading: boolean;
  error?: string;
  fetchUser: (userId: string) => Promise<void>;
  createProfile: (username: string, avatar?: string) => Promise<void>;
  updateProfile: (data: { username?: string; avatar?: string }) => Promise<void>;
  loadFriends: () => Promise<void>;
  addFriend: (friendUsername: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: undefined,
  friends: [],
  loading: false,
  error: undefined,
  fetchUser: async (userId: string) => {
    set({ loading: true, error: undefined });
    try {
      const user = await getUser(userId);
      set({ currentUser: user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  createProfile: async (username: string, avatar?: string) => {
    set({ loading: true, error: undefined });
    try {
      const user = await createUser(username, avatar);
      set({ currentUser: user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  updateProfile: async (data) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      throw new Error('No user loaded');
    }

    set({ loading: true, error: undefined });
    try {
      const updated = await updateUser(currentUser.id, data);
      set({ currentUser: updated, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  loadFriends: async () => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    try {
      const friends = await getFriends(currentUser.id);
      set({ friends });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  addFriend: async (friendUsername: string) => {
    const currentUser = get().currentUser;
    if (!currentUser) return;

    try {
      await addFriend(currentUser.id, friendUsername);
      await get().loadFriends();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  }
}));
