import { useState, useEffect, useRef } from 'react';
import mockMessages, { Message } from '@mocks/mockMessages.ts';
import { FaAngleDown } from 'react-icons/fa';
import ChatHeader from '@components/chat/ChatHeader';
import ChatInput from '@components/chat/ChatInput';
import { getConsistentTextColor, createTestChatMessage } from './utils';
import ChatMessage from './ChatMessage';

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isScrolled = !entry.isIntersecting;
        setShowScrollButton(isScrolled);
      },
      {
        root: chatRef.current,
        threshold: 1,
        rootMargin: '-16px',
      },
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [isExpanded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showScrollButton, isExpanded]);

  const handleNewMessage = (content: string) => {
    // 임시로 입력값을 추가합니다. 서버에 연결 후 삭제합니다.
    setMessages(prev => [...prev, createTestChatMessage(content)]);
    scrollToBottom();
  };

  // 임시 버튼 입니다. livePage에 채팅창 추가 후 삭제합니다.
  if (!isExpanded) {
    return (
      <button type="button" onClick={() => setIsExpanded(true)} className="text-lico-gray-1">
        열어
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 w-80">
      <div className="flex h-screen flex-col border-l border-lico-gray-3 bg-lico-gray-4">
        <ChatHeader onClose={() => setIsExpanded(false)} onSettingsClick={() => {}} />
        <div
          role="log"
          aria-label="채팅 메시지"
          aria-live="polite"
          ref={chatRef}
          className="h-screen overflow-auto p-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="flex break-after-all flex-col gap-2.5">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                userName={message.userName}
                content={message.content}
                color={getConsistentTextColor(message.userName)}
              />
            ))}
          </div>
          <div ref={bottomRef} />
          {showScrollButton && (
            <button
              aria-label="최신 메시지로 이동"
              type="button"
              onClick={scrollToBottom}
              className="fixed bottom-24 right-8 rounded-full bg-lico-orange-2 p-2 text-sm text-lico-gray-1 opacity-75 shadow-lg hover:bg-lico-orange-1"
            >
              <FaAngleDown />
            </button>
          )}
        </div>
        <ChatInput onSubmit={handleNewMessage} />
      </div>
    </div>
  );
}
