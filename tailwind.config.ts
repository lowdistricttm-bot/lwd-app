import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#007AFF", // iOS System Blue
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1c1c1e", // iOS Dark Secondary
          foreground: "#ffffff",
        },
        zinc: {
          950: "#000000",
          900: "#1c1c1e",
          800: "#2c2c2e",
          700: "#3a3a3c",
          600: "#48484a",
          500: "#636366",
          400: "#8e8e93",
        }
      },
      borderRadius: {
        none: "0",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      letterSpacing: {
        tighter: "-0.05em",
        widest: "0.25em",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;