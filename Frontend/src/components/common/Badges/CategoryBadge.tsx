import { useNavigate } from 'react-router-dom';

interface CategoryBadgeProps {
  category: string;
  categoryId: number;
  className?: string;
}

export default function CategoryBadge({ category, categoryId, className }: CategoryBadgeProps) {
  const navigate = useNavigate();

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/category/${categoryId}`);
  };

  return (
    <span
      data-category-badge
      onClick={handleCategoryClick}
      className={`${className} inline-block cursor-pointer rounded-full bg-lico-orange-2 px-2.5 py-0.5 font-bold transition-colors hover:bg-lico-orange-1`}
    >
      {category}
    </span>
  );
}
