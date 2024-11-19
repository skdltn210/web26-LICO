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
    mutationFn: (streamerId: string) => followApi.follow(streamerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
    },
  });

  const { mutate: unfollowChannel, isPending: isUnfollowing } = useMutation({
    mutationFn: (streamerId: string) => followApi.unfollow(streamerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
    },
  });

  const isFollowed = (streamerId: string) => {
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
