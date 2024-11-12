import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/apis/axios';
export default function LoginCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthenticated, setAccessToken } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const provider = window.location.pathname.split('/')[2];

    if (!code) {
      console.error('Authorization code not found');
      navigate('/login');
      return;
    }

    const authenticateUser = async () => {
      try {
        const response = await api.get(`/auth/${provider}/callback?code=${code}${state ? `&state=${state}` : ''}`);

        if (response.data.success) {
          setAccessToken(response.data.accessToken);
          setAuthenticated(true);
          navigate('/');
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        navigate('/login');
      }
    };

    authenticateUser();
  }, [navigate, setAuthenticated, setAccessToken]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="font-bold text-lg text-lico-gray-1">로그인 처리중...</div>
    </div>
  );
}
