/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bold: ['Pretendard-Bold', 'sans-serif'],
        medium: ['Pretendard-Medium', 'sans-serif'],
      },
      colors: {
        lico: {
          'gray-1': '#E0E0E0', // light-gray
          'gray-2': '#B0B0B0', // mid-gray
          'gray-3': '#3D3D3D', // gray
          'gray-4': '#2D2D2D', // medium-gray
          'gray-5': '#1E1E1E', // dark-gray
          'orange-1': '#FF9F1C', // light-orange
          'orange-2': '#FF6B35', // orange
          'teal-1': '#00332A', // dark-teal
          'teal-2': '#00332A', // darker teal
        },
      },
      screens: {
        'cards-4': '1328px', // 4x320px + 3x16px = 1328px
        'cards-5': '1664px', // 5x320px + 4x16px = 1664px
        'cards-6': '2000px', // 6x320px + 5x16px = 2000px
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
