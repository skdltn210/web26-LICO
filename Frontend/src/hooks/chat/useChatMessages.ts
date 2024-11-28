import { useCallback, useState } from 'react';
import { Message } from '@/types/live';

const MESSAGE_LIMIT = 200;

const updateMessagesWithLimit = (prevMessages: Message[], newMessages: Message[]) => {
  const updatedMessages = [...prevMessages, ...newMessages];
  return updatedMessages.slice(-MESSAGE_LIMIT);
};

function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [showPendingMessages, setShowPendingMessages] = useState(false);

  const addMessages = useCallback((newMessages: Message[]) => {
    setMessages(prev => updateMessagesWithLimit(prev, newMessages));
  }, []);

  const addToPending = useCallback((newMessages: Message[]) => {
    setPendingMessages(prev => [...prev, ...newMessages]);
    setShowPendingMessages(true);
  }, []);

  const applyPendingMessages = useCallback(() => {
    setMessages(prev => updateMessagesWithLimit(prev, pendingMessages));
    setPendingMessages([]);
    setShowPendingMessages(false);
  }, [pendingMessages]);

  return {
    messages,
    pendingMessages,
    showPendingMessages,
    addMessages,
    addToPending,
    applyPendingMessages,
    setMessages,
    setShowPendingMessages,
  };
}

export default useChatMessages;
