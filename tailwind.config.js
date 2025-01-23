/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        azul: "#060953",
        blanco: "#ffffff",
        rojo: "#BD3737",
        gris_oscuro: "#2C2C2C",
        gris_claro: "#D9D9D9",
        celeste: "#85d7ff",
      },
      zIndex: {
        '40': '40',
        '50': '50',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), 
    require("@tailwindcss/typography"), 
  ],
  // Enable dark mode if needed
  darkMode: 'class',
};
