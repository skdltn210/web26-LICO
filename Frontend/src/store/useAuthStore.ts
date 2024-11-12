import { create } from 'zustand';
import { AuthStore, Provider } from '@/types/auth';
import { authApi } from '@/apis/auth';

export const useAuthStore = create<AuthStore>(set => ({
  isAuthenticated: false,
  accessToken: null,

  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
  setAccessToken: (token: string | null) => set({ accessToken: token }),

  login: (provider: Provider) => {
    const url = authApi.getOAuthLoginUrl(provider);
    window.location.href = url;
  },

  logout: async () => {
    try {
      await authApi.logout();
      set({ isAuthenticated: false, accessToken: null });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  refreshAccessToken: async () => {
    try {
      const response = await authApi.refreshToken();
      if (response.accessToken) {
        set({ accessToken: response.accessToken });
      }
    } catch (error) {
      set({ isAuthenticated: false, accessToken: null });
      throw error;
    }
  },
}));
