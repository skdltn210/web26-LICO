import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { config } from '@config/env';
import { useLiveDetail, useLiveStatus } from '@hooks/useLive';
import useMediaQuery from '@hooks/useMediaQuery';
import useLayoutStore from '@store/useLayoutStore';
import ChatWindow from '@components/chat/ChatWindow';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';
import NotFound from '@components/error/NotFound';
import LoadingSpinner from '@components/common/LoadingSpinner';
import VideoPlayer from '@components/VideoPlayer';
import LiveInfo from '@pages/LivePage/LiveInfo';
import StreamerInfo from '@pages/LivePage/StreamerInfo';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();
  const { chatState, videoPlayerState, toggleChat, handleBreakpoint } = useLayoutStore();
  const { data: liveDetail, isLoading: isLoadingDetail, error: detailError } = useLiveDetail(id!);
  const { data: liveStatus, error: statusError } = useLiveStatus(id!);

  const isLarge = useMediaQuery('(min-width: 1200px)');
  const isMedium = useMediaQuery('(min-width: 700px)');
  const STREAM_URL = `${config.storageUrl}/${id}/index.m3u8`;

  useEffect(() => {
    if (isLarge) {
      handleBreakpoint('FULL');
    } else if (isMedium) {
      handleBreakpoint('NAV_COLLAPSED');
    } else {
      handleBreakpoint('CHAT_HIDDEN');
    }
  }, [isLarge, isMedium, handleBreakpoint]);

  if (isLoadingDetail)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if ((detailError && detailError.status === 404) || !liveDetail || !id) return <NotFound />;
  if (detailError || statusError) return <div>에러가 발생했습니다.</div>;

  const currentTitle = liveStatus?.livesName ?? liveDetail.livesName;
  const currentCategoryId = liveStatus?.categoriesId ?? liveDetail.categoriesId;
  const currentCategoryName = liveStatus?.categoriesName ?? liveDetail.categoriesName;
  const currentOnAir = liveStatus?.onAir ?? liveDetail.onAir;
  const currentDescription = liveStatus?.livesDescription ?? liveDetail.livesDescription;

  const isChatToggleVisible = isMedium && chatState === 'hidden';
  const isTheaterMode = videoPlayerState === 'theater';
  const isVerticalMode = !isMedium;

  return (
    <div className={`flex h-screen ${isTheaterMode && isVerticalMode ? 'flex-col' : ''}`}>
      <div className="relative flex-1">
        <div className="flex h-full flex-col overflow-y-auto scrollbar-hide">
          <VideoPlayer streamUrl={STREAM_URL} onAir={currentOnAir} />
          {!isTheaterMode && (
            <>
              <LiveInfo
                streamerName={liveDetail.usersNickname}
                categoryId={currentCategoryId}
                categoryName={currentCategoryName}
                profileImgUrl={liveDetail.usersProfileImage}
                viewers={liveStatus?.viewers ?? 0}
                title={currentTitle}
                createdAt={liveDetail.startedAt}
                streamerId={liveDetail.streamerId}
                channelId={id}
              />
              <StreamerInfo
                streamerName={liveDetail.usersNickname}
                channelDescription={currentDescription}
                followers={0}
              />
            </>
          )}
        </div>
      </div>

      {chatState === 'expanded' && (
        <div className={`${isTheaterMode && isVerticalMode ? 'w-full overflow-hidden' : 'w-[360px]'}`}>
          <ChatWindow id={id} onAir={currentOnAir} />
        </div>
      )}

      {((isTheaterMode && chatState === 'hidden') || (!isTheaterMode && isChatToggleVisible)) && (
        <ChatOpenButton onClick={toggleChat} />
      )}
    </div>
  );
}
