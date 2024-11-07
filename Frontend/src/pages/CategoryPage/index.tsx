import { useCategories } from '@hooks/useCategory';
import CategoryGrid from '@components/category/CategoryGrid';

export default function CategoryPage() {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!categories) return null;

  return (
    <div className="min-w-[202px] overflow-auto p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">카테고리</div>
      <CategoryGrid
        categories={categories.map(category => ({
          id: category.id,
          name: category.name,
          image: category.image,
          totalViewers: 0,
          totalLives: 0,
        }))}
      />
    </div>
  );
}
