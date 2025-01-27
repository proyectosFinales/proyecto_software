/*SidebarCoordinador.js */
import React from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Users, 
  Database, 
  Calendar, 
  UserCog,
  Building
} from "lucide-react";

const SidebarCoordinador = ({ show, setShow }) => {
  const menuItems = [
    { path: "/menuCoordinador", text: "Inicio", icon: Home },
    { path: "/anteproyectosCoordinador", text: "Anteproyecto", icon: FileText },
    { path: "/asignaciones", text: "Asignaciones", icon: Users },
    { path: "/aprobarProyectos", text: "Proyectos", icon: CheckSquare },
    { path: "/carga-datos", text: "Base de datos", icon: Database },
    { path: "/citasMenu", text: "Citas y Calendario", icon: Calendar },
    { path: "/gestion-perfiles", text: "Gestionar perfiles", icon: UserCog },
    { path: "/empresas", text: "Empresas", icon: Building },
  ];

  if (!show) return null;

  return (
    <>
      {/* Overlay when sidebar is open */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setShow(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <nav 
        className={`
          fixed top-20 left-0 
          h-[calc(100vh-80px)] w-64
          bg-white
          shadow-lg
          z-50
          transition-transform duration-300 ease-in-out
          ${show ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <ul className="list-none p-0 m-0">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className="block no-underline group transition-all duration-200"
                onClick={() => setShow(false)}
              >
                <li className="
                  flex items-center gap-3
                  px-6 py-4
                  text-gray-900
                  border-b border-gray-100
                  cursor-pointer
                  transition-colors duration-200
                  hover:bg-gray-50
                  active:bg-gray-100
                ">
                  <Icon 
                    size={20} 
                    className="text-azul transition-transform duration-200 group-hover:scale-110" 
                  />
                  <span className="text-base font-medium">
                    {item.text}
                  </span>
                </li>
              </Link>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 text-center text-gray-600 text-sm border-t border-gray-200 bg-white">
          Instituto Tecnológico de Costa Rica
        </div>
      </nav>
    </>
  );
};

SidebarCoordinador.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired
};

export default SidebarCoordinador;
