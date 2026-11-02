import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        editorial: {
          accent: "#3b82f6",
          purple: {
            subtle: "rgba(168, 85, 247, 0.12)",
            border: "rgba(168, 85, 247, 0.35)",
            text: "#d8b4fe",
          },
          amber: {
            subtle: "rgba(245, 158, 11, 0.12)",
            border: "rgba(245, 158, 11, 0.35)",
            text: "#fcd34d",
          },
          sky: {
            subtle: "rgba(14, 165, 233, 0.12)",
            border: "rgba(14, 165, 233, 0.35)",
            text: "#7dd3fc",
          },
          rose: {
            subtle: "rgba(244, 63, 94, 0.12)",
            border: "rgba(244, 63, 94, 0.35)",
            text: "#fda4af",
          },
          emerald: {
            subtle: "rgba(16, 185, 129, 0.12)",
            border: "rgba(16, 185, 129, 0.35)",
            text: "#6ee7b7",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: ["Newsreader", "Charter", "Georgia", "serif"],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        editorial: "0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        "editorial-lg": "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
