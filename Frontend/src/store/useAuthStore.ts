import { create } from 'zustand';
import { api } from '@/apis/axios';
import { config } from '@/config/env';

interface AuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;
  setAuthenticated: (value: boolean) => void;
  setAccessToken: (token: string | null) => void;
  login: (provider: 'google' | 'naver' | 'github') => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>(set => ({
  isAuthenticated: false,
  accessToken: null,
  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  setAccessToken: (token: string | null) => set({ accessToken: token }),
  login: provider => {
    const params = new URLSearchParams({
      client_id: config.auth[provider].clientId,
      redirect_uri: config.auth[provider].redirectUri,
    });

    switch (provider) {
      case 'github':
        window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
        break;
      case 'google':
        params.append('response_type', 'code');
        params.append('scope', 'email profile');
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        break;
      case 'naver':
        params.append('response_type', 'code');
        params.append('state', Math.random().toString(36).substring(7));
        window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
        break;
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ isAuthenticated: false, accessToken: null });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
  refreshAccessToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.accessToken) {
        set({ accessToken: response.data.accessToken });
      }
    } catch (error) {
      set({ isAuthenticated: false, accessToken: null });
      throw error;
    }
  },
}));
