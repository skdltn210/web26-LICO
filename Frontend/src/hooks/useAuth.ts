import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { login, logout } = useAuthStore();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      navigate('/');
    },
  });

  return {
    login,
    logout: logoutMutation.mutate,
    isLoading: logoutMutation.isPending,
  };
}
