import { create } from 'zustand';
import { api } from '@apis/axios';
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

const getAuthUrl = (provider: 'google' | 'naver' | 'github') => {
  const { clientId, redirectUri } = config.auth[provider];

  switch (provider) {
    case 'google':
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;

    case 'naver':
      return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${Math.random().toString(36).substring(7)}`;

    case 'github':
      return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  }
};

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,
  setUser: user =>
    set({
      user,
      isAuthenticated: !!user,
    }),
  login: provider => {
    const authUrl = getAuthUrl(provider);
    window.location.href = authUrl;
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
