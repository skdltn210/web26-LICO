import { useCallback, useEffect, useRef, useState } from 'react';

function useChatScroll() {
  const chatRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrollPaused, setIsScrollPaused] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isScrolled = !entry.isIntersecting;
        setShowScrollButton(isScrolled);
        setIsScrollPaused(isScrolled);
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
  }, []);

  return {
    chatRef,
    bottomRef,
    showScrollButton,
    isScrollPaused,
    scrollToBottom,
    setIsScrollPaused,
  };
}

export default useChatScroll;
