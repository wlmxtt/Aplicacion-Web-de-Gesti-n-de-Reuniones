/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ugma: {
          blue: '#0056b3',
          dark: '#003d80',
          light: '#e6f0ff',
        }
      }
    },
  },
  plugins: [],
}
