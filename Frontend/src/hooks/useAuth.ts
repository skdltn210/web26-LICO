import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@store/useAuthStore';
import { api } from '@apis/axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
}

interface LoginResponse {
  user: User;
}

type SocialProvider = 'google' | 'naver' | 'github';

interface SocialLoginParams {
  code: string;
  provider: SocialProvider;
  state?: string | null;
}

export function useAuth() {
  const navigate = useNavigate();
  const { setUser, login, logout } = useAuthStore();

  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    retry: false,
  });

  const handleSocialLoginCallback = async (code: string, provider: SocialProvider, state?: string | null) => {
    const { data } = await api.post<LoginResponse>('/auth/callback', {
      code,
      provider,
      state,
    });
    return data;
  };

  const socialLoginMutation = useMutation({
    mutationFn: ({ code, provider, state }: SocialLoginParams) => handleSocialLoginCallback(code, provider, state),
    onSuccess: data => {
      setUser(data.user);
      navigate('/');
    },
    onError: error => {
      console.error('Social login failed:', error);
      navigate('/login');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      navigate('/login');
    },
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser, setUser]);

  return {
    login,
    logout: logoutMutation.mutate,
    socialLoginCallback: socialLoginMutation.mutate,
    isLoading: socialLoginMutation.isPending || logoutMutation.isPending,
  };
}
