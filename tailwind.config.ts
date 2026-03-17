import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config & { daisyui: { themes: string[] } } = {
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
          100: "#f3e8ff",
          300: "#d8b4fe",
          500: "#a855f7",
          700: "#9333ea"
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
  plugins: [daisyui],
  daisyui: {
    themes: ["night --default"]
  }
};

export default config;
