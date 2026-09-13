/** @type {import('tailwindcss').Config} */
// NOTE: This project uses Tailwind CSS v4. Configuration is done via @theme in app/globals.css.
// This file is kept for reference. Tailwind v4 does not use tailwind.config.js.
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e8642a',
        'sole-dark': '#171717',
        'sole-gray': '#f5f5f5',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
