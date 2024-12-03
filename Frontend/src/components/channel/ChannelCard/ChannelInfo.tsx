import CategoryBadge from '@components/common/Badges/CategoryBadge';
import { Link } from 'react-router-dom';

interface ChannelInfoProps {
  id: string;
  title: string;
  streamerName: string;
  category: string;
  categoryId: number;
  profileImgUrl: string;
}

export default function ChannelInfo({
  id,
  title,
  streamerName,
  category,
  categoryId,
  profileImgUrl,
}: ChannelInfoProps) {
  return (
    <div className="flex items-start gap-2 pt-2">
      <Link to={`/channel/${id}`} aria-label={`${streamerName}의 ${title} 스트림으로 이동`}>
        <img className="h-10 w-10 rounded-full bg-lico-gray-4" src={profileImgUrl} alt={streamerName} />
      </Link>
      <div>
        <Link to={`/channel/${id}`} aria-label={`${streamerName}의 ${title} 스트림으로 이동`}>
          <h3 className="line-clamp-2 max-h-[48px] font-bold text-base text-lico-orange-2">{title}</h3>
          <h3 className="line-clamp-1 font-medium text-xs text-lico-gray-2">{streamerName}</h3>
        </Link>
        <CategoryBadge category={category} categoryId={categoryId} className="text-xs text-lico-gray-1" />
      </div>
    </div>
  );
}
