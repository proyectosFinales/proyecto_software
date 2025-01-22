/**SettingsCoordinador.js */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { 
  LogOut, 
  User,
  Calendar,
  Clock
} from "lucide-react";
import Modal from './Modal';

const SettingsCoordinador = ({ show, setShow }) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [modalDuracion, setModalDuracion] = useState(false);

  const delSessionToken = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { path: "/editar-perfil", text: "Perfil", icon: User },
    { path: "/calendario", text: "Calendario", icon: Calendar },
    { path: "/duracion-semestre", text: "Duración del semestre", icon: Clock },
    { text: "Cerrar sesión", icon: LogOut, onClick: () => setModal(true) }
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
          fixed top-20 right-0 
          h-[calc(100vh-80px)] w-64
          bg-white
          shadow-lg
          z-50
          transition-transform duration-300 ease-in-out
          ${show ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <ul className="list-none p-0 m-0">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            if (item.path) {
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
                    className="text-azul transition-transform duration-200 group-hover:scale-110" 
                  />
                  <span className="text-base font-medium">
                    {item.text}
                  </span>
                </li>
              );
            }
          })}
        </ul>

        <div className="absolute bottom-0 w-full p-4 text-center text-gray-600 text-sm border-t border-gray-200 bg-white">
          Instituto Tecnológico de Costa Rica
        </div>
      </nav>

      {/* Modal de cierre de sesión */}
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
