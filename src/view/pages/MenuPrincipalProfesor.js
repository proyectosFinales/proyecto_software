import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/MenuPrincipal.module.css';
import Footer from '../components/Footer'

const Menu = () => {
  return (
    <div>
      <header className={styles.AppHeader}>
        <h1>Inicio</h1>
        <div className={styles.settingsIcon}>
          <i className="fas fa-cog"></i>
        </div>
      </header>
      <div className={styles.menuGrid}>
        <Link to="/citas-profesor" className={styles.menuItem}>
          <i className="fas fa-clock"></i>
          <p>Citas para defensas</p>
        </Link>
        <Link to="/proyectos" className={styles.menuItem}>
          <i className="fas fa-folder-open"></i>
          <p>Proyectos asignados</p>
        </Link>

      </div>
      <Footer />
    </div>
  );
};

export default Menu;
