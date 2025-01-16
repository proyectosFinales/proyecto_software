// Button.jsx (no more .module.css)
import React from 'react';

const Button = ({ children, type = "blue", ...props }) => {
  // Define a small mapping of button “types” to Tailwind color classes
  let typeClasses = "";

  switch (type) {
    case "dark":
      // e.g. "bg-primary1 text-background1 hover:bg-primary2"
      typeClasses = "bg-primary1 text-background1 hover:bg-primary2";
      break;
    case "light":
      // e.g. "bg-background1 text-primary1 border border-primary1 hover:bg-secondary1"
      typeClasses = "bg-background1 text-primary1 border-2 border-primary1 hover:bg-secondary1";
      break;
    case "blue":
      // e.g. "bg-azul text-background1 hover:bg-celeste"
      typeClasses = "bg-azul text-background1 hover:bg-celeste";
      break;
    default:
      typeClasses = "bg-azul text-white hover:opacity-80";
  }

  return (
    <button
      className={`
        ${typeClasses}
        text-base
        py-2 px-5
        rounded-lg
        cursor-pointer
        transition-colors
        duration-150
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
