import { LuUser } from 'react-icons/lu';
import CategoryBadge from '@components/common/Badges/CategoryBadge';
import FollowButton from '@components/common/Buttons/FollowButton';
import mockChannels from '@/mocks/mockChannels';
import mockUsers from '@/mocks/mockUsers';
import { useState } from 'react';

interface LiveInfoProps {
  channelId: string;
}

export default function LiveInfo({ channelId }: LiveInfoProps) {
  const channel = mockChannels.find(channel => channel.id === channelId);
  const user = mockUsers[channelId];
  const [imageError, setImageError] = useState(false);

  if (!channel || !user) return null;

  return (
    <div className="w-full max-w-4xl bg-lico-gray-4 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white p-2">
            {!imageError ? (
              <img
                src={channel.profileImgUrl}
                alt={user.channelName}
                className="h-6 w-6 rounded-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <LuUser size={24} className="text-lico-gray-2" />
            )}
          </div>
          <div>
            <div className="font-bold text-base text-lico-orange-2">{user.channelName}</div>
            <div className="font-medium text-sm text-lico-gray-2">{channel.viewers}명 시청중</div>
          </div>
        </div>
        <FollowButton channelId={channelId} />
      </div>
      <div className="mt-2 font-medium text-lico-gray-1">{channel.title}</div>
      <div className="mt-2 flex items-center gap-2">
        <CategoryBadge category={channel.category} />
        <CategoryBadge category="실시간 방송" />
      </div>
    </div>
  );
}
