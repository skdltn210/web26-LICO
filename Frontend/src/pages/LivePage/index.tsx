import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { config } from '@config/env';
import { useLiveDetail, useLiveStatus } from '@hooks/useLive';
import useMediaQuery from '@hooks/useMediaQuery';
import useViewMode from '@store/useViewMode';
import ChatWindow from '@components/chat/ChatWindow';
import ChatOpenButton from '@components/common/Buttons/ChatOpenButton';
import NotFound from '@components/error/NotFound';
import LoadingSpinner from '@components/common/LoadingSpinner';
import VideoPlayer from '@components/VideoPlayer';
import LiveInfo from '@pages/LivePage/LiveInfo';
import StreamerInfo from '@pages/LivePage/StreamerInfo';
import OfflinePlayer from '@components/VideoPlayer/OfflinePlayer';
import useCheckStream from '@hooks/useCheckStream';
import { useDelayedLoading } from '@hooks/useDelayedLoading.ts';

const MEDIUM_BREAKPOINT = '(min-width: 700px)';

export default function LivePage() {
  const { id } = useParams<{ id: string }>();
  const { data: liveDetail, isLoading: isLoadingDetail, error: detailError } = useLiveDetail(id!);
  const { data: liveStatus, error: statusError } = useLiveStatus(id!);
  const { isTheaterMode } = useViewMode();
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(true);
  const [isChatLocked, setIsChatLocked] = useState<boolean>(false);

  const STREAM_URL = `${config.storageUrl}/${id}/index.m3u8`;

  const { isStreamReady, isChecking, checkStreamAvailability } = useCheckStream(STREAM_URL);
  const showStreamCheckLoading = useDelayedLoading(isChecking, { minLoadingTime: 500 });

  const isMediumScreen = useMediaQuery(MEDIUM_BREAKPOINT);
  const isVerticalLayout = !isMediumScreen;
  const shouldShowChatToggle = isMediumScreen && !isChatExpanded;

  const handleChatToggle = () => {
    isChatExpanded ? setIsChatLocked(true) : setIsChatLocked(false);
    setIsChatExpanded(!isChatExpanded);
  };

  useEffect(() => {
    if (!isChatLocked && !isTheaterMode) {
      setIsChatExpanded(isMediumScreen);
    }
  }, [isChatLocked, isMediumScreen, isTheaterMode]);

  useEffect(() => {
    checkStreamAvailability();
  }, [checkStreamAvailability]);

  if (isLoadingDetail)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if ((detailError && detailError.status === 404) || !liveDetail || !id) return <NotFound />;
  if (detailError || statusError) return <div className="h-full w-full">에러가 발생했습니다.</div>;

  const currentTitle = liveStatus?.livesName ?? liveDetail.livesName;
  const currentCategoryId = liveStatus?.categoriesId ?? liveDetail.categoriesId;
  const currentCategoryName = liveStatus?.categoriesName ?? liveDetail.categoriesName;
  const currentOnAir = liveStatus?.onAir || liveDetail.onAir;
  const currentDescription = liveStatus?.livesDescription ?? liveDetail.livesDescription;

  return (
    <div className={`flex h-screen ${isTheaterMode && isVerticalLayout ? 'flex-col' : ''}`}>
      <div className="relative flex-1">
        <div className="flex h-full flex-col overflow-y-auto scrollbar-hide">
          {!currentOnAir ? (
            <OfflinePlayer />
          ) : isStreamReady ? (
            <VideoPlayer streamUrl={STREAM_URL} onAir={currentOnAir} />
          ) : showStreamCheckLoading ? (
            <div className="flex h-full w-full items-center justify-center bg-black text-center font-bold text-white">
              <p>
                방송 준비 중입니다. <br /> 잠시만 기다려주세요!
              </p>
            </div>
          ) : (
            <div className="flex h-full w-full" />
          )}

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

      {isChatExpanded && (
        <div
          className={`transition-all duration-500 ease-in-out ${isChatExpanded ? 'translate-x-0' : 'translate-x-full'} ${
            isTheaterMode && isVerticalLayout ? 'w-full overflow-hidden' : 'w-[360px]'
          } `}
        >
          <ChatWindow id={id} onAir={currentOnAir} onToggleChat={handleChatToggle} />
        </div>
      )}

      {((isTheaterMode && !isChatExpanded) || (!isTheaterMode && shouldShowChatToggle)) && (
        <ChatOpenButton onClick={handleChatToggle} />
      )}
    </div>
  );
}
