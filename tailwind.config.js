/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse-slow 10s infinite ease-in-out',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1) translate(0, 0)' },
          '50%': { opacity: '0.5', transform: 'scale(1.1) translate(10px, -10px)' },
        },
      },
    },
  },
  plugins: [],
};

