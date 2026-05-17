import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdfbef",
          100: "#faf5d0",
          200: "#f4e99d",
          300: "#ebd862",
          400: "#e1c53a",
          500: "#d0a820",
          600: "#b48217",
          700: "#8f5f15",
          800: "#764c18",
          900: "#643f1a",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
