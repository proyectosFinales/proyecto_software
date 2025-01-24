import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SettingsEstudiante from '../components/SettingsEstudiante';

const MenuEstudiante = () => {
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);

  const menuItems = [
    { to: "/anteproyectosEstudiante", icon: "fas fa-folder", text: "Anteproyectos" },
    { to: "/citas-estudiante", icon: "fas fa-clock", text: "Citas" },
    { to: "/bitacoras", icon: "fas fa-folder-open", text: "Bitácoras" },
    { to: "/calificar-asesor", icon: "fas fa-star", text: "Calificar Profesor Asesor" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-20 bg-white flex justify-between items-center px-4 border-b-2 border-black shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Inicio</h1>
        <button 
          className="text-2xl hover:scale-110 transition-transform text-gray-700"
          onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
        >
          <i className="fas fa-cog"></i>
        </button>
      </header>

      <SettingsEstudiante 
        show={isMenuOpenSettings} 
        setShow={setIsMenuOpenSettings} 
      />

      <main className="flex-grow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              to={item.to} 
              className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <i className={`${item.icon} text-azul text-5xl mb-4`}></i>
              <p className="text-center text-gray-700 font-semibold text-lg">{item.text}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MenuEstudiante;
