import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0f1626",
        surfaceLight: "#182238",
        surfaceBorder: "#243250",
        athlos: {
          gold: "#f59e0b",
          goldLight: "#fcd34d",
          cyan: "#06b6d4",
          blue: "#3b82f6",
        },
        batch: {
          ipm06: {
            DEFAULT: "#10b981",
            light: "#34d399",
            dark: "#047857",
            glow: "rgba(16, 185, 129, 0.35)",
          },
          ipm07: {
            DEFAULT: "#f97316",
            light: "#fb923c",
            dark: "#c2410c",
            glow: "rgba(249, 115, 22, 0.35)",
          },
          ipm08: {
            DEFAULT: "#eab308",
            light: "#facc15",
            dark: "#a16207",
            glow: "rgba(234, 179, 8, 0.35)",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Rajdhani", "Chakra Petch", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-gold": "0 0 25px rgba(245, 158, 11, 0.25)",
        "glow-cyan": "0 0 25px rgba(6, 182, 212, 0.25)",
        "glow-green": "0 0 25px rgba(16, 185, 129, 0.25)",
        "glow-orange": "0 0 25px rgba(249, 115, 22, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
