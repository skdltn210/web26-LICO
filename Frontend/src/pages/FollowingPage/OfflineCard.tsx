import { Link } from 'react-router-dom';

interface OfflineCardProps {
  id: string;
  profileImgUrl: string;
  streamerName: string;
}

export default function OfflineCard({ id, profileImgUrl, streamerName }: OfflineCardProps) {
  return (
    <Link to={`/live/${id}`} aria-label={`${streamerName}의 채널로 이동`}>
      <div className="flex flex-col items-center">
        <img
          src={profileImgUrl}
          alt={streamerName}
          className="mb-2 h-[72px] w-[72px] rounded-full object-cover outline outline-[3px] outline-lico-gray-3 hover:outline-4 hover:outline-lico-orange-2"
        />
        <span className="text-center font-bold text-lico-gray-1">{streamerName}</span>
      </div>
    </Link>
  );
}
