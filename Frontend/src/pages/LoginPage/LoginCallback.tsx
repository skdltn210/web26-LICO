import { useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

type SocialProvider = 'google' | 'naver' | 'github';

export default function LoginCallback() {
  const [searchParams] = useSearchParams();
  const { provider } = useParams<{ provider: string }>();
  const { socialLoginCallback } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && provider) {
      socialLoginCallback({
        code,
        provider: provider as SocialProvider,
        state: state || undefined,
      });
    }
  }, [searchParams, provider, socialLoginCallback]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">로그인 처리중...</div>
    </div>
  );
}
