import { LuArrowLeftToLine } from 'react-icons/lu';

interface ChatOpenButtonProps {
  onClick: () => void;
}

export default function ChatOpenButton({ onClick }: ChatOpenButtonProps) {
  return (
    <button
      aria-label="채팅창 열기"
      type="button"
      onClick={onClick}
      className="fixed right-2 top-4 z-10 text-lico-gray-1"
    >
      <LuArrowLeftToLine size={20} />
    </button>
  );
}
