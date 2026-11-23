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
        background: "#080808",
        surface: "#11100D",
        surfaceLight: "#17140E",
        surfaceBorder: "#302719",
        matteBlack: "#080808",
        blackBronze: "#17140E",
        darkGold: "#302719",
        champagneGold: "#C6A45A",
        metallicGold: "#E6CA83",
        warmIvory: "#F5EBD4",
        athlos: {
          gold: "#E6CA83",
          goldLight: "#F5EBD4",
          goldDark: "#C6A45A",
          bronze: "#17140E",
        },
        batch: {
          ipm06: {
            DEFAULT: "#CBD5E1",
            light: "#F1F5F9",
            dark: "#64748B",
            glow: "rgba(203, 213, 225, 0.35)",
          },
          ipm07: {
            DEFAULT: "#EF4444",
            light: "#F87171",
            dark: "#B91C1C",
            glow: "rgba(239, 68, 68, 0.35)",
          },
          ipm08: {
            DEFAULT: "#3B82F6",
            light: "#60A5FA",
            dark: "#1D4ED8",
            glow: "rgba(59, 130, 246, 0.35)",
          },
        },
      },
      fontFamily: {
        spartan: ["League Spartan", "sans-serif"],
        seasons: ["The Seasons", "Playfair Display", "Cinzel", "serif"],
        manrope: ["Manrope", "Inter", "system-ui", "sans-serif"],
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-gold": "0 0 25px rgba(230, 202, 131, 0.25)",
        "glow-champagne": "0 0 25px rgba(198, 164, 90, 0.2)",
        "glow-subtle": "0 8px 32px 0 rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;