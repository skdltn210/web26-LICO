export interface BaseCategory {
  id: number;
  name: string;
  image: string;
}

export interface Category extends BaseCategory {
  viewerCount: number;
  liveCount: number;
}
