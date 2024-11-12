interface ChatMessageProps {
  content: string;
  userName: string;
  timestamp?: string;
  color?: string;
}

export default function ChatMessage({
  content,
  userName,
  timestamp = '',
  color = 'text-lico-orange-2',
}: ChatMessageProps) {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {timestamp && <span className="font-medium text-xs text-lico-gray-2">{timestamp}</span>}
      <span className={`font-bold text-base ${color}`}>{userName}</span>
      <p className="break-all font-medium text-sm text-lico-gray-1">{content}</p>
    </div>
  );
}
