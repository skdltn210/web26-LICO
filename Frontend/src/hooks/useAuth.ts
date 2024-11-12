import { useMutation, useQuery } from '@tanstack/react-query';
import { Provider } from '@/types/auth';
import { authApi } from '@/apis/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (provider: Provider) => authApi.login(provider),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      navigate('/');
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: () => authApi.refreshToken(),
    onSuccess: data => {
      setAuth({
        accessToken: data.accessToken,
        user: data.user,
      });
    },
    onError: () => {
      clearAuth();
      navigate('/login');
    },
  });

  const { data: authStatus } = useQuery({
    queryKey: ['authStatus'],
    queryFn: () => authApi.checkStatus(),
    retry: false,
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    refreshToken: refreshTokenMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRefreshing: refreshTokenMutation.isPending,
    authStatus,
  };
}
