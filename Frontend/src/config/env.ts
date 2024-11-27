/// <reference types="vite/client" />

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  chatUrl: import.meta.env.VITE_CHAT_URL,
  rtmpUrl: import.meta.env.VITE_RTMP_URL,
  storageUrl: import.meta.env.VITE_STORAGE_URL,
  isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: import.meta.env.VITE_NODE_ENV === 'production',
  auth: {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirectUri: `${import.meta.env.VITE_AUTH_REDIRECT_BASE_URL}/auth/google/callback`,
    },
    naver: {
      clientId: import.meta.env.VITE_NAVER_CLIENT_ID,
      redirectUri: `${import.meta.env.VITE_AUTH_REDIRECT_BASE_URL}/auth/naver/callback`,
    },
    github: {
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
      redirectUri: `${import.meta.env.VITE_AUTH_REDIRECT_BASE_URL}/auth/github/callback`,
    },
  },
  webrtcUrl: import.meta.env.VITE_WEBRTC_URL,
  whipUrl: import.meta.env.VITE_WHIP_URL,
  streamUrl: import.meta.env.VITE_STREAM_URL,
} as const;

export const urls = {
  getRtmpUrl: (streamingKey: string) => `${config.rtmpUrl}/${streamingKey}`,
  getStorageUrl: (filename: string) => `${config.storageUrl}/${filename}`,
  getApiUrl: (path: string) => `${config.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`,
} as const;
