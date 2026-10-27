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
    screens: {
      'xs': '480px',     // Mobile and large phones
      'sm': '640px',     // Standard tablet portrait / large phone
      'md': '768px',     // Tablet landscape / iPad
      'lg': '1024px',    // Small laptops
      'xl': '1280px',    // Standard laptops & desktops
      '2xl': '1536px',   // Large desktop monitors
      '3xl': '1920px',   // Full HD 1080p desktop monitors
      '4xl': '2560px',   // 2K / QHD monitors
      '5xl': '3440px',   // Ultrawide and 4K displays
    },
    extend: {
      colors: {
        brand: {
          primary: '#008CFF',
          hover: '#0070cc',
          navy: '#002B5B',
          accent: '#f59e0b',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#06b6d4',
          dark: '#081621',
          card: '#0d1e2e',
          'card-hover': '#122438',
          border: 'rgba(255, 255, 255, 0.08)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        bangla: ['var(--font-bangla)', '"Hind Siliguri"', 'sans-serif'],
      },
      borderRadius: {
        xl: '18px',
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
