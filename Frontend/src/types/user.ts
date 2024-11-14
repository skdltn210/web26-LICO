export interface UserProfile {
  id: number;
  nickname: string;
  profileImage: string;
}

export interface UserProfileResponse {
  users_id: number;
  nickname: string;
  profile_image: string;
  created_at: string;
}
