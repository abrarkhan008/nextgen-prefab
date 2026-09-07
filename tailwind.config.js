/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        steel: {
          50: "#f4f6f8",
          100: "#e4e9ee",
          200: "#c9d3dc",
          300: "#a2b2c1",
          400: "#748ba1",
          500: "#556e86",
          600: "#44586e",
          700: "#39485b",
          800: "#323e4d",
          900: "#1c242e",
          950: "#12171d",
        },
        safety: {
          500: "#e8580c",
          600: "#c8470a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

