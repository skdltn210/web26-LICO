import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Provider } from '@/types/auth';

export default function LoginCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      navigate('/login');
      return;
    }

    handleCallback({
      provider: window.location.pathname.split('/')[2] as Provider,
      code,
      state: searchParams.get('state') || undefined,
    }).catch(() => navigate('/login'));
  }, [navigate, handleCallback, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="font-bold text-lg text-lico-gray-1">로그인 처리중...</div>
    </div>
  );
}
