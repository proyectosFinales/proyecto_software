/*HeaderProfesor.js*/
import React, { useState } from 'react';
import SidebarProfesor from './SidebarProfesor';
import SettingsProfesor from './SettingsProfesor';

const HeaderProfesor = ({title}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);

  return (
    <div>
      <div className="h-20 flex items-center justify-center bg-gray-300 border-b border-black relative">
        <button
          className="absolute left-5 text-2xl bg-transparent border-none cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          &#9776;
        </button>
        <button
          className="absolute right-5 text-2xl bg-transparent border-none cursor-pointer"
          onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
        >
          <i className="fas fa-cog"></i>
        </button>
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div>
        <SidebarProfesor show={isMenuOpen} setShow={setIsMenuOpen} />
        <SettingsProfesor show={isMenuOpenSettings} setShow={setIsMenuOpenSettings} />
      </div>
    </div>
  );
};

export default HeaderProfesor;