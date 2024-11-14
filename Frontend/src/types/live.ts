export interface Live {
  categoriesId: number;
  categoriesName: string;
  livesName: string;
  channelId: string;
  usersNickname: string;
  usersProfileImage: string;
}

export interface LiveDetail {
  categoriesId: number;
  categoriesName: string;
  livesName: string;
  livesDescription: string;
  usersNickname: string;
  usersProfileImage: string;
  startedAt: string;
  streamingKey: string;
}

export interface UpdateLiveRequest {
  categoriesId?: number;
  name?: string;
  description?: string;
}

export type SortType = 'viewers' | 'latest' | 'random';
