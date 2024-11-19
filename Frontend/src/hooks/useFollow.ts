import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followApi } from '@apis/follow';
import type { Live } from '@/types/live';

export const useFollow = () => {
  const queryClient = useQueryClient();

  const { data: follows, isLoading: isLoadingFollows } = useQuery({
    queryKey: ['follows'],
    queryFn: followApi.getFollow,
  });

  const { mutate: followChannel, isPending: isFollowing } = useMutation({
    mutationFn: (channelId: string) => followApi.follow(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
    },
  });

  const { mutate: unfollowChannel, isPending: isUnfollowing } = useMutation({
    mutationFn: (channelId: string) => followApi.unfollow(channelId),
    onSuccess: () => {
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
