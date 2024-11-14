import { api } from './axios';
import { UserProfile } from '@/types/user';

export const userApi = {
  updateProfile: async (userId: number, formData: FormData) => {
    const { data } = await api.put<UserProfile>(`/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
