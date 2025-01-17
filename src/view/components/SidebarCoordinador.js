// src/components/SidebarCoordinador.jsx
import React from "react";
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Users, 
  Database, 
  Calendar, 
  UserCog,
  Menu,
  Settings
} from "lucide-react";

const SidebarCoordinador = ({ show, onNavigate, onToggle }) => {
  const menuItems = [
    { path: "/menuCoordinador", text: "Inicio", icon: Home },
    { path: "/anteproyectosCoordinador", text: "Anteproyecto", icon: FileText },
    { path: "/aprobarProyectos", text: "Proyectos", icon: CheckSquare },
    { path: "/asignaciones", text: "Asignaciones", icon: Users },
    { path: "/carga-datos", text: "Base de datos", icon: Database },
    { path: "/citasMenu", text: "Citas y Calendario", icon: Calendar },
    { path: "/gestion-perfiles", text: "Gestionar perfiles", icon: UserCog },
  ];

  return (
    <>
      {/* Header with burger menu */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white shadow-md z-40 flex items-center justify-between px-6">
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Menú de asignaciones</h1>
        <Settings className="text-gray-700" size={24} />
      </header>

      {/* Overlay when sidebar is open */}
      {show && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onToggle}
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
          transition-transform duration-300 ease-in-out
          ${show ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <ul className="list-none p-0 m-0">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li 
                key={index}
                onClick={() => {
                  onNavigate?.(item.path);
                  onToggle(); // Close the sidebar when a menu item is clicked
                }}
                className="
                  flex items-center gap-3
                  px-6 py-4
                  text-gray-900
                  border-b border-gray-200
                  cursor-pointer
                  transition-colors duration-200
                  hover:bg-gray-50
                  active:bg-gray-100
                "
              >
                <Icon 
                  size={20} 
                  className="
                    text-azul
                    transition-transform duration-200
                    group-hover:scale-110
                  " 
                />
                <span className="text-base font-medium">
                  {item.text}
                </span>
              </li>
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

export default SidebarCoordinador;
