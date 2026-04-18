/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'brand':    '0 4px 24px -4px rgb(37 99 235 / 0.25)',
      },
      transitionDuration: {
        '400': '400ms',
      },
      animation: {
        'bounce-slow': 'bounce 3s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}