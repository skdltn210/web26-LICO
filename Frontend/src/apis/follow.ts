import { api } from './axios';
import type { Live } from '@/types/live';

export const followApi = {
  getFollow: async () => {
    const { data } = await api.get<Live[]>('/follow');
    return data;
  },

  follow: async (streamerId: string) => {
    const { data } = await api.post(`/follow/${streamerId}`);
    return data;
  },

  unfollow: async (streamerId: string) => {
    const { data } = await api.delete(`/follow/${streamerId}`);
    return data;
  },
};
