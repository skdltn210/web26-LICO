import { FaFire } from 'react-icons/fa';
import { LuClock, LuThumbsUp } from 'react-icons/lu';
import ChannelGrid from '@components/channel/ChannelGrid';
import SortButton from '@components/common/Buttons/SortButton';
import { useLives } from '@hooks/useLive';
import { useSortStore } from '@store/useSortStore';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { config } from '@config/env.ts';
import { useEffect, useRef } from 'react';

const ITEMS_PER_PAGE = 20;

export default function LivesPage() {
  const { sortType, setSortType } = useSortStore();
  const observerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useLives({
    sort: sortType,
    limit: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '500px' },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading)
    return (
      <div className="relative h-full w-full">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div>에러가 발생했습니다</div>;
  if (!data) return null;

  return (
    <div className="relative p-12">
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
          isActive={sortType === 'recommendation'}
          icon={LuThumbsUp}
          onClick={() => setSortType('recommendation')}
        />
      </div>
      <ChannelGrid
        channels={data.pages.flat().map(live => ({
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

      <div ref={observerRef} className="absolute bottom-[500px] h-10" />
    </div>
  );
}
