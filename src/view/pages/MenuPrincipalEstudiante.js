import React , { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/MenuPrincipal.module.css';
import Footer from '../components/Footer'
import SettingsEstudiante from '../components/SettingsEstudiante';

const MenuEstudiante = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div>
      <header className={styles.AppHeader}>
        <h1>Inicio</h1>
        <button className={styles.settingsIcon} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className="fas fa-cog"></i>
        </button>
      </header>
      <SettingsEstudiante show={isMenuOpen} />

      <div className={styles.menuGrid}>
        <Link to="/anteproyectosEstudiante" className={styles.menuItem}>
          <i className="fas fa-folder"></i>
          <p>Anteproyectos</p>
        </Link>
        <Link to="/citas-estudiante" className={styles.menuItem}>
          <i className="fas fa-clock"></i>
          <p>Citas</p>
        </Link>
        <Link to="/bitacoras" className={styles.menuItem}>
          <i className="fas fa-folder-open"></i>
          <p>Bitácoras</p>
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default MenuEstudiante;
