import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import VideoPlayer from '@components/VideoPlayer';
import LiveInfo from '@components/LiveInfo';
import StreamerInfo from '@components/LiveInfo/StreamerInfo';
import { useChannel, convertLiveDetailToChannel } from '@contexts/ChannelContext';
import ChatWindow from '@components/chat/ChatWindow';
import useMediaQuery from '@hooks/useMediaQuery';
import useLayoutStore from '@store/useLayoutStore';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';
import { useLiveDetail } from '@/hooks/useLive';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();

  const { currentChannel, setCurrentChannel } = useChannel();
  const { chatState, videoPlayerState, toggleChat, handleBreakpoint } = useLayoutStore();

  const { data: liveDetail, isLoading, error } = useLiveDetail(id!);

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
  }, [isLarge, isMedium, handleBreakpoint]);

  useEffect(() => {
    if (liveDetail && !currentChannel) {
      const channelData = convertLiveDetailToChannel(liveDetail, id!);
      setCurrentChannel(channelData);
    }
  }, [liveDetail, currentChannel, id, setCurrentChannel]);

  if (!id) return <div>잘못된 접근입니다.</div>;
  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!liveDetail) return <div>존재하지 않는 채널입니다.</div>;

  const isChatToggleVisible = isMedium && chatState === 'hidden';
  const isTheaterMode = videoPlayerState === 'theater';
  const isVerticalMode = !isMedium;

  if (isTheaterMode) {
    return (
      <div className={`flex h-screen ${isVerticalMode ? 'flex-col' : ''}`}>
        <div className="flex-1">
          <VideoPlayer streamUrl={`${liveDetail.streamingKey}`} />
        </div>
        {chatState === 'expanded' && (
          <div className={`${isVerticalMode ? 'h-[40vh]' : 'w-[360px]'}`}>
            <ChatWindow />
          </div>
        )}
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
          <VideoPlayer streamUrl={`${liveDetail.streamingKey}`} />
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
