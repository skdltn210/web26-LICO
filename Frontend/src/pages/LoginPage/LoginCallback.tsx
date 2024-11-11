import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">로그인 처리중...</div>
    </div>
  );
}
