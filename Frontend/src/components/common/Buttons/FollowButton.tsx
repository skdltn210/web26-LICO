import { LuHeart, LuHeartOff } from 'react-icons/lu';
import { FaHeart } from 'react-icons/fa';
import useFollowStore from '@store/useFollowStore.ts';
import { useState } from 'react';

interface FollowButtonProps {
  channelId: string;
}

export default function FollowButton({ channelId }: FollowButtonProps) {
  const { followingChannels, followChannel, unfollowChannel } = useFollowStore();
  const isFollowing = followingChannels.includes(channelId);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isFollowing) {
      unfollowChannel(channelId);
    } else {
      followChannel(channelId);
    }
  };

  return (
    <div className="relative">
      {isFollowing && isHovered && (
        <div className="absolute left-4 top-full mt-2 rounded-md bg-lico-gray-3 px-3 py-1.5 font-medium text-xs text-lico-gray-1">
          언팔로우
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex h-9 items-center gap-2 rounded px-4 font-bold text-base transition-colors ${
          isFollowing
            ? 'bg-lico-gray-3 text-lico-gray-1 hover:bg-lico-gray-2'
            : 'bg-lico-orange-2 text-lico-gray-5 hover:bg-lico-orange-1'
        }`}
      >
        {isFollowing ? (
          isHovered ? (
            <LuHeartOff className="h-5 w-5" />
          ) : (
            <FaHeart className="h-5 w-5" />
          )
        ) : (
          <LuHeart className="h-5 w-5" />
        )}
        {isFollowing ? '팔로잉' : '팔로우'}
      </button>
    </div>
  );
}
