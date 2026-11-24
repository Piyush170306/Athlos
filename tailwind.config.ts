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
        background: "#080706",
        surface: "#100D09",
        surfaceLight: "#21180F",
        surfaceBorder: "#49351E",
        matteBlack: "#080706",
        deepBlackBrown: "#100D09",
        blackBronze: "#21180F",
        darkBronze: "#21180F",
        warmBrownGold: "#49351E",
        darkGold: "#49351E",
        champagneGold: "#C6A45A",
        metallicGold: "#E3C276",
        warmIvory: "#F5EBD4",
        athlos: {
          gold: "#E3C276",
          goldLight: "#F5EBD4",
          goldDark: "#C6A45A",
          bronze: "#21180F",
          brown: "#49351E",
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