import { useState, useEffect, useRef, useCallback } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import ChatHeader from '@components/chat/ChatHeader';
import ChatInput from '@components/chat/ChatInput';
import useLayoutStore from '@store/useLayoutStore';
import { getConsistentTextColor } from '@utils/chatUtils';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@store/useAuthStore';
import { config } from '@config/env';
import ChatProfileModal from '@components/chat/ChatProfileModal';
import PendingMessageNotification from '@components/chat/PendingMessageNotification';
import { chatApi } from '@apis/chat.ts';
import ChatSettingsMenu from '@components/chat/ChatSettingsMenu';
import type { Message } from '@/types/live';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  onAir: boolean;
  id: string;
}

interface SelectedMessage {
  userId: number;
  element: HTMLElement;
}

const MESSAGE_LIMIT = 200;

const updateMessagesWithLimit = (prevMessages: Message[], newMessages: Message[]) => {
  const updatedMessages = [...prevMessages, ...newMessages];
  return updatedMessages.slice(-MESSAGE_LIMIT);
};

export default function ChatWindow({ onAir, id }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SelectedMessage | null>(null);
  const [isScrollPaused, setIsScrollPaused] = useState(false);
  const [showChatSettingsMenu, setShowChatSettingsMenu] = useState(false);
  const [cleanBotEnabled, setCleanBotEnabled] = useState(false);
  const [showPendingMessages, setShowPendingMessages] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore(state => state.accessToken);
  const { toggleChat } = useLayoutStore();

  const isLoggedIn = accessToken !== null;

  const scrollToBottom = () => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  const handleNewMessage = async (content: string) => {
    setIsScrollPaused(false);
    await chatApi.sendChat({ channelId: id, message: content });
  };

  const handleUserClick = (userId: number, messageElement: HTMLElement) => {
    if (selectedMessage?.userId === userId) {
      setSelectedMessage(null);
      return;
    }
    setSelectedMessage({ userId, element: messageElement });
  };

  const handleModalClose = () => {
    setSelectedMessage(null);
  };

  const handlePendingMessageNotification = () => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, ...pendingMessages];
      return updatedMessages.slice(-MESSAGE_LIMIT);
    });
    setPendingMessages([]);
    setShowPendingMessages(false);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleCleanBotChange = (enabled: boolean) => {
    setCleanBotEnabled(enabled);
  };

  const chatHandler = useCallback(
    (data: string[]) => {
      const newMessages = data
        .map(v => JSON.parse(v))
        .map(msg => ({
          ...msg,
          content: msg.filteringResult ? msg.content : '클린봇이 삭제한 메세지입니다.',
        }));

      if (isScrollPaused) {
        setShowPendingMessages(true);
        setPendingMessages(prev => [...prev, ...newMessages]);
      } else {
        setMessages(prevMessages => updateMessagesWithLimit(prevMessages, newMessages));
      }
    },
    [isScrollPaused],
  );

  useEffect(() => {
    if (isScrollPaused) return;

    scrollToBottom();
  }, [isScrollPaused, messages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isScrolled = !entry.isIntersecting;
        setShowScrollButton(isScrolled);
        setIsScrollPaused(isScrolled);
        if (!isScrolled && pendingMessages.length > 0) {
          setMessages(prevMessages => updateMessagesWithLimit(prevMessages, pendingMessages));
          setPendingMessages([]);
          setShowPendingMessages(false);
        }
      },
      {
        root: chatRef.current,
        threshold: 1,
        rootMargin: '100px',
      },
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [pendingMessages]);

  useEffect(() => {
    if (!onAir) return undefined;
    if (socketRef.current?.connected) return undefined;

    const socket = io(`${config.chatUrl}`, {
      transports: ['websocket'],
    });

    socket.emit('join', { channelId: id });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
      socketRef.current = null;
    };
  }, [onAir, id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    socket.off('chat').on('chat', chatHandler);

    const handleFilter = (data: { chatId: string; filteringResult: boolean }[]) => {
      const filteredMessage = data[0];
      if (!cleanBotEnabled || filteredMessage.filteringResult) return;

      setMessages(prevMessages => {
        const messageIndex = prevMessages.findIndex(msg => msg.chatId === filteredMessage.chatId);

        if (messageIndex === -1 || prevMessages[messageIndex].content === '클린봇이 삭제한 메세지입니다.') {
          return prevMessages;
        }

        const updatedMessages = [...prevMessages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: '클린봇이 삭제한 메세지입니다.',
          filteringResult: false,
        };
        return updatedMessages;
      });
    };

    socket.off('filter').on('filter', handleFilter);

    return () => {
      socket.off('chat');
      socket.off('filter');
    };
  }, [chatHandler, cleanBotEnabled]);

  return (
    <div className="relative flex h-full flex-col border-l border-lico-gray-3 bg-lico-gray-4">
      <ChatHeader onClose={toggleChat} onSettingsClick={() => setShowChatSettingsMenu(!showChatSettingsMenu)} />
      {showChatSettingsMenu && (
        <ChatSettingsMenu
          onClose={() => setShowChatSettingsMenu(false)}
          cleanBotEnabled={cleanBotEnabled}
          onCleanBotChange={handleCleanBotChange}
        />
      )}
      <div
        role="log"
        aria-label="채팅 메시지"
        aria-live="polite"
        ref={chatRef}
        className="h-screen overflow-auto p-3 scrollbar-hide"
      >
        {onAir ? (
          <div className="flex break-after-all flex-col">
            {messages?.map(message => (
              <ChatMessage
                key={message.chatId}
                userId={message.userId}
                nickname={message.nickname}
                content={message.content}
                color={getConsistentTextColor(message.nickname)}
                filteringResult={message.filteringResult}
                onUserClick={(userId, element) => handleUserClick(userId, element)}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center font-bold text-xl text-lico-gray-1">
            오프라인 입니다.
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {selectedMessage && (
        <ChatProfileModal
          userId={selectedMessage.userId}
          anchorEl={selectedMessage.element}
          onClose={handleModalClose}
        />
      )}

      <div className="relative">
        {showPendingMessages && (
          <button
            type="button"
            onClick={handlePendingMessageNotification}
            className="absolute -top-24 z-40 mt-6 w-full p-4 opacity-90"
          >
            <PendingMessageNotification pendingMessages={pendingMessages} />
          </button>
        )}
        {!showPendingMessages && showScrollButton && (
          <button
            aria-label="최신 메시지로 이동"
            type="button"
            onClick={scrollToBottom}
            className="absolute -top-12 right-6 z-50 rounded-full bg-lico-orange-2 p-2 text-xl text-lico-gray-1 opacity-90 shadow-lg hover:bg-lico-orange-1"
          >
            <FaAngleDown />
          </button>
        )}
        <ChatInput onSubmit={handleNewMessage} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
