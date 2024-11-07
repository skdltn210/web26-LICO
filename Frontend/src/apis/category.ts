import { api } from './axios';
import type { Category } from '@/types/category';

export const categoryApi = {
  getCategories: async () => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  getCategoryById: async (categoryId: string) => {
    const { data } = await api.get<Category>(`/categories/${categoryId}`);
    return data;
  },
};
