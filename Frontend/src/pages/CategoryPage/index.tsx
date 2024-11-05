import mockCategories from '@mocks/mockCategories';
import CategoryGrid from '@/components/category/CategoryGrid';

export default function CategoryPage() {
  return (
    <div className="min-w-[202px] overflow-auto p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">카테고리</div>
      <CategoryGrid categories={mockCategories} />
    </div>
  );
}
