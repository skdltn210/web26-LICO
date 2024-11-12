import { api } from './axios';
import { AuthResponse, Provider, RefreshTokenResponse, AuthCallbackParams } from '@/types/auth';
import { config } from '@/config/env';

export const authApi = {
  getOAuthLoginUrl(provider: Provider): string {
    const params = new URLSearchParams({
      client_id: config.auth[provider].clientId,
      redirect_uri: config.auth[provider].redirectUri,
    });

    switch (provider) {
      case 'github':
        return `https://github.com/login/oauth/authorize?${params.toString()}`;

      case 'google':
        params.append('response_type', 'code');
        params.append('scope', 'email profile');
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      case 'naver':
        params.append('response_type', 'code');
        params.append('state', Math.random().toString(36).substring(7));
        return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
    }
  },

  async handleCallback({ provider, code, state }: AuthCallbackParams): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>(
      `/auth/${provider}/callback?code=${code}${state ? `&state=${state}` : ''}`,
    );
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  },
};
