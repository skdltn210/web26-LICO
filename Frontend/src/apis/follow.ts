import { api } from './axios';
import type { Live } from '@/types/live';

export const followApi = {
  getFollow: async () => {
    const { data } = await api.get<Live[]>('/follow');
    return data;
  },

  follow: async (channelId: string) => {
    await api.post(`/follow/${channelId}`);
  },

  unfollow: async (channelId: string) => {
    await api.delete(`/follow/${channelId}`);
  },
};
