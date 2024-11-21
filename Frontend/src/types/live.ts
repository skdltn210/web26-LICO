export interface Live {
  categoriesId: number;
  categoriesName: string;
  livesName: string;
  channelId: string;
  usersNickname: string;
  usersProfileImage: string;
  onAir: boolean;
  streamerId: number;
  viewers: number;
}

export interface LiveDetail {
  categoriesId: number;
  categoriesName: string;
  livesName: string;
  livesDescription: string;
  usersNickname: string;
  usersProfileImage: string;
  startedAt: string;
  onAir: boolean;
  streamerId: number;
}

export interface LiveStatus {
  categoriesId: number;
  categoriesName: string;
  livesName: string;
  livesDescription: string;
  onAir: boolean;
  viewers: number;
}

export interface UpdateLiveRequest {
  categoriesId?: number;
  name?: string;
  description?: string;
}

export interface StreamingKeyResponse {
  streamingKey: string;
}

export type SortType = 'viewers' | 'latest' | 'random';

export interface Message {
  userId: number;
  nickname: string;
  content: string;
  timestamp: string;
}
