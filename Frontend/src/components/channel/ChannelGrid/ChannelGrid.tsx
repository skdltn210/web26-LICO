import ChannelCard, { ChannelCardProps } from '@components/channel/ChannelCard';

interface ChannelGridProps {
  channels: ChannelCardProps[];
}

function ChannelGrid({ channels }: ChannelGridProps) {
  return (
    <div className="container mx-auto px-4">
      <ul className="grid min-w-[752px] grid-cols-3 gap-4 cards-4:grid-cols-4 cards-5:grid-cols-5 cards-6:grid-cols-6">
        {channels.map(channel => (
          <li key={channel.id}>
            <ChannelCard {...channel} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChannelGrid;
