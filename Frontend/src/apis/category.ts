import { api } from './axios';
import type { Category } from '@/types/category';
import type { Live, LiveParams } from '@/types/live';

export const categoryApi = {
  getCategories: async () => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  getCategoryById: async (categoryId: string) => {
    const { data } = await api.get<Category>(`/categories/${categoryId}`);
    return data;
  },

  getCategoryLives: async (categoryId: string, params: Omit<LiveParams, 'sort'>) => {
    const { data } = await api.get<Live[]>(`/categories/${categoryId}/lives`, {
      params: {
        limit: params.limit,
        offset: params.offset,
      },
    });
    return data;
  },
};
