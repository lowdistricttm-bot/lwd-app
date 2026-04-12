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
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#18181b",
          foreground: "#ffffff",
        },
        zinc: {
          950: "#09090b",
          900: "#18181b",
          800: "#27272a",
        }
      },
      borderRadius: {
        none: "0",
        sm: "2px",
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