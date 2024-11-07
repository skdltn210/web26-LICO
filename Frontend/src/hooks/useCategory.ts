import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@apis/category';
import type { Category } from '@/types/category';

export const categoryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => ['categories', id] as const,
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: categoryKeys.all,
    queryFn: categoryApi.getCategories,
  });
};

export const useCategoryDetail = (categoryId: string) => {
  return useQuery<Category>({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoryApi.getCategoryById(categoryId),
    enabled: !!categoryId,
  });
};
