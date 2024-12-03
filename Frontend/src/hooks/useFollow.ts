import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followApi } from '@apis/follow';
import { useAuthStore } from '@store/useAuthStore';
import type { Live } from '@/types/live';

export const useFollow = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const isLoggedIn = user !== null;

  const { data: follows, isLoading: isLoadingFollows } = useQuery({
    queryKey: ['follows'],
    queryFn: followApi.getFollow,
    staleTime: 1000 * 10,
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

  const isFollowed = (channelId: string) => {
    return follows?.some((follow: Live) => follow.channelId === channelId) ?? false;
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

export const useFollowerCount = (streamerId: number) => {
  return useQuery({
    queryKey: ['followerCount', streamerId],
    queryFn: () => followApi.getFollowerCount(streamerId),
  });
};
