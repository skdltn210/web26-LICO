import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { Provider } from '@/types/auth';

export default function LoginCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      navigate('/login');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    handleCallback({
      provider: window.location.pathname.split('/')[2] as Provider,
      code,
      state: searchParams.get('state') || undefined,
    })
      .catch(() => navigate('/login'))
      .finally(() => setIsProcessing(false));
  }, [navigate, handleCallback, searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="font-bold text-lg text-lico-gray-1">로그인 처리중...</div>
    </div>
  );
}
