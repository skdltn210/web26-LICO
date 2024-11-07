import { api } from './axios';
import type { Live, LiveDetail, SortType } from '@/types/live';

export const liveApi = {
  getLives: async (sort: SortType) => {
    const { data } = await api.get<Live[]>('/lives', {
      params: { sort },
    });
    return data;
  },

  getLiveByChannelId: async (channelId: string) => {
    const { data } = await api.get<LiveDetail>(`/lives/${channelId}`);
    return data;
  },
};
