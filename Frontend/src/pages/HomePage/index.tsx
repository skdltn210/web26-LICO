import ChannelGrid from '@components/channel/ChannelGrid';
import mockChannels from '@mocks/mockChannels';

function HomePage() {
  return (
    <div className="p-12">
      <ChannelGrid channels={mockChannels} />
    </div>
  );
}

export default HomePage;
