/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- IMPORTANT: Enables manual toggling via class="dark"
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        surfaceHover: "#1a1a1a",
        primary: "#3b82f6",
        primaryHover: "#2563eb",
        secondary: "#64748b",
        border: "#27272a",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
}