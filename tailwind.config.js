/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f2fbfd",
          100: "#e6f7fb",
          200: "#c8eff5",
          300: "#9fe2ec",
          400: "#6fd0de",
          500: "#17A2B8", // brand primary
          600: "#148ea3",
          700: "#117c8f",
          800: "#0e6676",
          900: "#0b515f",
        },
        accent: {
          50: "#fff8e6",
          100: "#ffefbf",
          200: "#ffe493",
          300: "#ffd463",
          400: "#fec53a",
          500: "#fdbc2c",
          600: "#db9b1e",
          700: "#b47c19",
          800: "#8c5e14",
          900: "#66450f",
        },
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e3e8ef",
          300: "#c9d1dc",
          400: "#98a5b3",
          500: "#6b7c8f",
          600: "#536171",
          700: "#3e4a57",
          800: "#2a343f",
          900: "#1a2229",
        },
      },
    },
  },
  plugins: [],
}
