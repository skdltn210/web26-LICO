import mockCategories from '@mocks/mockCategories';
import { FaCircle } from 'react-icons/fa6';

interface CategoryStats {
  id: string;
  name: string;
  totalViewers: number;
  totalLives: number;
  thumbnailUrl: string;
}

interface CategoryCardProps {
  category: CategoryStats;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const formatViewerCount = (count: number): string => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}만명`;
    }
    return `${count}명`;
  };

  return (
    <div className="mb-3">
      <div className="relative inline-block w-full">
        <img
          src={category.thumbnailUrl}
          alt={category.name}
          className="aspect-[3/4] w-[calc(20vw-12px)] rounded-xl object-cover"
        />
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-[4px] bg-black bg-opacity-60 px-1">
          <FaCircle className="h-[6px] w-[6px] text-[#E02120]" />
          <span className="mt-0.5 font-bold text-xs text-white">{formatViewerCount(category.totalViewers)}</span>
        </div>
      </div>
      <div className="mx-0.5 mt-2 px-[3px]">
        <p className="font-bold text-sm text-lico-gray-1">{category.name}</p>
        <p className="font-medium text-xs text-lico-gray-2">라이브 {category.totalLives}개</p>
      </div>
    </div>
  );
};

const CategoryPage: React.FC = () => {
  return (
    <div className="p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">카테고리</div>
      <div className="grid grid-cols-5 gap-4 px-4">
        {mockCategories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
