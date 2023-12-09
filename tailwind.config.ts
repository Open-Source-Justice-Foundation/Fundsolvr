import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],

  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
        lexend: ["Lexend", "sans-serif"],
      },
      lineHeight: {
        "11": "3rem",
      },
      fontSize: {
        "1.25": "1.25rem",
      },
      colors: {
        bitcoin: "#FB923C",
        background: "#100F29",
        diamond: "#A5F3FC",
        primaryButton: "#4E43C1",
        secondaryButton: "rgba(255, 255, 255, 0.1)",
        secondaryText: "#9CA3AF",
        primaryText: "#FFFFFF",
        rejected: "#FCD34D",
        success: "#6EE7B7",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
export default config;
