/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wir sagen Tailwind, dass es die CSS-Variable nutzen soll
        primary: {
          DEFAULT: "oklch(from hsl(142 76% 17%) l c h)", 
          // Oder einfacher, falls das oben zu komplex ist:
          DEFAULT: "hsl(142 76% 17%)",
        },
      },
    },
  },
  plugins: [],
}