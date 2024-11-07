import { useParams } from 'react-router-dom';
import ChannelGrid from '@components/channel/ChannelGrid';
import { useCategoryDetail } from '@hooks/useCategory';
import { formatUnit } from '@utils/format';
import mockChannels from '@mocks/mockChannels';

export default function CategoryDetailPage() {
  const { categoryId } = useParams();
  const { data: category, isLoading, error } = useCategoryDetail(categoryId!);

  const categoryChannels = mockChannels.filter(channel => channel.categoryId === categoryId);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러가 발생했습니다</div>;
  if (!category) return null;

  return (
    <div className="min-w-[752px] overflow-auto p-12">
      <div className="mb-6 flex px-4">
        <div className="relative mb-4 h-[180px] w-[135px]">
          <img src={category.image} alt={category.name} className="h-full w-full rounded-xl object-cover" />
        </div>
        <div className="p-8">
          <h1 className="font-bold text-2xl text-lico-gray-1">{category.name}</h1>
          <p className="mt-2 font-medium text-sm text-lico-gray-2">
            시청자 {formatUnit(0)}명 · 라이브 {0}개
          </p>
        </div>
      </div>
      <div className="mb-6 h-[1px] bg-lico-gray-3" />
      <ChannelGrid channels={categoryChannels} />
    </div>
  );
}
