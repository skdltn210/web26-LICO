import { TAILWIND_USER_COLORS } from './constants';

// 텍스트의 각 문자 코드 합을 기반으로 일관된 테일윈드 스타일 색상을 반환하는 함수
export const getConsistentTextColor = (text: string): (typeof TAILWIND_USER_COLORS)[number] =>
  TAILWIND_USER_COLORS[[...text].reduce((acc, char) => acc + char.charCodeAt(0), 0) % TAILWIND_USER_COLORS.length];

export const createTestChatMessage = (content: string) => {
  return {
    id: Date.now().toString(),
    userName: 'ME',
    content,
    timestamp: '',
  };
};
