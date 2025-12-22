/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf3e6',
          300: '#f5e8d3',
          400: '#e8d4b4',
          500: '#d4b896',
        },
        torah: {
          gold: '#c9a227',
          brown: '#5c4033',
          navy: '#1a365d',
        }
      },
      fontFamily: {
        hebrew: ['Frank Ruhl Libre', 'David Libre', 'serif'],
        english: ['Merriweather', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
