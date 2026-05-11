/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT: '#0a0a0f', 100: '#1d1e2c', 200: '#2d2e3c' },
        accent: { DEFAULT: '#6366f1', light: '#818cf8' },
        cyan: { DEFAULT: '#06b6d4' },
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #6366f1, #06b6d4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
