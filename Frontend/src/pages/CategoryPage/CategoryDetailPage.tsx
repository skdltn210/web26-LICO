import { useParams } from 'react-router-dom';
import ChannelGrid from '@components/channel/ChannelGrid';
import { useCategoryLives, useCategoryDetail } from '@hooks/useCategory';
import { formatUnit } from '@utils/format';
import LoadingSpinner from '@components/common/LoadingSpinner';

export default function CategoryDetailPage() {
  const { categoryId } = useParams();

  if (!categoryId) {
    return <div>잘못된 접근입니다.</div>;
  }

  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategoryDetail(categoryId);
  const { data: lives, isLoading: livesLoading, error: livesError } = useCategoryLives(categoryId);

  console.log('lives data:', lives); // 데이터 구조 확인

  if (categoryLoading || livesLoading) {
    return <LoadingSpinner />;
  }

  if (categoryError || livesError) {
    return <div>데이터를 불러오는데 실패했습니다.</div>;
  }

  if (!category || !lives) {
    return null;
  }

  const channelsData = lives.map(live => ({
    id: live.channelId,
    title: live.livesName,
    streamerName: live.usersNickname,
    profileImgUrl: live.usersProfileImage,
    viewers: 0,
    category: live.categoriesName,
    categoryId: live.categoriesId,
    streamerId: live.streamerId,
    thumbnailUrl: '/default-thumbnail.png',
    createdAt: new Date().toISOString(),
  }));

  const totalViewers = channelsData.reduce((sum, channel) => sum + channel.viewers, 0);

  return (
    <div className="min-w-[752px] overflow-auto p-12">
      <div className="mb-6 flex px-4">
        <div className="relative mb-4 h-[180px] w-[135px]">
          <img src={category.image} alt={category.name} className="h-full w-full rounded-xl object-cover" />
        </div>
        <div className="p-8">
          <h1 className="font-bold text-2xl text-lico-gray-1">{category.name}</h1>
          <p className="mt-2 font-medium text-sm text-lico-gray-2">
            시청자 {formatUnit(totalViewers)}명 · 라이브 {lives.length}개
          </p>
        </div>
      </div>
      <div className="mb-6 h-[1px] bg-lico-gray-3" />
      <ChannelGrid channels={channelsData} />
    </div>
  );
}
