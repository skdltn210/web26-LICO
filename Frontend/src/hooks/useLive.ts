import { useQuery } from '@tanstack/react-query';
import { liveApi } from '@/apis/live';
import type { Live, SortType } from '@/types/live';

export const liveKeys = {
  all: ['lives'] as const,
  sorted: (sort: SortType) => [...liveKeys.all, { sort }] as const,
};

export const useLives = (sort: SortType) => {
  return useQuery<Live[]>({
    queryKey: liveKeys.sorted(sort),
    queryFn: () => liveApi.getLives(sort),
  });
};
