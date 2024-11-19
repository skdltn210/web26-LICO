import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followApi } from '@apis/follow';
import { useAuthStore } from '@store/useAuthStore';
import type { Live } from '@/types/live';

export const useFollow = () => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore(state => state.accessToken);
  const isLoggedIn = accessToken !== null;

  const { data: follows, isLoading: isLoadingFollows } = useQuery({
    queryKey: ['follows'],
    queryFn: followApi.getFollow,
    enabled: isLoggedIn,
  });

  const { mutate: followChannel, isPending: isFollowing } = useMutation({
    mutationFn: (streamerId: number) => followApi.follow(streamerId),
    onSuccess: (_, streamerId) => {
      queryClient.setQueryData(['follows'], (old: Live[] = []) => {
        if (!old.some(follow => follow.streamerId === streamerId)) {
          return [...old, { streamerId } as Live];
        }
        return old;
      });

      queryClient.invalidateQueries({ queryKey: ['follows'] });
    },
  });

  const { mutate: unfollowChannel, isPending: isUnfollowing } = useMutation({
    mutationFn: (streamerId: number) => followApi.unfollow(streamerId),
    onSuccess: (_, streamerId) => {
      queryClient.setQueryData(['follows'], (old: Live[] = []) => {
        return old.filter(follow => follow.streamerId !== streamerId);
      });

      queryClient.invalidateQueries({ queryKey: ['follows'] });
    },
  });

  const isFollowed = (streamerId: number) => {
    return follows?.some((follow: Live) => follow.streamerId === streamerId) ?? false;
  };

  return {
    follows,
    isLoadingFollows,
    followChannel,
    unfollowChannel,
    isFollowing,
    isUnfollowing,
    isFollowed,
  };
};
