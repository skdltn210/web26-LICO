import mockChannels from '@mocks/mockChannels';
import ChannelGrid from '@components/channel/ChannelGrid';

function HomePage() {
  return (
    <div className="p-12">
      <ChannelGrid channels={mockChannels} />
    </div>
  );
}

export default HomePage;
