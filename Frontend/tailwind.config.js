/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bold: ['Pretendard-Bold', 'sans-serif'],
        medium: ['Pretendard-Medium', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
