import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { liveApi } from '@apis/live';
import { AxiosError } from 'axios';
import type { Live, LiveDetail, UpdateLiveRequest, LiveStatus, LiveParams } from '@/types/live';

const POLLING_INTERVAL = 60000;

export const liveKeys = {
  all: ['lives'] as const,
  sorted: (params: LiveParams) => [...liveKeys.all, params] as const,
  detail: (channelId: string) => [...liveKeys.all, 'detail', channelId] as const,
  status: (channelId: string) => [...liveKeys.all, 'status', channelId] as const,
  streamingKey: () => [...liveKeys.all, 'streaming-key'] as const,
};

export const useLives = (params: Omit<LiveParams, 'offset'>) => {
  return useInfiniteQuery<Live[], AxiosError>({
    queryKey: liveKeys.sorted(params),
    queryFn: ({ pageParam }) => liveApi.getLives({ ...params, offset: pageParam as number }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.length || lastPage.length < 20) return undefined;
      return allPages.length * 20;
    },
    initialPageParam: 0,
  });
};

export const useLiveDetail = (channelId: string) => {
  return useQuery<LiveDetail, AxiosError>({
    queryKey: liveKeys.detail(channelId),
    queryFn: () => liveApi.getLiveByChannelId(channelId),
    enabled: !!channelId,
  });
};

export const useLiveStatus = (channelId: string) => {
  return useQuery<LiveStatus, AxiosError>({
    queryKey: liveKeys.status(channelId),
    queryFn: () => liveApi.getLiveStatus(channelId),
    refetchInterval: POLLING_INTERVAL,
    refetchIntervalInBackground: false,
    retry: 3,
    enabled: !!channelId,
  });
};

export const useUpdateLive = () => {
  return useMutation({
    mutationFn: ({ channelId, updateData }: { channelId: string; updateData: UpdateLiveRequest }) =>
      liveApi.updateLive(channelId, updateData),
  });
};

export const useStreamingKey = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: liveKeys.streamingKey(),
    queryFn: () => liveApi.getStreamingKey(),
    enabled: options?.enabled,
  });
};
