import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';

const DashboardMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Coordinator Header */}
      <Header title="Reportes y gráficos" />

      {/* Settings Drawer */}
      <SettingsCoordinador show={isMenuOpen} setShow={setIsMenuOpen} />

      <main className="flex-grow">
        {/* Container for menu items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-6">
          {/* 1) Estado de estudiantes */}
          <Link
            to="/dashboard-estudiantes"
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105"
          >
            <i className="fas fa-user-graduate text-azul text-5xl mb-4"></i>
            <p className="text-center text-gray-700 font-semibold text-lg">Estado de estudiantes</p>
          </Link>

          {/* 2) Calificaciones de profesores */}
          <Link
            to="/calificaciones-profesores"
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105"
          >
            <i className="fas fa-star text-azul text-5xl mb-4"></i>
            <p className="text-center text-gray-700 font-semibold text-lg">Calificaciones de Profesores</p>
          </Link>

          {/* 3) Avances de proyectos */}
          <Link
            to="/avances-proyectos"
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-transform duration-300 hover:scale-105"
          >
            <i className="fas fa-tasks text-azul text-5xl mb-4"></i>
            <p className="text-center text-gray-700 font-semibold text-lg">Avances de Proyectos</p>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardMenu;
