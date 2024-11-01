import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/MenuPrincipal.module.css';
import Footer from '../components/Footer'
import SettingsProfesor from '../components/SettingsProfesor';

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
      <SettingsProfesor show={isMenuOpen} />
      <div className={styles.menuGrid}>
        <Link to="/proyectos-profesor" className={styles.menuItem}>
          <i className="fas fa-folder-open"></i>
          <p>Proyectos asignados</p>
        </Link>
        <Link to="/disponibilidad-profesor" className={styles.menuItem}>
          <i className="fas fa-calendar-days"></i>
          <p>Disponibilidad para defensas</p>
        </Link>
        <Link to="/citas-profesor" className={styles.menuItem}>
          <i className="fas fa-clock"></i>
          <p>Consultar citas</p>
        </Link>

      </div>
      <Footer />
    </div>
  );
};

export default Menu;
