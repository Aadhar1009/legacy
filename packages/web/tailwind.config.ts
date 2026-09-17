import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          900: '#312e81',
          DEFAULT: '#4f46e5',
        },
        accent: {
          DEFAULT: '#f59e0b',
        },
        success: {
          DEFAULT: '#10b981',
        },
        warning: {
          DEFAULT: '#f59e0b',
        },
        error: {
          DEFAULT: '#f43f5e',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          900: '#0f172a',
          DEFAULT: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
