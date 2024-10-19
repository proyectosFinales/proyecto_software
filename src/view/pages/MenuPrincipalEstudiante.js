import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/MenuPrincipal.module.css';
import Footer from '../components/Footer'

const MenuEstudiante = () => {
  return (
    <div>
      <header className={styles.AppHeader}>
        <h1>Inicio</h1>
        <div className={styles.settingsIcon}>
          <i className="fas fa-cog"></i>
        </div>
      </header>
      <div className={styles.menuGrid}>
        <Link to="/anteproyectosEstudiante" className={styles.menuItem}>
          <i className="fas fa-folder"></i>
          <p>Anteproyectos</p>
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

export default MenuEstudiante;
