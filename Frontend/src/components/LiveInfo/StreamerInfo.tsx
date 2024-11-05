import mockUsers from '@/mocks/mockUsers';
import { formatNumber } from '@/utils/format';

interface StreamerInfoProps {
  channelId: string;
}

export default function StreamerInfo({ channelId }: StreamerInfoProps) {
  const user = mockUsers[channelId];

  if (!user) return null;

  return (
    <div className="w-full max-w-4xl p-3">
      <div className="flex items-center gap-3">
        <div className="font-bold text-lg text-lico-orange-2">{user.channelName}</div>
        <div className="font-medium text-sm text-lico-gray-2">팔로워 {formatNumber(user.followers)}명</div>
      </div>
      <div className="font-medium text-lico-gray-1">{user.channelDescription}</div>
    </div>
  );
}
