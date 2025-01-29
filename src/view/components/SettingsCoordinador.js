/**SettingsCoordinador.js */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LogOut, 
  User
} from "lucide-react";
import Modal from './Modal';

const SettingsCoordinador = ({ show, setShow }) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);

  const delSessionToken = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { path: "/editar-perfil", text: "Perfil", icon: User },
    { text: "Cerrar sesión", icon: LogOut, onClick: () => setModal(true) }
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

      {/* Settings Sidebar */}
      <nav 
        className={`
          fixed top-20 right-0 
          h-[calc(100vh-80px)] w-64
          bg-white
          shadow-lg
          z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${show ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Scrollable menu container */}
        <div className="flex-1 overflow-y-auto">
          <ul className="list-none p-0 m-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              if (item.path) {
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
              } else {
                return (
                  <li
                    key={index}
                    onClick={item.onClick}
                    className="
                      flex items-center gap-3
                      px-6 py-4
                      text-gray-900
                      border-b border-gray-100
                      cursor-pointer
                      transition-colors duration-200
                      hover:bg-gray-50
                      active:bg-gray-100
                      group
                    "
                  >
                    <Icon 
                      size={20} 
                      className="text-azul transition-transform duration-200 group-hover:scale-110 flex-shrink-0" 
                    />
                    <span className="text-base font-medium">
                      {item.text}
                    </span>
                  </li>
                );
              }
            })}
          </ul>
        </div>

        {/* Fixed footer */}
        <div className="flex-shrink-0 p-4 text-center text-gray-600 text-sm border-t border-gray-200 bg-white">
          Instituto Tecnológico de Costa Rica
        </div>
      </nav>

      <Modal show={modal} onClose={() => setModal(false)}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">¿Desea cerrar sesión?</h2>
          <div className="flex justify-center gap-4">
            <button
              className="px-4 py-2 bg-azul text-white rounded hover:bg-opacity-90"
              onClick={delSessionToken}
            >
              Sí
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-opacity-90"
              onClick={() => setModal(false)}
            >
              No
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SettingsCoordinador;
