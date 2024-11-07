import { api } from './axios';
import type { Live, SortType } from '@/types/live';

export const liveApi = {
  getLives: async (sort: SortType) => {
    const { data } = await api.get<Live[]>('/lives', {
      params: { sort },
    });
    return data;
  },
};
