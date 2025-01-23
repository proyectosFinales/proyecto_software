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
        primary1: "#2c2c2c",
        primary2: "#3d3d3d",
        secondary1: "#a1a6ad",
        secondary2: "#D9D9D9",
        background1: "#ffffff",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      minHeight: {
        'screen-75': '75vh',
      },
      zIndex: {
        '40': '40',
        '50': '50',
        '60': '60',
      },
      gridTemplateColumns: {
        'menu': 'repeat(auto-fit, minmax(250px, 1fr))',
      },
      boxShadow: {
        'menu': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'system': [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
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
