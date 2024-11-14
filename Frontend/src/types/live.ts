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
  onAir: boolean;
}

export type SortType = 'viewers' | 'latest' | 'random';
