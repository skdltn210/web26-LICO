import { useEffect, useState } from 'react';
import ChatWindow from '@components/chat/ChatWindow';

export default function ChatPopupPage() {
  const [channelId, setChannelId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('channelId');
    setChannelId(id);
  }, []);

  if (!channelId) return null;

  return (
    <div className="h-screen w-screen">
      <ChatWindow id={channelId} onAir />
    </div>
  );
}
