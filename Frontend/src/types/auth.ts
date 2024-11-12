export interface AuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;
  setAuthenticated: (value: boolean) => void;
  setAccessToken: (token: string | null) => void;
  login: (provider: Provider) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export type Provider = 'google' | 'naver' | 'github';

export interface AuthResponse {
  success: boolean;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AuthCallbackParams {
  provider: Provider;
  code: string;
  state?: string | null;
}
