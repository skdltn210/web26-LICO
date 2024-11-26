import { api } from './axios';

interface SendChatRequest {
  channelId: string;
  message: string;
}

export const chatApi = {
  sendChat: async ({ channelId, message }: SendChatRequest) => {
    const { data } = await api.post('/chats', {
      channelId,
      message,
    });
    return data;
  },
};
