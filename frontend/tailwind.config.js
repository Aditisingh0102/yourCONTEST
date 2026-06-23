/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: '#002F6C',
        brandOrange: '#FF6B35',
      }
    },
  },
  plugins: [],
}
