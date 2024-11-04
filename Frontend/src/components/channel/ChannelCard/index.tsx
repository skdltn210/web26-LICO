import { useNavigate } from 'react-router-dom';
import ChannelThumbnail from '@/components/channel/ChannelCard/ChannelThumbnail';
import ChannelInfo from './ChannelInfo';

export interface ChannelCardProps {
  id: string;
  title: string;
  streamerName: string;
  viewers: string;
  category: string;
  profileImgUrl: string;
  thumbnailUrl: string;
}

function ChannelCard({ id, title, streamerName, viewers, category, profileImgUrl, thumbnailUrl }: ChannelCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/live/${id}`);
  };

  return (
    <div className="mb-4 min-w-60 p-1" onClick={handleClick}>
      <ChannelThumbnail title={title} thumbnailUrl={thumbnailUrl} viewers={viewers} />
      <ChannelInfo title={title} streamerName={streamerName} category={category} profileImgUrl={profileImgUrl} />
    </div>
  );
}

export default ChannelCard;
