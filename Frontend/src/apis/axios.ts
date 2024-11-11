import axios from 'axios';
import { config } from '@/config/env';
import { useAuthStore } from '@/store/useAuthStore';

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().setUser(null);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
