// src/components/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, type = "blue", ...props }) => {
  let typeClasses = "";

  switch (type) {
    case "dark":
      typeClasses = "bg-primary1 text-background1 hover:bg-primary2";
      break;
    case "light":
      typeClasses =
        "bg-background1 text-primary1 border-2 border-primary1 hover:bg-secondary1";
      break;
    case "blue":
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

Button.propTypes = {
  /** The button’s inner text or elements */
  children: PropTypes.node.isRequired,
  /** Determines which styling variant to use: "dark", "light", or "blue" */
  type: PropTypes.oneOf(["dark", "light", "blue"]),
};

export default Button;
