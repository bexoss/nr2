/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f5',
          100: '#ffe4ee',
          200: '#ffbfd4',
          300: '#ff99ba',
          400: '#ff6da1',
          500: '#ff4a8d',
          600: '#e03174',
          700: '#c2255f',
          800: '#a61e4f',
          900: '#80173c',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Noto Sans KR',
          'Apple SD Gothic Neo',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
};

