import { formatNumber } from '@/utils/format';
import { useChannel } from '@/contexts/ChannelContext';

export default function StreamerInfo() {
  const { currentChannel } = useChannel();

  if (!currentChannel) return null;

  return (
    <div className="w-full max-w-4xl p-3">
      <div className="flex items-center gap-3">
        <div className="font-bold text-lg text-lico-orange-2">{currentChannel.streamerName}</div>
        <div className="font-medium text-sm text-lico-gray-2">팔로워 {formatNumber(currentChannel.followers)}명</div>
      </div>
      <div className="font-medium text-lico-gray-1">{currentChannel.channelDescription}</div>
    </div>
  );
}
