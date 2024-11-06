import { useParams } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import LiveInfo from '@/components/LiveInfo';
import StreamerInfo from '@/components/LiveInfo/StreamerInfo';
import { useChannel } from '@/contexts/ChannelContext';
import mockChannels from '@/mocks/mockChannels';
import mockUsers from '@/mocks/mockUsers';
import mockCategories from '@/mocks/mockCategories';
import { useEffect } from 'react';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();
  const { currentChannel, setCurrentChannel } = useChannel();

  useEffect(() => {
    if (!currentChannel && id) {
      const channel = mockChannels.find(channel => channel.id === id);
      const user = mockUsers[id];
      const categoryData = mockCategories.find(cat => cat.id === channel?.category);

      if (channel && user && categoryData) {
        setCurrentChannel({
          id: channel.id,
          title: channel.title,
          streamerName: channel.streamerName,
          channelDescription: user.channelDescription,
          viewers: channel.viewers,
          followers: user.followers,
          category: {
            id: categoryData.id,
            name: categoryData.name,
          },
          profileImgUrl: channel.profileImgUrl,
          thumbnailUrl: channel.thumbnailUrl,
          createdAt: channel.createdAt,
        });
      }
    }
  }, [currentChannel, id, setCurrentChannel]);

  if (!id) return <div>잘못된 접근입니다.</div>;

  if (!currentChannel) return <div>존재하지 않는 채널입니다.</div>;

  return (
    <>
      <VideoPlayer streamUrl="" />
      <LiveInfo channelId={id} />
      <StreamerInfo />
    </>
  );
}
