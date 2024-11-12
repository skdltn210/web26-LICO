import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/apis/auth';
import { Provider } from '@/types/auth';

export default function LoginCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const provider = window.location.pathname.split('/')[2] as Provider;

    if (!code) {
      console.error('Authorization code not found');
      navigate('/login');
      return;
    }

    const authenticateUser = async () => {
      try {
        const response = await authApi.handleCallback({
          provider,
          code,
          state: state || undefined,
        });

        if (response.success) {
          setAuth({
            accessToken: response.accessToken,
            user: response.user,
          });
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
  }, [navigate, setAuth]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="font-bold text-lg text-lico-gray-1">로그인 처리중...</div>
    </div>
  );
}
