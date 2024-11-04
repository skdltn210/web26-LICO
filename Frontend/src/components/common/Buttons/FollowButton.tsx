import { LuHeart } from 'react-icons/lu';

export default function FollowButton() {
  return (
    <button className="flex h-9 items-center gap-2 rounded bg-lico-orange-2 px-4 pb-[6px] pt-[7px] font-bold text-base text-lico-gray-5 transition-colors hover:bg-lico-orange-1">
      <LuHeart className="-mt-0.5 h-5 w-5" />
      팔로우
    </button>
  );
}
