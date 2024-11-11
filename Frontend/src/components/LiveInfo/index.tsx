import { LuUser } from 'react-icons/lu';
import CategoryBadge from '@components/common/Badges/CategoryBadge';
import FollowButton from '@components/common/Buttons/FollowButton';
import { useState } from 'react';
import { useChannel } from '@contexts/ChannelContext';
import { formatNumber } from '@utils/format';
import StreamingTimer from '@components/LiveInfo/StreamingTimer';

interface LiveInfoProps {
  channelId: string;
}

export default function LiveInfo({ channelId }: LiveInfoProps) {
  const { currentChannel } = useChannel();
  const [imageError, setImageError] = useState(false);

  if (!currentChannel) return null;

  return (
    <div className="w-full bg-lico-gray-4 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white">
            {!imageError ? (
              <img
                src={currentChannel.profileImgUrl}
                alt={currentChannel.streamerName}
                className="h-12 w-12 rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <LuUser size={24} className="text-lico-gray-2" />
            )}
          </div>
          <div>
            <div className="font-bold text-base text-lico-orange-2">{currentChannel.streamerName}</div>
            <div className="font-medium text-sm text-lico-gray-2">{formatNumber(currentChannel.viewers)}명 시청중</div>
            <StreamingTimer startAt={currentChannel.createdAt} />
          </div>
        </div>
        <FollowButton channelId={channelId} />
      </div>
      <div className="mt-2 font-medium text-xl text-lico-gray-1">{currentChannel.title}</div>
      <div className="mt-2 flex items-center gap-2">
        <CategoryBadge
          category={currentChannel.category.name}
          categoryId={currentChannel.category.id}
          className="text-sm text-lico-gray-1"
        />
      </div>
    </div>
  );
}
