/// <reference types="vite/client" />

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  rtmpUrl: import.meta.env.VITE_RTMP_URL,
  storageUrl: import.meta.env.VITE_STORAGE_URL,
  isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
  isProduction: import.meta.env.VITE_NODE_ENV === 'production',
} as const;

export const urls = {
  getRtmpUrl: (streamingKey: string) => `${config.rtmpUrl}/${streamingKey}`,
  getStorageUrl: (filename: string) => `${config.storageUrl}/${filename}`,
  getApiUrl: (path: string) => `${config.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`,
} as const;
