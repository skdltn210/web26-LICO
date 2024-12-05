import ChannelGrid from '@components/channel/ChannelGrid';
import { config } from '@config/env.ts';
import { useFollow } from '@hooks/useFollow';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useDelayedLoading } from '@hooks/useDelayedLoading.ts';
import OfflineGrid from './OfflineGrid';

export default function FollowingPage() {
  const { follows, isLoadingFollows } = useFollow();
  const showLoading = useDelayedLoading(isLoadingFollows, { minLoadingTime: 300 });

  const followedChannels =
    follows?.map(follow => ({
      id: follow.channelId,
      title: follow.livesName,
      streamerName: follow.usersNickname,
      category: follow.categoriesName,
      categoryId: follow.categoriesId,
      profileImgUrl: follow.usersProfileImage,
      thumbnailUrl: `${config.storageUrl}/${follow.channelId}/thumbnail.jpg`,
      viewers: follow.viewers,
      isLive: follow.onAir,
      createdAt: new Date().toISOString(),
    })) ?? [];

  const liveChannels = followedChannels.filter(channel => channel.isLive);
  const offlineChannels = followedChannels.filter(channel => !channel.isLive);

  if (showLoading) {
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (followedChannels.length === 0) {
    return (
      <div className="p-12">
        <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">팔로잉</div>
        <div className="flex min-h-[300px] items-center justify-center font-bold text-lico-gray-2">
          아직 팔로우한 채널이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="p-12">
      <div className="mb-4 px-4 font-bold text-2xl text-lico-gray-1">팔로잉</div>

      <div className="mb-4">
        <div className="mb-4 flex items-center gap-2 px-4 font-bold text-xl">
          <p className="text-lico-gray-1">라이브</p>
          <span className="text-lico-orange-2">{liveChannels.length}</span>
        </div>
        <ChannelGrid channels={liveChannels} />
      </div>

      <div className="px-4">
        <div className="mb-4 flex items-center gap-2 font-bold text-xl">
          <p className="text-lico-gray-1">오프라인</p>
          <span className="text-lico-orange-2">{offlineChannels.length}</span>
        </div>
        <OfflineGrid channels={offlineChannels} />
      </div>
    </div>
  );
}
