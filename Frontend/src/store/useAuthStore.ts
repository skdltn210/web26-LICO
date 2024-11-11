import { create } from 'zustand';
import { api } from '@/apis/axios';
import { config } from '@/config/env';

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  login: (provider: 'google' | 'naver' | 'github') => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(set => ({
  isAuthenticated: false,
  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  login: provider => {
    window.location.href = `${config.apiBaseUrl}/auth/${provider}`;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
}));
