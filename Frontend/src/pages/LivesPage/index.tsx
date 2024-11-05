import mockChannels from '@mocks/mockChannels';
import ChannelGrid from '@/components/channel/ChannelGrid';
import SortButton from '@components/common/Buttons/SortButton';
import { useState } from 'react';
import { FaFire } from 'react-icons/fa';
import { LuClock, LuThumbsUp } from 'react-icons/lu';

type SortType = 'popular' | 'recent' | 'recommended';

function LivePage() {
  const [activeSort, setActiveSort] = useState<SortType>('popular');
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
      <ChannelGrid channels={mockChannels} />
    </div>
  );
}

export default LivePage;
