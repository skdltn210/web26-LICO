import { LuUser } from 'react-icons/lu';
import CategoryBadge from '@components/common/Badges/CategoryBadge';
import FollowButton from '@components/common/Buttons/FollowButton';

export default function LiveInfo() {
  return (
    <div className="w-full max-w-4xl bg-lico-gray-4 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white p-2">
            <LuUser size={24} className="text-lico-gray-2" />
          </div>
          <div>
            <div className="font-bold text-base text-lico-orange-2">StreamerName</div>
            <div className="font-medium text-sm text-lico-gray-2">Game Name</div>
          </div>
        </div>
        <FollowButton />
      </div>
      <div className="mt-2 font-medium text-lico-gray-1">Stream Title: Exciting Gameplay Session!</div>
      <div className="mt-2 flex items-center gap-2">
        <CategoryBadge category="FPS" />
        <CategoryBadge category="Multiplayer" />
      </div>
    </div>
  );
}
