import { api } from './axios';
import { AuthResponse, Provider, RefreshTokenResponse, AuthCallbackParams } from '@/types/auth';

export const authApi = {
  async login(provider: Provider) {
    const response = await api.get(`/auth/${provider}`);
    return response.data;
  },

  async logout() {
    const response = await api.get('/auth/logout');
    return response.data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  },

  async handleCallback(params: AuthCallbackParams): Promise<AuthResponse> {
    const { provider, code, state } = params;
    const response = await api.get<AuthResponse>(`/auth/${provider}/callback`, {
      params: { code, state },
    });
    return response.data;
  },
};
