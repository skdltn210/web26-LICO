import mockChannels from '@mocks/mockChannels';
import ChannelGrid from '@/components/channel/ChannelGrid';
import SortButton from '@components/common/Buttons/SortButton';
import { useState, useMemo } from 'react';
import { FaFire } from 'react-icons/fa';
import { LuClock, LuThumbsUp } from 'react-icons/lu';

type SortType = 'popular' | 'recent' | 'recommended';

export default function LivesPage() {
  const [activeSort, setActiveSort] = useState<SortType>('popular');

  const sortedChannels = useMemo(() => {
    let channels = [...mockChannels];

    switch (activeSort) {
      case 'popular':
        return channels.sort((a, b) => b.viewers - a.viewers);
      case 'recent':
        return channels.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      case 'recommended':
        return channels.sort(() => Math.random() - 0.5);
      default:
        return channels;
    }
  }, [activeSort]);

  return (
    <div className="p-12">
      <div className="mb-3 px-4 font-bold text-2xl text-lico-gray-1">전체 방송</div>
      <div className="mb-3 flex gap-2 px-4">
        <SortButton
          label="인기"
          isActive={activeSort === 'popular'}
          icon={FaFire}
          onClick={() => setActiveSort('popular')}
        />
        <SortButton
          label="최신"
          isActive={activeSort === 'recent'}
          icon={LuClock}
          onClick={() => setActiveSort('recent')}
        />
        <SortButton
          label="추천"
          isActive={activeSort === 'recommended'}
          icon={LuThumbsUp}
          onClick={() => setActiveSort('recommended')}
        />
      </div>
      <ChannelGrid channels={sortedChannels} />
    </div>
  );
}
