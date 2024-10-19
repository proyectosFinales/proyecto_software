import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/MenuPrincipal.module.css';
import Footer from '../components/Footer'
import SettingsCoordinador from '../components/SettingsCoordinador';

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div>
      <header className={styles.AppHeader}>
        <h1>Inicio</h1>
        <button className={styles.settingsIcon} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className="fas fa-cog"></i>
        </button>
      </header>
      <SettingsCoordinador show={isMenuOpen} />
      <div className={styles.menuGrid}>
        <Link to="/anteproyectosCoordinador" className={styles.menuItem}>
          <i className="fas fa-folder"></i>
          <p>Anteproyectos</p>
        </Link>
        <Link to="/asignaciones" className={styles.menuItem}>
          <i className="fas fa-users"></i>
          <p>Asignaciones</p>
        </Link>
        <Link to="/gestion-perfiles" className={styles.menuItem}>
          <i className="fas fa-user"></i>
          <p>Gestión de perfiles</p>
        </Link>
        <Link to="/proyectos" className={styles.menuItem}>
          <i className="fas fa-folder-open"></i>
          <p>Proyectos</p>
        </Link>
        <Link to="/carga-datos" className={styles.menuItem}>
          <i className="fas fa-database"></i>
          <p>Cargar datos</p>
        </Link>
        <Link to="/citas" className={styles.menuItem}>
          <i className="fas fa-clock"></i>
          <p>Citas</p>
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default Menu;
