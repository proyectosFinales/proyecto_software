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
  Building,
  File,
  BookOpen,
  ClipboardList,
  Upload,
  BarChart,
  Key,
  Tags
} from "lucide-react";

const SidebarCoordinador = ({ show, setShow }) => {
  const menuItems = [
    { path: "/menuCoordinador", text: "Inicio", icon: Home },
    { path: "/anteproyectosCoordinador", text: "Anteproyectos", icon: FileText },
    { path: "/asignaciones/manual", text: "Proyectos", icon: CheckSquare },
    { path: "/gestion-perfiles", text: "Gestión de Perfiles", icon: UserCog },
    { path: "/empresas", text: "Empresas", icon: Building },
    { path: "/citasMenu", text: "Citas", icon: Calendar },
    { path: "/carga-datos", text: "Carga de Datos", icon: Upload },
    { path: "/dashboardMenu", text: "Reportes y Gráficos", icon: BarChart },
    { path: "/permisos-calificaciones", text: "Permisos de Calificaciones", icon: Key },
    { path: "/categorias", text: "Categorías de profesores", icon: Tags },
    { path: "/bitacoras-coordinador", text: "Bitácoras", icon: BookOpen },
    { path: "/actas-coordinador", text: "Actas de defensa", icon: File },
    { path: "/asignacion-proyectos", text: "Asignación de Proyectos", icon: ClipboardList },
  ];

  return (
    <>
      {/* Overlay */}
      {show && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShow(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav 
        className={`
          fixed top-20 left-0 
          h-[calc(100vh-80px)] w-64
          bg-white
          shadow-lg
          z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${show ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Scrollable menu container */}
        <div className="flex-1 overflow-y-auto">
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
                      className="text-azul transition-transform duration-200 group-hover:scale-110 flex-shrink-0" 
                    />
                    <span className="text-base font-medium">
                      {item.text}
                    </span>
                  </li>
                </Link>
              );
            })}
          </ul>
        </div>

        {/* Fixed footer */}
        <div className="flex-shrink-0 p-4 text-center text-gray-600 text-sm border-t border-gray-200 bg-white">
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
