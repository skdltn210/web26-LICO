import { useNavigate } from 'react-router-dom';
import ChannelThumbnail from '@/components/channel/ChannelCard/ChannelThumbnail';
import ChannelInfo from './ChannelInfo';
import { useChannel } from '@/contexts/ChannelContext';
import mockCategories from '@/mocks/mockCategories';
import mockUsers from '@/mocks/mockUsers';

export interface ChannelCardProps {
  id: string;
  title: string;
  streamerName: string;
  viewers: number;
  category: string;
  categoryId?: string;
  profileImgUrl: string;
  thumbnailUrl: string;
  createdAt: string;
}

export default function ChannelCard({
  id,
  title,
  streamerName,
  viewers,
  category,
  categoryId = category,
  profileImgUrl,
  thumbnailUrl,
  createdAt,
}: ChannelCardProps) {
  const navigate = useNavigate();
  const { setCurrentChannel } = useChannel();

  const handleClick = () => {
    const categoryData = mockCategories.find(cat => cat.id === categoryId);
    const userData = mockUsers[id];

    if (categoryData && userData) {
      setCurrentChannel({
        id,
        title,
        streamerName,
        channelDescription: userData.channelDescription,
        viewers,
        followers: userData.followers,
        category: {
          id: categoryData.id,
          name: categoryData.name,
        },
        profileImgUrl,
        thumbnailUrl,
        createdAt,
      });
      navigate(`/live/${id}`);
    }
  };

  return (
    <div className="mb-4 min-w-60 cursor-pointer" onClick={handleClick}>
      <ChannelThumbnail title={title} thumbnailUrl={thumbnailUrl} viewers={viewers} />
      <ChannelInfo
        title={title}
        streamerName={streamerName}
        category={category}
        categoryId={categoryId}
        profileImgUrl={profileImgUrl}
      />
    </div>
  );
}
