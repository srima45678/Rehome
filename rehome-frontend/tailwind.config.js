/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B4513",    // brown color (furniture theme)
        secondary: "#F5F0E8",  // cream color (background)
        accent: "#D2691E",     // chocolate brown (buttons)
      }
    },
  },
  plugins: [],
}