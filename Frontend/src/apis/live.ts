import { api } from './axios';
import type { Live, LiveDetail, UpdateLiveRequest, StreamingKeyResponse, LiveStatus, LiveParams } from '@/types/live';

export const liveApi = {
  getLives: async (params: LiveParams) => {
    const { data } = await api.get<Live[]>('/lives', {
      params: {
        sort: params.sort,
        limit: params.limit,
        offset: params.offset,
      },
    });
    return data;
  },

  getLiveByChannelId: async (channelId: string) => {
    const { data } = await api.get<LiveDetail>(`/lives/${channelId}`);
    return data;
  },

  updateLive: async (channelId: string, updateData: UpdateLiveRequest) => {
    const { data } = await api.patch<LiveDetail>(`/lives/${channelId}`, updateData);
    return data;
  },

  getStreamingKey: async () => {
    const { data } = await api.get<StreamingKeyResponse>('/lives/streaming-key');
    return data;
  },

  getLiveStatus: async (channelId: string) => {
    const { data } = await api.get<LiveStatus>(`/lives/status/${channelId}`);
    return data;
  },
};
