/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT: '#08080d', 100: '#111118', 200: '#1a1a24', 300: '#2a2a3a' },
        amber: { DEFAULT: '#ffb74d', dark: '#f59e0b', deep: '#e67e22', light: '#fef3c7', glow: 'rgba(255,183,77,0.15)' },
        warm: { DEFAULT: '#fef3c7', muted: '#d4a574' },
      },
      backgroundImage: {
        'gradient-amber': 'linear-gradient(135deg, #ffb74d, #e67e22)',
        'gradient-warm': 'linear-gradient(135deg, #ffb74d, #f59e0b)',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
