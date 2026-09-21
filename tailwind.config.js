/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5EF",
        ink: "#1F2420",
        forest: {
          50: "#EEF4EF",
          100: "#D7E5DA",
          400: "#4C9A6A",
          500: "#357A52",
          700: "#1F5C3D",
          900: "#14322A"
        },
        moss: "#8FAE96",
        clay: "#C97A3D",
        berry: "#9C3D54",
        sand: "#EFE7D6"
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"]
      },
      borderRadius: {
        blob: "42% 58% 63% 37% / 41% 44% 56% 59%"
      },
      boxShadow: {
        soft: "0 12px 30px -12px rgba(20, 50, 42, 0.25)"
      }
    }
  },
  plugins: []
};
