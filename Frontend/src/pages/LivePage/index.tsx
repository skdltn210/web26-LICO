import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import VideoPlayer from '@components/VideoPlayer';
import LiveInfo from '@components/LiveInfo';
import StreamerInfo from '@components/LiveInfo/StreamerInfo';
import mockChannels from '@mocks/mockChannels';
import mockUsers from '@mocks/mockUsers.ts';
import mockCategories from '@mocks/mockCategories.ts';
import { useChannel } from '@contexts/ChannelContext';
import ChatWindow from '@components/chat/ChatWindow';
import useMediaQuery from '@hooks/useMediaQuery.ts';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();
  const { currentChannel, setCurrentChannel } = useChannel();
  const isMobile = useMediaQuery('(max-width: 1324px)');
  const [isChatOpen, setIsChatOpen] = useState(!isMobile);

  useEffect(() => {
    setIsChatOpen(!isMobile);
  }, [isMobile]);

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
    <div className="flex">
      <div className="min-w-96 flex-1">
        <VideoPlayer streamUrl="" />
        <LiveInfo channelId={id} />
        <StreamerInfo />
      </div>
      <div className={`overflow-hidden transition-[width] ease-in-out ${isChatOpen ? 'w-96' : 'w-0'} `}>
        <ChatWindow />
      </div>
    </div>
  );
}
