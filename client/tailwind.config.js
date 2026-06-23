export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2D6A4F",
        "primary-light": "#D8F3DC",
        accent: "#74C69D",
        urgency: "#F4845F",
        danger: "#E63946",
        dark: "#1B1B1B",
        "mid-gray": "#6B7280",
        "light-gray": "#F3F4F6",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
