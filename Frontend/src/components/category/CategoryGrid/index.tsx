import CategoryCard, { CategoryCardProps } from '@components/category/CategoryCard';

type CategoryGridProps = {
  categories: CategoryCardProps[];
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="container mx-auto px-4">
      <ul className="grid grid-cols-3 gap-4 cards-4:grid-cols-4 cards-5:grid-cols-5 cards-6:grid-cols-6">
        {categories.map(category => (
          <li key={category.id} className="min-w-[151px]">
            <CategoryCard {...category} />
          </li>
        ))}
      </ul>
    </div>
  );
}
