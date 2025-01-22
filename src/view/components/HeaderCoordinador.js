/*HeaderCoordinador.js*/
import React, { useState } from "react";
import SidebarCoordinador from "./SidebarCoordinador";
import SettingsCoordinador from "./SettingsCoordinador";

const HeaderCoordinador = ({ title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);

  return (
    <div>
      <header className="h-20 bg-gray-300 text-black p-4 shadow-md flex items-center justify-center relative border-b border-black">
        <button
          className="text-xl md:text-2xl absolute left-5"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          &#9776;
        </button>
        <h1 className="text-lg md:text-2xl font-bold">{title}</h1>
        <button
          className="text-xl absolute right-5"
          onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
        >
          <i className="fas fa-cog"></i>
        </button>
      </header>
      <SidebarCoordinador show={isMenuOpen} setShow={setIsMenuOpen} />
      <SettingsCoordinador show={isMenuOpenSettings} setShow={setIsMenuOpenSettings} />
    </div>
  );
};

export default HeaderCoordinador;
