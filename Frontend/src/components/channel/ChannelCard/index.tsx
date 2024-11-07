import { useNavigate } from 'react-router-dom';
import ChannelThumbnail from '@components/channel/ChannelCard/ChannelThumbnail';
import ChannelInfo from './ChannelInfo';
import { useChannel } from '@contexts/ChannelContext';

export interface ChannelCardProps {
  id: string;
  title: string;
  streamerName: string;
  profileImgUrl: string;
  viewers: number;
  category: string;
  categoryId: number;
  thumbnailUrl: string;
  createdAt: string;
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
  createdAt,
}: ChannelCardProps) {
  const navigate = useNavigate();
  const { setCurrentChannel } = useChannel();

  const handleClick = () => {
    setCurrentChannel({
      id,
      title,
      streamerName,
      channelDescription: '',
      viewers,
      followers: 0,
      category: {
        id: categoryId,
        name: category,
      },
      profileImgUrl,
      thumbnailUrl,
      createdAt,
    });

    navigate(`/live/${id}`);
  };

  return (
    <div className="mb-4 min-w-60 cursor-pointer" onClick={handleClick}>
      <ChannelThumbnail title={title} thumbnailUrl={thumbnailUrl} viewers={viewers} />
      <ChannelInfo
        title={title}
        streamerName={streamerName}
        category={category}
        categoryId={categoryId.toString()}
        profileImgUrl={profileImgUrl}
      />
    </div>
  );
}
