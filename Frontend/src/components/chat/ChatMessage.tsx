interface ChatMessageProps {
  userId: number;
  content: string;
  nickname: string;
  timestamp?: string;
  color?: string;
  onUserClick: (userId: number, element: HTMLElement) => void;
  filteringResult: boolean;
  cleanBotEnabled: boolean;
}

export default function ChatMessage({
  userId,
  content,
  nickname,
  timestamp = '',
  color = 'text-lico-orange-2',
  onUserClick,
  filteringResult,
  cleanBotEnabled,
}: ChatMessageProps) {
  return (
    <button
      type="button"
      className="z-20 rounded-3xl p-1.5 hover:bg-lico-gray-3"
      onClick={e => onUserClick(userId, e.currentTarget)}
    >
      <div className="flex gap-1.5 px-1">
        {timestamp && <span className="font-medium text-xs text-lico-gray-2">{timestamp}</span>}
        <span className={`max-w-40 truncate whitespace-nowrap font-bold text-base ${color}`}>{nickname}</span>
        <p
          className={`whitespace-normal break-all text-left font-medium text-sm leading-relaxed ${!filteringResult && cleanBotEnabled ? 'text-lico-gray-2' : 'text-lico-gray-1'}`}
        >
          {content}
        </p>
      </div>
    </button>
  );
}
