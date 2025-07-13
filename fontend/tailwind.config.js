/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        phetsarath: ["PhetsarathOT", "sans-serif"],
        notosanslao: ["NotoSansLao", "sans-serif"],
      },
      animation: {
        "pulse-fast": "pulse 0.5s ease-in-out infinite",
        "pulse-slow": "pulse 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "scale(0.95)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
      },
      
    },
  },
  plugins: [],
  
};
