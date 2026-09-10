import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        campus: {
          'primary': '#1e3a8a',
          'primary-content': '#ffffff',
          'secondary': '#475569',
          'secondary-content': '#ffffff',
          'accent': '#d97706',
          'accent-content': '#ffffff',
          'neutral': '#1e293b',
          'neutral-content': '#f8fafc',
          'base-100': '#ffffff',
          'base-200': '#f8fafc',
          'base-300': '#f1f5f9',
          'base-content': '#0f172a',
          'info': '#0284c7',
          'success': '#059669',
          'warning': '#d97706',
          'error': '#dc2626',
        },
      },
      'light',
    ],
  },
};
