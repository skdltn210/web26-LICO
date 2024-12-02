import { useState, useEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { getConsistentTextColor } from '@utils/chatUtils';
import { chatApi } from '@apis/chat';
import { useAuthStore } from '@store/useAuthStore';
import useLayoutStore from '@store/useLayoutStore';
import ChatHeader from '@components/chat/ChatHeader';
import ChatInput from '@components/chat/ChatInput';
import ChatProfileModal from '@components/chat/ChatProfileModal';
import PendingMessageNotification from '@components/chat/PendingMessageNotification';
import ChatSettingsMenu from '@components/chat/ChatSettingsMenu';
import useChatMessages from '@hooks/chat/useChatMessages';
import useChatScroll from '@hooks/chat/useChatScroll';
import useChatSocket from '@hooks/chat/useChatSocket';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  onAir: boolean;
  id: string;
}

interface SelectedMessage {
  userId: number;
  element: HTMLElement;
}

const CLEAN_BOT_MESSAGE = '클린봇이 삭제한 메세지입니다.';

export default function ChatWindow({ onAir, id }: ChatWindowProps) {
  const [selectedMessage, setSelectedMessage] = useState<SelectedMessage | null>(null);
  const [showChatSettingsMenu, setShowChatSettingsMenu] = useState(false);
  const [cleanBotEnabled, setCleanBotEnabled] = useState(false);
  const [timestampEnabled, setTimestampEnabled] = useState(false);
  const user = useAuthStore(state => state.user);
  const { toggleChat } = useLayoutStore();

  const { socket, isConnected } = useChatSocket(id, onAir);
  const { chatRef, bottomRef, showScrollButton, isScrollPaused, scrollToBottom, setIsScrollPaused } = useChatScroll();
  const {
    messages,
    pendingMessages,
    showPendingMessages,
    addMessages,
    addToPending,
    applyPendingMessages,
    setMessages,
  } = useChatMessages();

  const isLoggedIn = user !== null;

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

  const handleNewMessage = async (content: string) => {
    setIsScrollPaused(false);
    await chatApi.sendChat({ channelId: id, message: content });
  };

  const handlePendingMessageClick = () => {
    applyPendingMessages();
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleCleanBotChange = (enabled: boolean) => {
    setCleanBotEnabled(enabled);

    setMessages(prevMessages => {
      return prevMessages.map(message => {
        if (enabled) {
          if (message.content === CLEAN_BOT_MESSAGE || message.filteringResult) {
            return message;
          }
          return {
            ...message,
            content: CLEAN_BOT_MESSAGE,
            original: message.content,
            filteringResult: false,
          };
        }
        if (message.content !== CLEAN_BOT_MESSAGE) {
          return message;
        }
        return {
          ...message,
          content: message.original ?? CLEAN_BOT_MESSAGE,
          original: undefined,
          filteringResult: false,
        };
      });
    });
  };

  const handleTimestampToggleChange = (enabled: boolean) => {
    setTimestampEnabled(enabled);
  };

  const handlePopupChat = () => {
    window.open(`/chat-popup?channelId=${id}`, '_blank', 'width=400,height=600');
  };

  useEffect((): (() => void) | void => {
    if (!socket || !onAir || !isConnected) return;

    const handleChat = (data: string[]) => {
      const newMessages = data.map(v => JSON.parse(v));
      if (isScrollPaused) {
        addToPending(newMessages);
      } else {
        addMessages(newMessages);
      }
    };

    const handleFilter = (data: Array<{ chatId: string; filteringResult: boolean }>) => {
      const filterData = data[0];
      if (!cleanBotEnabled || filterData.filteringResult) return;

      setMessages(prevMessages => {
        const messageIndex = prevMessages.findIndex(msg => msg.chatId === filterData.chatId);

        if (messageIndex === -1 || prevMessages[messageIndex].content === CLEAN_BOT_MESSAGE) {
          return prevMessages;
        }

        const updatedMessages = [...prevMessages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: CLEAN_BOT_MESSAGE,
          original: updatedMessages[messageIndex].content,
          filteringResult: false,
        };

        return updatedMessages;
      });
    };

    socket.on('chat', handleChat);
    socket.on('filter', handleFilter);

    return () => {
      socket.off('chat', handleChat);
      socket.off('filter', handleFilter);
    };
  }, [socket, onAir, isScrollPaused, addMessages, addToPending, cleanBotEnabled, setMessages, isConnected]);

  useEffect(() => {
    if (isScrollPaused) return;
    scrollToBottom();
  }, [isScrollPaused, messages, scrollToBottom]);

  return (
    <div className="relative flex h-full flex-col border-l border-lico-gray-3 bg-lico-gray-4">
      <ChatHeader onClose={toggleChat} onSettingsClick={() => setShowChatSettingsMenu(!showChatSettingsMenu)} />
      {showChatSettingsMenu && (
        <ChatSettingsMenu
          onClose={() => setShowChatSettingsMenu(false)}
          cleanBotEnabled={cleanBotEnabled}
          onCleanBotChange={handleCleanBotChange}
          timestampEnabled={timestampEnabled}
          onTimestampToggleChange={handleTimestampToggleChange}
          onClickPopupChat={handlePopupChat}
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
                cleanBotEnabled={cleanBotEnabled}
                timestamp={message.timestamp}
                timestampEnabled={timestampEnabled}
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
            onClick={handlePendingMessageClick}
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
