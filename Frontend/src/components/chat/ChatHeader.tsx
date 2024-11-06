import { HiDotsVertical } from 'react-icons/hi';
import { FaArrowRightFromBracket } from 'react-icons/fa6';

type ChatHeaderProps = {
  onClose: () => void;
  onSettingsClick?: () => void;
};

export default function ChatHeader({ onClose, onSettingsClick }: ChatHeaderProps) {
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
        className="text-lico-gray-2 hover:text-lico-gray-1"
      >
        <FaArrowRightFromBracket />
      </button>
      <h3 className="font-bold text-base text-lico-orange-2">채팅</h3>
      <button
        aria-label="채팅창 설정"
        type="button"
        onClick={onSettingsClick}
        className="rounded-md p-2 text-lico-gray-2 hover:text-lico-gray-1"
      >
        <HiDotsVertical />
      </button>
    </div>
  );
}
