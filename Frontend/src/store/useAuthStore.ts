import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  user: any | null;
  setAuth: (auth: { accessToken: string; user: any }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  accessToken: null,
  user: null,
  setAuth: auth =>
    set({
      accessToken: auth.accessToken,
      user: auth.user,
    }),
  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
    }),
}));
