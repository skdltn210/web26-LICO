import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/apis/category';
import type { Category } from '@/types/category';

export const categoryKeys = {
  all: ['categories'] as const,
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: categoryKeys.all,
    queryFn: categoryApi.getCategories,
  });
};
