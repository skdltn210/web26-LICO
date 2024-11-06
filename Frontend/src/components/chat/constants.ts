export const TAILWIND_USER_COLORS = [
  'text-rose-500', // 붉은색
  'text-orange-500', // 주황색
  'text-amber-500', // 황색
  'text-lime-500', // 라임색
  'text-emerald-500', // 에메랄드색
  'text-cyan-500', // 시안색
  'text-blue-500', // 파란색
  'text-violet-500', // 보라색
  'text-purple-500', // 자주색
  'text-pink-500', // 분홍색
] as const;

export const CHAT_INPUT_TEXTAREA_CLASSES = {
  base: 'flex-1 resize-none rounded-md border border-lico-gray-3 px-2 py-1 font-medium text-sm text-lico-gray-1',
  focus: 'focus:border-transparent focus:bg-lico-gray-4 focus:outline-none focus:ring-2 focus:ring-lico-orange-2',
  active: 'border-transparent bg-lico-gray-4 outline-none ring-2 ring-lico-orange-2',
} as const;

export const CHAT_INPUT_MAX_ROWS = 5;
export const CHAT_INPUT_LINE_HEIGHT = 20;
