/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif TC"', 'serif'],
        sans: ['"Noto Sans TC"', 'sans-serif'],
      },
      colors: {
        temple: {
          red: '#cc2222',
          'red-light': '#e63333',
          'red-dark': '#a01a1a',
          gold: '#d4a017',
          'gold-light': '#e8b92d',
        },
        admin: {
          dark: '#1f1a18',
          'dark-light': '#2a2220',
          'dark-lighter': '#3d302c',
          sidebar: '#421818',
          'sidebar-light': '#552222',
          'sidebar-border': '#663030',
        },
        'temple-gold-dark': '#b38a10',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
