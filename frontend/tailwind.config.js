/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.dark'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: 'rgb(var(--primary-bg) / <alpha-value>)',
          dark: 'rgb(var(--primary-dark) / <alpha-value>)',
          purple: 'rgb(var(--primary-purple) / <alpha-value>)',
        },
        accent: {
          gold: 'rgb(var(--accent-gold) / <alpha-value>)',
          lavender: 'rgb(var(--accent-lavender) / <alpha-value>)',
        },
        neutral: {
          light: 'rgb(var(--neutral-light) / <alpha-value>)',
          white: 'rgb(var(--neutral-white) / <alpha-value>)',
          gray: 'rgb(var(--neutral-gray) / <alpha-value>)',
          text: 'rgb(var(--neutral-text) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
