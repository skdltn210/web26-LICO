import { useMutation } from '@tanstack/react-query';
import { userApi } from '@/apis/user';
import { useAuthStore } from '@/store/useAuthStore';

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

  return useMutation({
    mutationFn: ({ userId, formData }: UpdateProfileVariables) => userApi.updateProfile(userId, formData),
    onSuccess: updatedUser => {
      setAuth({
        accessToken: useAuthStore.getState().accessToken as string,
        user: updatedUser,
      });
    },
  });
};
