/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "ipad": "834px",    
      "4k": "2560px",     
    },
    extend: {
      colors: {
        azul: '#060953',
        blanco: '#ffffff',
        rojo: '#BD3737',
        gris_oscuro: '#2C2C2C',
        gris_claro: '#D9D9D9',
      },
    },
  },
  plugins: [],
};
