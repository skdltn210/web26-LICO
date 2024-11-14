import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/apis/user';

export const userKeys = {
  all: ['user'] as const,
  profile: (userId: number) => [...userKeys.all, 'profile', userId] as const,
};

interface UpdateProfileVariables {
  userId: number;
  formData: FormData;
}

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: ({ userId, formData }: UpdateProfileVariables) => userApi.updateProfile(userId, formData),
  });
};
