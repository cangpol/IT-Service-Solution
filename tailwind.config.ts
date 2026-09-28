import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        upitra: {
          navy: "#0F2942",
          dark: "#0A1D30",
          blue: "#1B4965",
          accent: "#2A6F97",
          sky: "#61A5C2",
          ice: "#E2EDF8",
          emerald: "#059669",
          emeraldLight: "#D1FAE5",
          gold: "#D97706",
          goldLight: "#FEF3C7",
          surface: "#F8FAFC",
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 41, 66, 0.08)',
        'elevated': '0 10px 30px -4px rgba(15, 41, 66, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;

