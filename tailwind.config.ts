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
        background: "#03060B",
        surface: "#050B16",
        surfaceLight: "#0B1727",
        surfaceBorder: "#1D5E91",
        deepSpaceBlack: "#03060B",
        midnightNavy: "#050B16",
        darkBlue: "#0B1727",
        atmosphericBlue: "#1D5E91",
        iceBlue: "#79C9F2",
        metallicSilver: "#C7D3DF",
        starlightWhite: "#F2F7FC",
        amberAccent: "#E9B96D",
        // Legacy palette mappings for seamless cosmic transition
        matteBlack: "#03060B",
        deepBlackBrown: "#050B16",
        blackBronze: "#0B1727",
        darkBronze: "#0B1727",
        warmBrownGold: "#1D5E91",
        darkGold: "#1D5E91",
        champagneGold: "#79C9F2",
        metallicGold: "#C7D3DF",
        warmIvory: "#F2F7FC",
        athlos: {
          gold: "#C7D3DF",
          goldLight: "#F2F7FC",
          goldDark: "#79C9F2",
          bronze: "#0B1727",
          brown: "#1D5E91",
          cosmicBlue: "#1D5E91",
          iceBlue: "#79C9F2",
          silver: "#C7D3DF",
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