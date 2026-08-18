/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stellar: {
          dark: '#0e0f14',
          card: '#161822',
          border: '#272a3c',
          purple: '#6366f1',
          accent: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
}
