import Badge from '@components/common/Badges/Badge';
import { formatNumber } from '@utils/format';
import { useState, useEffect } from 'react';
import ThumbnailSkeleton from '@components/channel/ChannelCard/ThumbnailSkeleton';

interface ChannelThumbnailProps {
  title: string;
  thumbnailUrl: string;
  viewers: number;
}

const maxRetries = 5;
const retryDelay = 2000;

function ChannelThumbnail({ title, thumbnailUrl, viewers }: ChannelThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true); // 초기값을 true로 변경
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (imgError && retryCount < maxRetries) {
      setIsLoading(true);
      timeoutId = setTimeout(() => {
        setImgError(false);
        setRetryCount(prev => prev + 1);
      }, retryDelay);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [imgError, retryCount]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImgError(false);
  };

  const handleImageError = () => {
    setImgError(true);
    if (retryCount >= maxRetries) {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative aspect-video cursor-pointer overflow-hidden rounded-xl">
      {isLoading && <ThumbnailSkeleton />}
      <img
        key={retryCount}
        src={thumbnailUrl}
        alt={title}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`absolute h-full w-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100 hover:brightness-50'}`}
      />
      {!isLoading && !imgError && (
        <div className="flex gap-2">
          <Badge text="LIVE" className="absolute left-2 top-2 bg-[#E02120] font-bold text-sm text-white" />
          <Badge
            text={`${formatNumber(viewers)}명`}
            className="absolute bottom-2 left-2 bg-lico-orange-2 font-bold text-sm text-white"
          />
        </div>
      )}
      {imgError && retryCount >= maxRetries && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <p className="text-sm text-gray-600">이미지를 불러올 수 없습니다</p>
        </div>
      )}
    </div>
  );
}

export default ChannelThumbnail;
