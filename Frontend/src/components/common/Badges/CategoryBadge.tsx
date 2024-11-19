import { Link } from 'react-router-dom';

interface CategoryBadgeProps {
  category: string;
  categoryId: number;
  className?: string;
}

export default function CategoryBadge({ category, categoryId, className }: CategoryBadgeProps) {
  return (
    <Link
      to={`/category/${categoryId}`}
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        window.location.href = `/category/${categoryId}`;
      }}
      className={`${className} inline-block cursor-pointer rounded-full bg-lico-orange-2 px-2.5 py-0.5 font-bold transition-colors hover:bg-lico-orange-1`}
    >
      {category}
    </Link>
  );
}
