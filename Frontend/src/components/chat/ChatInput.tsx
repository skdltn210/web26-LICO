import React, { useState, useRef } from 'react';
import { LuSend } from 'react-icons/lu';
import { CHAT_INPUT_TEXTAREA_CLASSES, CHAT_INPUT_LINE_HEIGHT, CHAT_INPUT_MAX_ROWS } from '@constants/chat/input';

type ChatInputProps = {
  onSubmit: (message: string) => void;
  isLoggedIn: boolean;
};

export default function ChatInput({ onSubmit, isLoggedIn = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    if (isLoggedIn) return;
    setShowLoginAlert(true);
  };

  const handleBlur = () => {
    setShowLoginAlert(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedMessage = message.trim().replace(/\n/g, ' ');
    if (!trimmedMessage) return;

    onSubmit(trimmedMessage);
    setMessage('');
    setRows(1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key !== 'Enter') return;

    event.preventDefault();
    if (!event.shiftKey) {
      handleSubmit(event);
      return;
    }

    if (rows < CHAT_INPUT_MAX_ROWS) {
      setMessage(prev => `${prev}\n`);
      setRows(prev => Math.min(prev + 1, CHAT_INPUT_MAX_ROWS));
    }
  };

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, scrollHeight } = event.target;
    setMessage(value);
    const currentRows = Math.min(Math.floor(scrollHeight / CHAT_INPUT_LINE_HEIGHT), CHAT_INPUT_MAX_ROWS);
    setRows(currentRows);
  };

  return (
    <div className="border-t border-lico-gray-3 px-4 py-2">
      <form aria-label="메시지 입력" className="relative flex flex-col" onSubmit={handleSubmit}>
        {showLoginAlert && (
          <div className="absolute bottom-20 w-full rounded-xl border-2 border-lico-gray-4 bg-lico-gray-5 p-4 font-bold text-lico-orange-2">
            <p>
              채팅을 시작하기 전에 로그인이 필요합니다.
              <br /> 로그인 후 이용해 주세요.
            </p>
          </div>
        )}
        <textarea
          aria-label="채팅 메시지 입력"
          aria-multiline="true"
          value={message}
          rows={rows}
          maxLength={200}
          onChange={handleTextAreaChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={!isLoggedIn}
          ref={textareaRef}
          placeholder="채팅을 입력해주세요"
          spellCheck={false}
          className={`${CHAT_INPUT_TEXTAREA_CLASSES.base} scrollbar-hide ${CHAT_INPUT_TEXTAREA_CLASSES.focus} ${message ? CHAT_INPUT_TEXTAREA_CLASSES.active : 'bg-lico-gray-5'}`}
        />
        <div className="mt-2 flex justify-end">
          <button
            aria-label="메시지 보내기"
            type="submit"
            className="rounded-md bg-lico-orange-2 p-2 text-lico-gray-4 hover:bg-lico-orange-1 focus:ring-2 focus:ring-lico-orange-2 focus:ring-opacity-50"
          >
            <LuSend size={12} />
          </button>
        </div>
      </form>
    </div>
  );
}
