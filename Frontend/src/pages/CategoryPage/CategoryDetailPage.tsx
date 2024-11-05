import { useParams } from 'react-router-dom';
import ChannelGrid from '@/components/channel/ChannelGrid';
import mockChannels from '@mocks/mockChannels';
import mockCategories from '@mocks/mockCategories';
import { formatUnit } from '@/utils/format';

export default function CategoryDetailPage() {
  const { categoryId } = useParams();

  const categoryChannels = mockChannels.filter(channel => channel.categoryId === categoryId);
  const categoryInfo = mockCategories.find(category => category.id === categoryId);

  return (
    <div className="min-w-[752px] overflow-auto p-12">
      <div className="mb-6 flex px-4">
        <div className="relative mb-4 h-[180px] w-[135px]">
          <img
            src={categoryInfo?.thumbnailUrl}
            alt={categoryInfo?.name}
            className="h-full w-full rounded-xl object-cover"
          />
        </div>
        <div className="p-8">
          <h1 className="font-bold text-2xl text-lico-gray-1">{categoryInfo?.name}</h1>
          <p className="mt-2 font-medium text-sm text-lico-gray-2">
            시청자 {formatUnit(categoryInfo?.totalViewers || 0)}명 · 라이브 {categoryInfo?.totalLives || 0}개
          </p>
        </div>
      </div>
      <div className="mb-6 h-[1px] bg-lico-gray-3" />
      <ChannelGrid channels={categoryChannels} />
    </div>
  );
}
