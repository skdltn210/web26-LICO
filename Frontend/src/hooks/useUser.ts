import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/apis/user';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserProfileResponse } from '@/types/user';

export const userKeys = {
  all: ['user'] as const,
  profile: (userId: number) => [...userKeys.all, 'profile', userId] as const,
};

interface UpdateProfileVariables {
  userId: number;
  formData: FormData;
}

export const useUpdateProfile = () => {
  const setAuth = useAuthStore(state => state.setAuth);
  const user = useAuthStore(state => state.user);

  return useMutation({
    mutationFn: ({ userId, formData }: UpdateProfileVariables) => userApi.updateProfile(userId, formData),
    onSuccess: (updatedUser: UserProfileResponse) => {
      setAuth({
        accessToken: useAuthStore.getState().accessToken as string,
        user: {
          ...user,
          nickname: updatedUser.nickname,
          profileImage: updatedUser.profile_image,
        },
      });
    },
  });
};
