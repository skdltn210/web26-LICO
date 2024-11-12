import { Provider, AuthCallbackParams } from '@/types/auth';
import { authApi } from '@/apis/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();

  const login = async (provider: Provider) => {
    await authApi.login(provider);
  };

  const handleCallback = async (params: AuthCallbackParams) => {
    try {
      const response = await authApi.handleCallback(params);
      if (response.success) {
        setAuth({
          accessToken: response.accessToken,
          user: response.user,
        });
        navigate('/');
      }
    } catch {
      navigate('/login');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      clearAuth();
      navigate('/');
    } catch {}
  };

  const refreshToken = async () => {
    try {
      const data = await authApi.refreshToken();
      setAuth({
        accessToken: data.accessToken,
        user: data.user,
      });
    } catch {
      clearAuth();
      navigate('/login');
    }
  };

  return {
    login,
    handleCallback,
    logout,
    refreshToken,
  };
}
