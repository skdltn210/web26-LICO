import { useQuery } from '@tanstack/react-query';
import { liveApi } from '@apis/live';
import type { Live, LiveDetail, SortType } from '@/types/live';

export const liveKeys = {
  all: ['lives'] as const,
  sorted: (sort: SortType) => [...liveKeys.all, { sort }] as const,
  detail: (channelId: string) => [...liveKeys.all, 'detail', channelId] as const,
};

export const useLives = (sort: SortType) => {
  return useQuery<Live[]>({
    queryKey: liveKeys.sorted(sort),
    queryFn: () => liveApi.getLives(sort),
  });
};

export const useLiveDetail = (channelId: string) => {
  return useQuery<LiveDetail>({
    queryKey: liveKeys.detail(channelId),
    queryFn: () => liveApi.getLiveByChannelId(channelId),
    enabled: !!channelId,
  });
};
