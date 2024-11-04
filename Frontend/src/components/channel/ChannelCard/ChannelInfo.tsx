import Badge from '@components/common/Badges/Badge';

interface ChannelInfoProps {
  title: string;
  streamerName: string;
  category: string;
  profileImgUrl: string;
}

function ChannelInfo({ title, streamerName, category, profileImgUrl }: ChannelInfoProps) {
  return (
    <div className="flex items-start gap-2 pt-2">
      <img className="h-10 w-10 cursor-pointer rounded-full bg-lico-gray-4" src={profileImgUrl} alt={streamerName} />
      <div className="cursor-pointer">
        <h3 className="text-md line-clamp-2 max-h-[48px] font-bold text-lico-orange-2">{title}</h3>
        <h3 className="line-clamp-1 text-xs text-lico-gray-2">{streamerName}</h3>
        <Badge text={category} className="bg-lico-orange-2 text-lico-gray-1 hover:bg-lico-orange-1" />
      </div>
    </div>
  );
}

export default ChannelInfo;
