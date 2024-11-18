import ChannelGrid from '@components/channel/ChannelGrid';
import { useFollow } from '@/hooks/useFollow';
import type { ChannelCardProps } from '@components/channel/ChannelCard';

export default function FollowingPage() {
  const { follows, isLoadingFollows } = useFollow();

  const followedChannels: ChannelCardProps[] =
    follows?.map(follow => ({
      id: follow.channelId,
      title: follow.livesName,
      streamerName: follow.usersNickname,
      category: follow.categoriesName,
      categoryId: follow.categoriesId,
      profileImgUrl: follow.usersProfileImage,
      thumbnailUrl: '/api/placeholder/400/320',
      viewers: 0,
      isLive: follow.onAir,
      createdAt: new Date().toISOString(),
    })) ?? [];

  if (isLoadingFollows) {
    return (
      <div className="p-12">
        <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">팔로잉</div>
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-lico-gray-2">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (followedChannels.length === 0) {
    return (
      <div className="p-12">
        <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">팔로잉</div>
        <div className="flex min-h-[300px] items-center justify-center font-medium text-lico-gray-2">
          아직 팔로우한 채널이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">팔로잉</div>
      <ChannelGrid channels={followedChannels} />
    </div>
  );
}
