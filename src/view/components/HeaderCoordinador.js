/*HeaderCoordinador.js*/
import React, { useState } from "react";
import SidebarCoordinador from "./SidebarCoordinador";
import SettingsCoordinador from "./SettingsCoordinador";

const HeaderCoordinador = ({ title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);

  return (
    <div>
      <header className="flex items-center justify-between bg-gris_oscuro text-blanco p-4 shadow-md">
        <button
          className="text-xl md:text-2xl"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          &#9776;
        </button>
        <h1 className="text-lg md:text-2xl font-bold">{title}</h1>
        <button
          className="text-xl"
          onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
        >
          <i className="fas fa-cog"></i>
        </button>
      </header>
      <SidebarCoordinador show={isMenuOpen} />
      <SettingsCoordinador show={isMenuOpenSettings} />
    </div>
  );
};

export default HeaderCoordinador;
