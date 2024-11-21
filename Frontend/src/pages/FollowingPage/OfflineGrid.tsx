import type { ChannelCardProps } from '@components/channel/ChannelCard';
import OfflineCard from './OfflineCard';

interface OfflineGridProps {
  channels: ChannelCardProps[];
}

export default function OfflineGrid({ channels }: OfflineGridProps) {
  return (
    <ul className="flex flex-wrap gap-4">
      {channels.map(channel => (
        <li className="w-[72px]">
          <OfflineCard id={channel.id} profileImgUrl={channel.profileImgUrl} streamerName={channel.streamerName} />
        </li>
      ))}
    </ul>
  );
}
