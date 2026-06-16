/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A3A5C",
        accent: "#2980B9",
        light: "#D6EAF8",
        mid: "#85C1E9",
        white: "#FFFFFF",
        black: "#000000",
        gray: "#555555",
        lightGray: "#F2F3F4",
        border: "#AED6F1",
        success: "#1E8449",
        warning: "#D35400",
        danger: "#C0392B",
      },
    },
  },
  plugins: [],
}
