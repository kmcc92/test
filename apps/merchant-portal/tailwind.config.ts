import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          400: "#e1c53a",
          500: "#d0a820",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
