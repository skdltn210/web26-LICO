import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { categoryApi } from '@apis/category';
import { AxiosError } from 'axios';
import type { Category } from '@/types/category';
import type { Live } from '@/types/live';

const ITEMS_PER_PAGE = 20;

export const categoryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => ['categories', id] as const,
  lives: (id: string) => [...categoryKeys.detail(id), 'lives'] as const,
};

export const useCategories = () => {
  return useQuery<Category[], AxiosError>({
    queryKey: categoryKeys.all,
    queryFn: categoryApi.getCategories,
    staleTime: 1000 * 10,
  });
};

export const useCategoryDetail = (categoryId: string) => {
  return useQuery<Category, AxiosError>({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoryApi.getCategoryById(categoryId),
    enabled: !!categoryId,
  });
};

export const useCategoryLives = (categoryId: string) => {
  return useInfiniteQuery<Live[], AxiosError>({
    queryKey: categoryKeys.lives(categoryId),
    queryFn: ({ pageParam = 0 }) =>
      categoryApi.getCategoryLives(categoryId, {
        limit: ITEMS_PER_PAGE,
        offset: pageParam as number,
      }),
    staleTime: 1000 * 10,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.length || lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
    enabled: !!categoryId,
  });
};
