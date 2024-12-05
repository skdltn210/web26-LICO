import { useCategories } from '@hooks/useCategory';
import CategoryGrid from '@components/category/CategoryGrid';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useDelayedLoading } from '@hooks/useDelayedLoading.ts';

export default function CategoryPage() {
  const { data: categories, isLoading, error } = useCategories();
  const showLoading = useDelayedLoading(isLoading, { minLoadingTime: 300 });

  if (showLoading)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div>에러가 발생했습니다</div>;
  if (!categories) return null;

  return (
    <div className="min-w-[700px] overflow-auto p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">카테고리</div>
      <CategoryGrid
        categories={categories.map(category => ({
          id: category.id,
          name: category.name,
          image: category.image,
          totalViewers: category.viewerCount,
          totalLives: category.liveCount,
        }))}
      />
    </div>
  );
}
