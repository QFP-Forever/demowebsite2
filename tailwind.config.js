/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideIn: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-30px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        gradient: {
          '0%': {
            backgroundPosition: '0% 50%'
          },
          '50%': {
            backgroundPosition: '100% 50%'
          },
          '100%': {
            backgroundPosition: '0% 50%'
          }
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'fade-in-up-1': 'fadeInUp 0.6s ease forwards 0.2s',
        'fade-in-up-2': 'fadeInUp 0.6s ease forwards 0.4s',
        'fade-in-up-3': 'fadeInUp 0.6s ease forwards 0.6s',
        'fade-in-up-4': 'fadeInUp 0.6s ease forwards 0.8s',
        'slide-in': 'slideIn 0.6s ease-out forwards',
        'gradient': 'gradient 8s ease infinite'
      }
    },
  },
  safelist: [
    'animate-fade-up',
    'animate-fade-in-up',
    'animate-fade-in-up-1',
    'animate-fade-in-up-2',
    'animate-fade-in-up-3',
    'animate-fade-in-up-4',
    'animate-slide-in',
    'animate-gradient'
  ],
  plugins: [],
};