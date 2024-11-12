import { api } from './axios';
import { AuthResponse, Provider, RefreshTokenResponse, AuthCallbackParams } from '@/types/auth';

export const authApi = {
  async login(provider: Provider): Promise<void> {
    await api.get(`/auth/${provider}`);
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
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

  async checkStatus(): Promise<{ isAuthenticated: boolean }> {
    const response = await api.get('/auth/status');
    return response.data;
  },
};
