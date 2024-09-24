import React from 'react';
import { Link } from 'react-router-dom';
import './MenuPrincipal.css';

const Menu = () => {
  return (
    <div>
      <h1>Inicio</h1>
      <div className="menu-grid">
        <Link to="/anteproyectos" className="menu-item">
          <i className="fas fa-folder"></i>
          <p>Anteproyectos</p>
        </Link>
        <Link to="/asignaciones" className="menu-item">
          <i className="fas fa-users"></i>
          <p>Asignaciones</p>
        </Link>
        <Link to="/gestion-perfiles" className="menu-item">
          <i className="fas fa-user"></i>
          <p>Gestión de perfiles</p>
        </Link>
        <Link to="/proyectos" className="menu-item">
          <i className="fas fa-folder-open"></i>
          <p>Proyectos</p>
        </Link>
        <Link to="/cargar-datos" className="menu-item">
          <i className="fas fa-database"></i>
          <p>Cargar datos</p>
        </Link>
        <Link to="/citas" className="menu-item">
          <i className="fas fa-clock"></i>
          <p>Citas</p>
        </Link>
      </div>
      <footer>Instituto Tecnológico de Costa Rica 2024</footer>
    </div>
  );
};

export default Menu;
