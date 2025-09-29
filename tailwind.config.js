/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'body': ['Montserrat', 'sans-serif'],
        'heading': ['Cormorant Garamond', 'serif'],
        'elegant': ['Dancing Script', 'cursive'],
      },
      colors: {
        primary: {
          DEFAULT: '#b27b1c',
          light: '#96230e',
        },
        secondary: '#2c2c2c',
        accent: '#f8f2f5',
        gold: '#d4af37',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'pulse-subtle': 'pulse 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'bounce-smooth': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
};