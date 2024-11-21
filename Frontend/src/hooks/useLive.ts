import { useQuery, useMutation } from '@tanstack/react-query';
import { liveApi } from '@apis/live';
import { AxiosError } from 'axios';
import type { Live, LiveDetail, UpdateLiveRequest, SortType, LiveStatus } from '@/types/live';

const POLLING_INTERVAL = 30000;

export const liveKeys = {
  all: ['lives'] as const,
  sorted: (sort: SortType) => [...liveKeys.all, { sort }] as const,
  detail: (channelId: string) => [...liveKeys.all, 'detail', channelId] as const,
  status: (channelId: string) => [...liveKeys.all, 'status', channelId] as const,
  streamingKey: () => [...liveKeys.all, 'streaming-key'] as const,
};

export const useLives = (sort: SortType) => {
  return useQuery<Live[]>({
    queryKey: liveKeys.sorted(sort),
    queryFn: () => liveApi.getLives(sort),
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
