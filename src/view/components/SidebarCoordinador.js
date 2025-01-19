/*SidebarCoordinador.js */
import React from "react";
import { Link } from "react-router-dom";

const SidebarCoordinador = ({ show }) => {
  return (
    <nav
      className={`fixed top-0 left-0 h-full bg-gris_oscuro text-blanco p-6 transition-transform transform ${
        show ? "translate-x-0" : "-translate-x-full"
      } w-64 shadow-lg z-50`}
    >
      <ul className="space-y-4">
        <li>
          <Link
            to="/menuCoordinador"
            className="block p-2 hover:bg-gris_claro rounded"
          >
            Inicio
          </Link>
        </li>
        <li>
          <Link
            to="/anteproyectosCoordinador"
            className="block p-2 hover:bg-gris_claro rounded"
          >
            Anteproyecto
          </Link>
        </li>
        <li>
          <Link
            to="/aprobarProyectos"
            className="block p-2 hover:bg-gris_claro rounded"
          >
            Proyectos
          </Link>
        </li>
        <li>
          <Link
            to="/asignaciones"
            className="block p-2 hover:bg-gris_claro rounded"
          >
            Asignaciones
          </Link>
        </li>
        <li>
          <Link
            to="/carga-datos"
            className="block p-2 hover:bg-gris_claro rounded"
          >
            Base de datos
          </Link>
        </li>
        <li>
          <Link
            to="/citasMenu"
            className="block p-2 hover:bg-gris_claro rounded"
          >
            Citas y Calendario
          </Link>
        </li>
        <li>
          <Link
            to="/gestion-perfiles"
            className="block p-2 hover:bg-gris_claro rounded"
          >
            Gestionar perfiles
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default SidebarCoordinador;
