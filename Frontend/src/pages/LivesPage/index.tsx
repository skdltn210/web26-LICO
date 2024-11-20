import { FaFire } from 'react-icons/fa';
import { LuClock, LuThumbsUp } from 'react-icons/lu';
import ChannelGrid from '@components/channel/ChannelGrid';
import SortButton from '@components/common/Buttons/SortButton';
import { useLives } from '@hooks/useLive';
import { useSortStore } from '@store/useSortStore';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { config } from '@config/env.ts';

export default function LivesPage() {
  const { sortType, setSortType } = useSortStore();

  const { data: lives, isLoading, error } = useLives(sortType);

  if (isLoading)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div>에러가 발생했습니다</div>;
  if (!lives) return null;

  return (
    <div className="p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">전체 방송</div>
      <div className="mb-3 flex gap-2 px-4">
        <SortButton
          label="인기"
          isActive={sortType === 'viewers'}
          icon={FaFire}
          onClick={() => setSortType('viewers')}
        />
        <SortButton
          label="최신"
          isActive={sortType === 'latest'}
          icon={LuClock}
          onClick={() => setSortType('latest')}
        />
        <SortButton
          label="추천"
          isActive={sortType === 'random'}
          icon={LuThumbsUp}
          onClick={() => setSortType('random')}
        />
      </div>
      <ChannelGrid
        channels={lives.map(live => ({
          id: live.channelId,
          title: live.livesName,
          streamerName: live.usersNickname,
          profileImgUrl: live.usersProfileImage,
          viewers: live.viewers,
          category: live.categoriesName,
          categoryId: live.categoriesId,
          thumbnailUrl: `${config.storageUrl}/${live.channelId}/thumbnail.jpg`,
          createdAt: new Date().toISOString(),
        }))}
      />
    </div>
  );
}
