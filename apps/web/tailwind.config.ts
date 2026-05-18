/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF2F8',
          100: '#D5DFEE',
          200: '#A8BADA',
          300: '#7A96C6',
          400: '#4E72B2',
          500: '#2A52A0',
          600: '#1A3E85',
          700: '#132E6A',
          800: '#0D2050',
          900: '#091638',
          950: '#060E24',
        },
        teal: {
          50: '#EDFAF8',
          100: '#D0F3EE',
          200: '#A0E5DC',
          300: '#67D3C6',
          400: '#33BDB0',
          500: '#18A79B',
          600: '#0F8B80',
          700: '#0C6E65',
          800: '#0A524C',
          900: '#083A35',
        },
        sand: {
          50: '#FDFBF7',
          100: '#F8F4EC',
          200: '#F0E8D5',
          300: '#E5D8BA',
          400: '#D6C49A',
          500: '#C3AE78',
          600: '#A8935A',
          700: '#8A7645',
          800: '#6B5B34',
          900: '#4E4225',
        },
        amber: {
          300: '#F5D78A',
          400: '#EAC36C',
          500: '#D4A84B',
          600: '#B88C32',
          700: '#9A7225',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.22s cubic-bezier(0.16,1,0.3,1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateX(-50%) translateY(-18px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};