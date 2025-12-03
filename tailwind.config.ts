import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#163b6b",
          dark: "#0f2a4c",
          light: "#1a73e8",
        },
        accent: {
          DEFAULT: "#fdbc2c", // gold accent
          light: "#ffd04f",
        },
        neutral: {
          50: "#fafafa",
          100: "#f8fafc",
          200: "#eef2f7",
          300: "#e3e8ef",
          400: "#cbd5e1",
          500: "#94a3b8",
          600: "#64748b",
          700: "#475569",
          800: "#334155",
          900: "#1e293b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  corePlugins: {
    preflight: false,
  },
}

export default config
