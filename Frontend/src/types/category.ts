export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface CategoryWithStats extends Category {
  totalViewers: number;
  totalLives: number;
}

export interface UpdateLiveRequest {
  name?: string;
  description?: string;
  categoriesId?: number;
}
