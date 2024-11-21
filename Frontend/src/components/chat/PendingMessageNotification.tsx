import { useEffect, useState } from 'react';
import { getConsistentTextColor } from '@utils/chatUtils.ts';

interface Message {
  nickname: string;
  content: string;
}

interface PendingMessageNotificationProps {
  pendingMessages: Message[];
}

export default function PendingMessageNotification({ pendingMessages }: PendingMessageNotificationProps) {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);

  useEffect(() => {
    console.log('111', pendingMessages);
    if (pendingMessages?.length > 0) {
      setCurrentMessage(pendingMessages[pendingMessages.length - 1]);
    }
  }, [pendingMessages]);

  if (!currentMessage) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border-2 border-lico-orange-2 bg-lico-gray-4 px-4 py-3">
      <span className={`font-bold text-sm ${getConsistentTextColor(currentMessage.nickname)}`}>
        {currentMessage.nickname}
      </span>
      <p className="truncate font-bold text-sm text-lico-gray-1">{currentMessage.content}</p>
    </div>
  );
}
