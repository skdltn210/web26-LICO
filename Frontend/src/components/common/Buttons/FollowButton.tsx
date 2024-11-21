import { LuHeart, LuHeartOff } from 'react-icons/lu';
import { FaHeart } from 'react-icons/fa';
import { useState } from 'react';
import { useFollow } from '@hooks/useFollow';
import { useAuthStore } from '@store/useAuthStore.ts';
import LoginConfirmModal from '@components/common/Modals/LoginConfirmModal';

interface FollowButtonProps {
  streamerId: number;
  channelId: string;
}

export default function FollowButton({ streamerId, channelId }: FollowButtonProps) {
  const { isFollowed, followChannel, unfollowChannel, isFollowing, isUnfollowing } = useFollow();
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const user = useAuthStore(state => state.user);

  const isLoggedIn = user !== null;
  const isFollowingChannel = isLoggedIn ? isFollowed(channelId) : false;

  const handleClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (isFollowingChannel) {
      unfollowChannel(streamerId);
      return;
    }
    followChannel(streamerId);
  };

  const followIcon = (() => {
    if (!isLoggedIn) return <LuHeart className="h-5 w-5" />;
    if (!isFollowingChannel) return <LuHeart className="h-5 w-5" />;
    return isHovered ? <LuHeartOff className="h-5 w-5" /> : <FaHeart className="h-5 w-5" />;
  })();

  const buttonText = isFollowingChannel ? '팔로잉' : '팔로우';
  const buttonStyle = isFollowingChannel
    ? 'bg-lico-gray-3 text-lico-gray-1 hover:bg-lico-gray-2'
    : 'bg-lico-orange-2 text-lico-gray-5 hover:bg-lico-orange-1';

  return (
    <>
      <div className="relative">
        {isLoggedIn && isFollowingChannel && isHovered && (
          <div className="absolute left-4 top-full mt-2 rounded-md bg-lico-gray-3 px-3 py-1.5 font-medium text-xs text-lico-gray-1">
            언팔로우
          </div>
        )}
        <button
          type="button"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isFollowing || isUnfollowing}
          className={`flex h-9 items-center gap-2 rounded px-4 font-bold text-base transition-colors ${buttonStyle} ${
            (isFollowing || isUnfollowing) && 'cursor-not-allowed opacity-50'
          }`}
        >
          {followIcon}
          {buttonText}
        </button>
      </div>

      <LoginConfirmModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="채널 팔로우를 위해서는 로그인이 필요합니다."
      />
    </>
  );
}
