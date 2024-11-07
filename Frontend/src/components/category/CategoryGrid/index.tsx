import CategoryCard, { CategoryCardProps } from '@components/category/CategoryCard';

type CategoryGridProps = {
  categories: CategoryCardProps[];
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <ul className="grid min-w-[851px] grid-cols-5 gap-4 px-4">
      {categories.map(category => (
        <li key={category.id} className="min-w-[151px]">
          <CategoryCard {...category} />
        </li>
      ))}
    </ul>
  );
}
