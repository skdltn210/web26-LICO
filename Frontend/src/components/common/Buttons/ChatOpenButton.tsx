import { LuArrowLeftToLine } from 'react-icons/lu';

interface ChatOpenButtonProps {
  onClick: () => void;
  className?: string;
}

export default function ChatOpenButton({ onClick, className = 'text-lico-gray-1' }: ChatOpenButtonProps) {
  return (
    <button
      aria-label="채팅창 열기"
      type="button"
      onClick={onClick}
      className={`fixed right-2 top-4 z-10 ${className}`}
    >
      <LuArrowLeftToLine size={20} />
    </button>
  );
}
