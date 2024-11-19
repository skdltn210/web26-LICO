import { api } from './axios';
import type { Live } from '@/types/live';

export const followApi = {
  getFollow: async () => {
    const { data } = await api.get<Live[]>('/follow');
    return data;
  },

  follow: async (streamerId: string) => {
    await api.post(`/follow/${streamerId}`);
  },

  unfollow: async (streamerId: string) => {
    await api.delete(`/follow/${streamerId}`);
  },
};
