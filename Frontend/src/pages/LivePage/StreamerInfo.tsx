import { formatNumber } from '@utils/format';
import { useFollowerCount } from '@hooks/useFollow.ts';

interface StreamerInfoProps {
  streamerName: string;
  streamerId: number;
  channelDescription: string;
}

export default function StreamerInfo({ streamerName, streamerId, channelDescription }: StreamerInfoProps) {
  const { data: { followerCount } = { followerCount: 0 } } = useFollowerCount(streamerId);

  return (
    <div className="w-full p-3">
      <div className="flex items-center gap-3">
        <div className="font-bold text-lg text-lico-orange-2">{streamerName}</div>
        <div className="font-medium text-sm text-lico-gray-2">팔로워 {formatNumber(followerCount)}명</div>
      </div>
      <div className="font-medium text-lico-gray-1">{channelDescription}</div>
    </div>
  );
}
