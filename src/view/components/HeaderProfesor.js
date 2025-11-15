/*HeaderProfesor.js*/
import React, { useState } from 'react';
import SidebarProfesor from './SidebarProfesor';
import SettingsProfesor from './SettingsProfesor';

const HeaderProfesor = ({title}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);

  return (
    <div>
      <header className="h-20 bg-gray-300 text-black p-4 shadow-md flex items-center justify-center relative border-b border-black">
        <div className="flex items-center absolute left-5 gap-3">
          <button
            className="text-xl md:text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            &#9776;
          </button>
          {/* Tipo de usuario */}
          <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
            Profesor
          </span>
        </div>
        <h1 className="text-lg md:text-2xl font-bold">{title}</h1>
        <div className="flex items-center absolute right-5 gap-3">
          {/* Semestre y año actual */}
          <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
            {(() => {
              const fecha = new Date();
              const anoActual = fecha.getFullYear();
              const mes = fecha.getMonth() + 1;
              const semestreActual = mes <= 7 ? 1 : 2;
              return `Semestre ${semestreActual} - ${anoActual}`;
            })()}
          </span>
          <button
            className="text-xl"
            onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>
      <div>
        <SidebarProfesor show={isMenuOpen} setShow={setIsMenuOpen} />
        <SettingsProfesor show={isMenuOpenSettings} setShow={setIsMenuOpenSettings} />
      </div>
    </div>
  );
};

export default HeaderProfesor;