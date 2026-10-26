import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "var(--void)",
        asphalt: "var(--asphalt)",
        panel: "var(--panel)",
        rail: "var(--rail)",
        chalk: "var(--chalk)",
        mist: "var(--mist)",
        mute: "var(--mute)",
        signal: "var(--signal)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Oxanium", "sans-serif"],
        ui: ["var(--font-ui)", "Sora", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
