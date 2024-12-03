import { Link } from 'react-router-dom';
import ChannelThumbnail from '@components/channel/ChannelCard/ChannelThumbnail';
import HoverPreviewPlayer from '@components/channel/ChannelCard/HoverPreviewPlayer';
import { useRef, useState } from 'react';
import ChannelInfo from './ChannelInfo';

export interface ChannelCardProps {
  id: string;
  title: string;
  streamerName: string;
  profileImgUrl: string;
  viewers: number;
  category: string;
  categoryId: number;
  thumbnailUrl: string;
}

export default function ChannelCard({
  id,
  title,
  streamerName,
  viewers,
  category,
  categoryId,
  profileImgUrl,
  thumbnailUrl,
}: ChannelCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowPreview(false);
  };

  return (
    <div className="relative mb-4 min-w-60">
      <Link
        to={`/live/${id}`}
        aria-label={`${streamerName}의 ${title} 스트림으로 이동`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative aspect-video">
          <ChannelThumbnail title={title} thumbnailUrl={thumbnailUrl} viewers={viewers} />
          {showPreview && (
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <HoverPreviewPlayer channelId={id} />
            </div>
          )}
        </div>
      </Link>
      <ChannelInfo
        id={id}
        title={title}
        streamerName={streamerName}
        category={category}
        categoryId={categoryId}
        profileImgUrl={profileImgUrl}
      />
    </div>
  );
}
