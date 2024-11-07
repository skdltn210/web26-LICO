import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import VideoPlayer from '@components/VideoPlayer';
import LiveInfo from '@components/LiveInfo';
import StreamerInfo from '@components/LiveInfo/StreamerInfo';
import mockChannels from '@mocks/mockChannels';
import mockUsers from '@mocks/mockUsers.ts';
import mockCategories from '@mocks/mockCategories';
import { useChannel } from '@contexts/ChannelContext';
import ChatWindow from '@components/chat/ChatWindow';
import useMediaQuery from '@hooks/useMediaQuery';
import useLayoutStore from '@store/useLayoutStore';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();
  const { currentChannel, setCurrentChannel } = useChannel();
  const { chatState, videoPlayerState, toggleChat, handleBreakpoint } = useLayoutStore();

  const isLarge = useMediaQuery('(min-width: 1200px)');
  const isMedium = useMediaQuery('(min-width: 700px)');

  useEffect(() => {
    if (isLarge) {
      handleBreakpoint('FULL');
    } else if (isMedium) {
      handleBreakpoint('NAV_COLLAPSED');
    } else {
      handleBreakpoint('CHAT_HIDDEN');
    }
  }, [isLarge, isMedium]);

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

  const isChatToggleVisible = isMedium && chatState === 'hidden';
  const isTheaterMode = videoPlayerState === 'theater';
  const isVerticalMode = !isMedium;

  if (isTheaterMode) {
    return (
      <div className={`flex h-screen ${isVerticalMode ? 'flex-col' : ''} `}>
        <div className="flex-1">
          <VideoPlayer streamUrl="" />
        </div>
        {chatState === 'expanded' && <ChatWindow />}
        {chatState === 'hidden' && <ChatOpenButton onClick={toggleChat} />}
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <div
          className="flex h-full flex-col overflow-y-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <VideoPlayer streamUrl="" />
          <LiveInfo channelId={id} />
          <StreamerInfo />
        </div>
      </div>
      {chatState === 'expanded' && (
        <div className="w-[360px]">
          <ChatWindow />
        </div>
      )}
      {isChatToggleVisible && <ChatOpenButton onClick={toggleChat} />}
    </div>
  );
}
