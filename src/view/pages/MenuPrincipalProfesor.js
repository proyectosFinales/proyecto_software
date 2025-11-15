import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SettingsProfesor from '../components/SettingsProfesor';

const MenuProfesor = () => {
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);

  const menuItems = [
    { to: "/proyectos-profesor", icon: "fas fa-folder-open", text: "Proyectos" },
    { to: "/disponibilidad-profesor", icon: "fas fa-calendar-days", text: "Disponibilidad para defensas" },
    { to: "/citas-profesor", icon: "fas fa-clock", text: "Consultar citas" },
    { to: "/bitacoras", icon: "fas fa-folder-open", text: "Bitácoras" },
    { to: "/actas", icon: "fa-solid fa-file", text: "Solicitar acta de defensa" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-20 bg-white flex items-center justify-center relative px-4 border-b-2 border-black shadow-sm">
        <div className="flex items-center absolute left-5 gap-3">
          <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
            Profesor
          </span>
        </div>
        <h1 className="text-lg md:text-2xl font-bold text-gray-800">Inicio</h1>
        <div className="flex items-center absolute right-5 gap-3">
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
            className="text-xl hover:scale-110 transition-transform text-gray-700"
            onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>

      <SettingsProfesor 
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

export default MenuProfesor;
