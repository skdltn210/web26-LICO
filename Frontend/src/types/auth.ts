export type Provider = 'google' | 'naver' | 'github';

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: any;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: any;
}

export interface AuthCallbackParams {
  provider: Provider;
  code: string;
  state?: string | null;
}
