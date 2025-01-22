/*SidebarProfesor.js */
import React from "react";
import { Link } from "react-router-dom";
import { 
  Home,
  FileText,
  Clock,
  Calendar
} from "lucide-react";

const SidebarProfesor = ({ show, setShow }) => {
  const menuItems = [
    { path: "/menuProfesor", text: "Inicio", icon: Home },
    { path: "/proyectos-profesor", text: "Proyectos", icon: FileText },
    { path: "/disponibildad-profesor", text: "Disponibilidad para defensas", icon: Clock },
    { path: "/citas-profesor", text: "Citas", icon: Calendar },
  ];

  return (
    <>
      {show && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShow(false)}
          aria-hidden="true"
        />
      )}

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

        <div className="absolute bottom-0 w-full p-4 text-center text-gray-600 text-sm border-t border-gray-200 bg-white">
          Instituto Tecnológico de Costa Rica
        </div>
      </nav>
    </>
  );
};

export default SidebarProfesor;