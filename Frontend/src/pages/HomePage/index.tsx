import ChannelGrid from '@components/channel/ChannelGrid';
import { useLiveDetail } from '@hooks/useLive';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { config } from '@config/env.ts';

export default function LivesPage() {
  const { data: channelData, isLoading } = useLiveDetail('e465ef6d-a875-4f96-a695-efc7a542a9e8');

  if (isLoading)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if (!channelData)
    return (
      <div className="relative p-12">
        <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">개발중</div>
      </div>
    );

  const channel = {
    id: channelData.streamerId.toString(),
    title: channelData.livesName,
    streamerName: channelData.usersNickname,
    profileImgUrl: channelData.usersProfileImage,
    viewers: 0,
    category: channelData.categoriesName,
    categoryId: channelData.categoriesId,
    thumbnailUrl: `${config.storageUrl}/${channelData.streamerId}/thumbnail.jpg`,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="relative p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">HOME</div>
      <ChannelGrid channels={[channel]} />
    </div>
  );
}
