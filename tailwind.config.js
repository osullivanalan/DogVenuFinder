/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        cream: { 50: '#fcfcf9', 100: '#fffffe' },
        charcoal: { 700: '#1f2121', 800: '#262828' },
        slate: { 500: '#626c71', 900: '#13343b' },
        teal: {
          300: '#32b8c6', 400: '#2da6b2', 500: '#21808d',
          600: '#1d7480', 700: '#1a6873', 800: '#299fa1',
        },
        brown: { 600: '#5e5240' },
      },
      fontFamily: {
        sans: [
          'FKGroteskNeue', 'Geist', 'Inter', '-apple-system',
          'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif',
        ],
        mono: [
          'Berkeley Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo',
          'Monaco', 'Consolas', 'monospace',
        ],
      },
    },
  },
  plugins: [],
};
