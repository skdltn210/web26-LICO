interface ChatMessageProps {
  id: number;
  content: string;
  nickname: string;
  timestamp?: string;
  color?: string;
  onUserClick: (userId: number, element: HTMLElement) => void;
}

export default function ChatMessage({
  id,
  content,
  nickname,
  timestamp = '',
  color = 'text-lico-orange-2',
  onUserClick,
}: ChatMessageProps) {
  return (
    <button
      type="button"
      className="z-20 rounded-3xl p-1.5 hover:bg-lico-gray-3"
      onClick={e => onUserClick(id, e.currentTarget)}
    >
      <div className="flex gap-1.5 px-1">
        {timestamp && <span className="font-medium text-xs text-lico-gray-2">{timestamp}</span>}
        <span className={`max-w-40 truncate whitespace-nowrap font-bold text-base ${color}`}>{nickname}</span>
        <p className="flex items-center break-all text-start font-medium text-sm text-lico-gray-1">{content}</p>
      </div>
    </button>
  );
}
