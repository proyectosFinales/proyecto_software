/*footer.js*/
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-center sm:justify-between items-center">
        <p className="text-azul text-sm sm:text-base">
          Instituto Tecnológico de Costa Rica
        </p>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <p className="text-gray-600 text-xs sm:text-sm">
            © {new Date().getFullYear()} Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
