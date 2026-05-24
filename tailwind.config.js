/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#fdfaf5',
          100: '#faf3e8',
          200: '#f5e6cf',
        },
        terracotta: {
          400: '#e07a5f',
          500: '#c96a4f',
          600: '#b05a42',
        },
        forest: {
          400: '#5c8a6e',
          500: '#4a7a5c',
          600: '#3a6a4c',
        },
        charcoal: {
          700: '#3d3530',
          800: '#2d2520',
          900: '#1e1a16',
        },
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(30,26,22,0.08), 0 1px 2px 0 rgba(30,26,22,0.04)',
        'card-hover': '0 8px 24px 0 rgba(30,26,22,0.12), 0 2px 8px 0 rgba(30,26,22,0.06)',
      },
    },
  },
  plugins: [],
}
