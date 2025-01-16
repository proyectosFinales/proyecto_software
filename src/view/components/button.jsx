// Button.jsx
import React from 'react';

const Button = ({ children, type = "blue", ...props }) => {
  const baseClasses = "font-semibold py-2 px-4 rounded transition duration-200";
  
  // Map your custom 'type' to Tailwind color combos
  const variants = {
    dark: "bg-black text-white hover:bg-gray-800",
    light: "bg-white text-black hover:bg-gray-200 border border-gray-400",
    blue: "bg-azul text-blanco hover:bg-blue-800", 
    // If you put azul/blanco in tailwind.config.js or use hex
    // e.g., "bg-[#060953] text-[#ffffff]"
  };

  return (
    <button className={`${baseClasses} ${variants[type] || variants.blue}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
