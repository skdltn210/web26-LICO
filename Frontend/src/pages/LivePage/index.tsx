import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { config } from '@config/env';
import { useLiveDetail, useLiveStatus } from '@hooks/useLive';
import useMediaQuery from '@hooks/useMediaQuery';
import ChatWindow from '@components/chat/ChatWindow';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';
import NotFound from '@components/error/NotFound';
import LoadingSpinner from '@components/common/LoadingSpinner';
import VideoPlayer from '@components/VideoPlayer';
import LiveInfo from '@pages/LivePage/LiveInfo';
import StreamerInfo from '@pages/LivePage/StreamerInfo';
import useViewMode from '@store/useViewMode';

const MEDIUM_BREAKPOINT = '(min-width: 700px)';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();
  const { data: liveDetail, isLoading: isLoadingDetail, error: detailError } = useLiveDetail(id!);
  const { data: liveStatus, error: statusError } = useLiveStatus(id!);
  const { isTheaterMode } = useViewMode();
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(true);
  const [isChatLocked, setIsChatLocked] = useState<boolean>(false);

  const STREAM_URL = `${config.storageUrl}/${id}/index.m3u8`;

  const isMediumScreen = useMediaQuery(MEDIUM_BREAKPOINT);
  const isVerticalLayout = !isMediumScreen;

  const isChatVisible = isChatExpanded;
  const shouldShowChatToggle = isMediumScreen && !isChatExpanded;

  const handleChatToggle = () => {
    setIsChatLocked(isChatExpanded);
    setIsChatExpanded(!isChatExpanded);
  };

  useEffect(() => {
    if (!isChatLocked && !isTheaterMode) {
      setIsChatExpanded(isMediumScreen);
    }
  }, [isChatLocked, isMediumScreen, isTheaterMode]);

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

  return (
    <div className={`flex h-screen ${isTheaterMode && isVerticalLayout ? 'flex-col' : ''}`}>
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
                streamerId={liveDetail.streamerId}
              />
            </>
          )}
        </div>
      </div>

      {isChatVisible && (
        <div
          className={`transition-all duration-500 ease-in-out ${isChatVisible ? 'translate-x-0' : 'translate-x-full'} ${
            isTheaterMode && isVerticalLayout ? 'w-full overflow-hidden' : 'w-[360px]'
          } `}
        >
          <ChatWindow id={id} onAir={currentOnAir} onToggleChat={handleChatToggle} />
        </div>
      )}

      {((isTheaterMode && !isChatVisible) || (!isTheaterMode && shouldShowChatToggle)) && (
        <ChatOpenButton onClick={handleChatToggle} />
      )}
    </div>
  );
}
