import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fortress: {
          bg: "#090b0f",
          surface: "#11151c",
          raised: "#181e28",
          panel: "#1c2431",
          border: "#2b3547",
          gold: "#c9a227",
          "gold-bright": "#e4c45a",
          steel: "#93a4bb",
          ink: "#eef1f6",
          muted: "#8b95a8",
          danger: "#d45b63",
          success: "#3ecf8e",
        },
      },
      fontFamily: {
        display: ["Oswald", "Impact", "sans-serif"],
        body: ["Barlow", "system-ui", "sans-serif"],
      },
      boxShadow: {
        fortress: "0 0 0 1px rgba(201,162,39,0.18), 0 18px 40px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
