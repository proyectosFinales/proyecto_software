import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';

const DashboardMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      to: "/dashboard-estudiantes",
      icon: "fas fa-user-graduate",
      text: "Estado de estudiantes"
    },
    {
      to: "/dashboard-calificaciones",
      icon: "fas fa-star",
      text: "Calificaciones de Profesores"
    },
    {
      to: "/avances-proyectos",
      icon: "fas fa-tasks",
      text: "Avances de Proyectos"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Coordinator Header */}
      <Header title="Reportes y gráficos" />

      {/* Settings Drawer */}
      <SettingsCoordinador show={isMenuOpen} setShow={setIsMenuOpen} />

      <main className="flex-grow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="flex flex-col items-center justify-center p-8 bg-white rounded shadow hover:shadow-lg hover:scale-105 transition-transform"
            >
              <i className={`${item.icon} text-azul text-5xl mb-4`}></i>
              <p className="text-gray-700 font-semibold text-lg">{item.text}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardMenu;
