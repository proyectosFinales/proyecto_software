import React from 'react';
import './Header.css'; // Añadir estilos específicos para el header

const Header = () => {
  return (
    <header className="header">
      <button className="menu-btn">
        <i className="fas fa-bars"></i> {/* Icono de menú */}
      </button>
      <h1>Asignaciones</h1>
      <button className="settings-btn">
        <i className="fas fa-cog"></i> {/* Icono de ajustes */}
      </button>
    </header>
  );
};

export default Header;