import { create } from 'zustand';
import { api } from '@/apis/axios';
import { config } from '@/config/env';

interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (provider: 'google' | 'naver' | 'github') => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,
  setUser: user =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  login: provider => {
    window.location.href = `${config.apiBaseUrl}/auth/${provider}`;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
}));
