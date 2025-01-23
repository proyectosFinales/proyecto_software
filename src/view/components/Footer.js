/*footer.js*/
import React from "react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center space-y-2 md:space-y-0">
          <p className="text-azul text-sm md:text-base">
            Instituto Tecnológico de Costa Rica
          </p>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600 text-xs md:text-sm">
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
