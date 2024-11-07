import CategoryBadge from '@components/common/Badges/CategoryBadge';

interface ChannelInfoProps {
  title: string;
  streamerName: string;
  category: string;
  categoryId: string;
  profileImgUrl: string;
}

export default function ChannelInfo({ title, streamerName, category, categoryId, profileImgUrl }: ChannelInfoProps) {
  return (
    <div className="flex items-start gap-2 pt-2">
      <img className="h-10 w-10 cursor-pointer rounded-full bg-lico-gray-4" src={profileImgUrl} alt={streamerName} />
      <div className="cursor-pointer">
        <h3 className="line-clamp-2 max-h-[48px] font-bold text-base text-lico-orange-2">{title}</h3>
        <h3 className="line-clamp-1 font-medium text-xs text-lico-gray-2">{streamerName}</h3>
        <CategoryBadge category={category} categoryId={categoryId} className="text-xs text-lico-gray-1" />
      </div>
    </div>
  );
}
