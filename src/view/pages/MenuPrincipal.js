import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';

const Menu = () => {
  const [isMenuOpenSettings, setIsMenuOpenSettings] = useState(false);

  const menuItems = [
    { to: "/anteproyectosCoordinador", icon: "fas fa-folder", text: "Anteproyectos" },
    { to: "/asignaciones/manual", icon: "fas fa-check-square", text: "Proyectos" },
    { to: "/gestion-perfiles", icon: "fas fa-user-cog", text: "Gestión de Perfiles" },
    { to: "/empresas", icon: "fas fa-building", text: "Empresas" },
    { to: "/calendario", icon: "fas fa-calendar", text: "Calendario" },
    { to: "/carga-datos", icon: "fas fa-upload", text: "Carga de Datos" },
    { to: "/dashboardMenu", icon: "fas fa-chart-bar", text: "Reportes y Gráficos" },
    { to: "/categorias", icon: "fas fa-tags", text: "Categorías de profesores" },
    { to: "/asignacion-defensas", icon: "fas fa-calendar-check", text: "Asignación de Defensas" },
    { to: "/tipos-de-proyectos", icon: "fas fa-tags", text: "Tipos de Proyectos" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-20 bg-white flex items-center justify-center relative px-4 border-b-2 border-black shadow-sm">
        <div className="flex items-center absolute left-5 gap-3">
          <span className="bg-gray-200 text-gray-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm select-none">
            Coordinador
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
            onClick={() => setIsMenuOpenSettings(!isMenuOpenSettings)}
            className="text-xl"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>

      <SettingsCoordinador show={isMenuOpenSettings} setShow={setIsMenuOpenSettings} />

      <main className="flex-grow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default Menu;
