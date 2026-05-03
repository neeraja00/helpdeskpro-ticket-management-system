/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          400: 'var(--theme-400, #818cf8)',
          500: 'var(--theme-500, #6366f1)',
          600: 'var(--theme-600, #4f46e5)',
        }
      },
    },
  },
  plugins: [],
}
