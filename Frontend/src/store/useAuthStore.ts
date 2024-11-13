import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  user: any | null;
  setAuth: (auth: { accessToken: string; user: any }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setAuth: (auth) =>
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
      // storage: createJSONStorage(() => sessionStorage), // sessionStorage를 사용하고 싶다면
      partialize: (state) => ({ user: state.user }), // accessToken은 제외하고 user 정보만 저장
    }
  )
);