import { useState, useEffect, useRef } from 'react';
import mockMessages, { Message } from '@mocks/mockMessages.ts';
import { FaAngleDown } from 'react-icons/fa';
import ChatHeader from '@components/chat/ChatHeader';
import ChatInput from '@components/chat/ChatInput';
import useLayoutStore from '@store/useLayoutStore';
import { getConsistentTextColor, createTestChatMessage } from './utils';
import ChatMessage from './ChatMessage';

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toggleChat } = useLayoutStore();

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
        rootMargin: '-14px',
      },
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showScrollButton]);

  const handleNewMessage = (content: string) => {
    // 임시로 입력값을 추가합니다. 서버에 연결 후 삭제합니다.
    setMessages(prev => [...prev, createTestChatMessage(content)]);
    scrollToBottom();
  };

  return (
    <div className="relative flex h-full flex-col border-l border-lico-gray-3 bg-lico-gray-4">
      <ChatHeader onClose={toggleChat} onSettingsClick={() => {}} />
      <div
        role="log"
        aria-label="채팅 메시지"
        aria-live="polite"
        ref={chatRef}
        className="scrollbar-hide h-screen overflow-auto p-4"
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
      </div>
      <div className="relative">
        {showScrollButton && (
          <button
            aria-label="최신 메시지로 이동"
            type="button"
            onClick={scrollToBottom}
            className="absolute -top-10 right-4 rounded-full bg-lico-orange-2 p-2 text-sm text-lico-gray-1 opacity-75 shadow-lg hover:bg-lico-orange-1"
          >
            <FaAngleDown />
          </button>
        )}
        <ChatInput onSubmit={handleNewMessage} />
      </div>
    </div>
  );
}
