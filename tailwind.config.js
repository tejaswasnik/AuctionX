/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyan:    '#00F5FF',
        purple:  '#A78BFA',
        green:   '#34D399',
        amber:   '#FCD34D',
        red:     '#FF6B6B',
        surface: 'rgba(255,255,255,0.03)',
        bg:      '#050A14',
      },
    },
  },
  plugins: [],
}
