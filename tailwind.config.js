/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#008CFF',
          hover: '#0075d6',
          navy: '#002B5B',
          accent: '#f59e0b',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#06b6d4',
          dark: '#090d16',
          card: '#0f172a',
          'card-hover': '#162038',
          border: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        bangla: ['"Hind Siliguri"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
        sm: '6px',
      },
      boxShadow: {
        card: '0 4px 12px -1px rgba(0, 0, 0, 0.6), 0 2px 6px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 15px rgba(0, 140, 255, 0.35)',
      },
    },
  },
  plugins: [],
};
