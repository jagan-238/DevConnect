/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A56DB",
        dark: "#0f172a",
        sidebar: "#1e293b",
        surface: "#1e293b",
        muted: "#64748b",
      },
    },
  },
  plugins: [],
};
