import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poster: ["\"Anton SC\"", "Impact", "Haettenschweiler", "\"Arial Narrow Bold\"", "sans-serif"],
        display: ["Poppins", "sans-serif"],
        body: ["Poppins", "sans-serif"]
      },
      colors: {
        ember: {
          100: "#ffe2d6",
          300: "#ffa47e",
          500: "#ff5f32",
          700: "#d6401a"
        },
        soot: {
          900: "#080808",
          800: "#121212",
          700: "#1d1b1a"
        }
      },
      boxShadow: {
        glow: "0 18px 36px rgba(255, 95, 50, 0.25)"
      }
    }
  },
  plugins: []
} satisfies Config;
