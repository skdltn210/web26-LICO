import { useNavigate } from 'react-router-dom';
import { FaCircle } from 'react-icons/fa6';
import { formatUnit } from '@/utils/format';

export interface CategoryCardProps {
  id: number;
  name: string;
  image: string;
  totalViewers?: number;
  totalLives?: number;
}

export default function CategoryCard({ id, name, image, totalViewers = 0, totalLives = 0 }: CategoryCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${id}`);
  };

  return (
    <div className="mb-3 cursor-pointer" onClick={handleClick}>
      <div className="relative inline-block w-full">
        <img src={image} alt={name} className="aspect-[3/4] w-[calc(20vw-12px)] rounded-xl object-cover" />
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-[4px] bg-black bg-opacity-60 px-1">
          <FaCircle className="h-[6px] w-[6px] text-[#E02120]" />
          <span className="mt-0.5 font-bold text-xs text-white">{formatUnit(totalViewers)}명</span>
        </div>
      </div>
      <div className="mx-0.5 mt-2 px-[3px]">
        <p className="font-bold text-sm text-lico-gray-1">{name}</p>
        <p className="font-medium text-xs text-lico-gray-2">라이브 {totalLives}개</p>
      </div>
    </div>
  );
}
