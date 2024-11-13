import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
  channelID: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (auth: { accessToken: string; user: User }) => void;
  clearAuth: () => void;
}

const mockUser: User = {
  id: 1,
  name: 'test',
  email: 'test@example.com',
  profileImage: 'https://via.placeholder.com/150',
  channelID: 'abc',
};

const mockAccessToken = 'mock_jwt_token_12345';

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: mockAccessToken,
      user: mockUser,
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
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ user: state.user }),
    },
  ),
);
