import { HiDotsVertical } from 'react-icons/hi';
import { LuArrowRightToLine, LuArrowDownToLine } from 'react-icons/lu';
import useLayoutStore from '@store/useLayoutStore';
import useMediaQuery from '@hooks/useMediaQuery';

type ChatHeaderProps = {
  onClose: () => void;
  onSettingsClick?: () => void;
};

export default function ChatHeader({ onClose, onSettingsClick }: ChatHeaderProps) {
  const { videoPlayerState } = useLayoutStore();
  const isVerticalMode = !useMediaQuery('(min-width: 700px)');

  return (
    <div
      role="region"
      aria-label="채팅방"
      className="flex items-center justify-between border-b border-lico-gray-3 p-4"
    >
      <button
        aria-label="채팅창 닫기"
        type="button"
        onClick={onClose}
        className="rounded-md p-2 text-lico-gray-2 hover:bg-lico-gray-3"
      >
        {videoPlayerState && isVerticalMode ? <LuArrowDownToLine size={20} /> : <LuArrowRightToLine size={20} />}
      </button>
      <h3 className="font-bold text-xl text-lico-orange-2">채팅</h3>
      <button
        aria-label="채팅창 설정"
        type="button"
        onClick={onSettingsClick}
        className="rounded-md p-2 text-lico-gray-2 hover:bg-lico-gray-3"
      >
        <HiDotsVertical size={20} />
      </button>
    </div>
  );
}
