import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginCallback() {
  const navigate = useNavigate();
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);

  useEffect(() => {
    setAuthenticated(true);
    navigate('/');
  }, [navigate, setAuthenticated]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">로그인 처리중...</div>
    </div>
  );
}
