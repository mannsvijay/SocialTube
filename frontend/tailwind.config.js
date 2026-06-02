/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:  '#0F0F0F',
          secondary:'#1A1A1A',
          elevated: '#242424',
        },
        border: {
          DEFAULT: '#2E2E2E',
          light:   '#3A3A3A',
        },
        text: {
          primary:   '#F1F1F1',
          secondary: '#AAAAAA',
          muted:     '#717171',
        },
        accent: {
          DEFAULT: '#7C3AED',
          light:   '#A78BFA',
          hover:   '#6D28D9',
        },
        success: '#22C55E',
        error:   '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}