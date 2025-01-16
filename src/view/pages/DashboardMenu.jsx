import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/MenuPrincipal.module.css';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import SettingsCoordinador from '../components/SettingsCoordinador';

const DashboardMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <Header title="Reportes y gráficos" />
      <SettingsCoordinador show={isMenuOpen} />
      <div className={styles.menuGrid}>
        <Link to="/dasboard-avances" className={styles.menuItem}>
          <i className="fas fa-chart-line"></i>
          <p>Avances de estudiantes</p>
        </Link>
        <Link to="/dashboard-calificaciones" className={styles.menuItem}>
          <i className="fas fa-star"></i>
          <p>Calificaciones de profesores</p>
        </Link>
        <Link to="/dashboard-estudiantes" className={styles.menuItem}>
          <i className="fas fa-user-graduate"></i>
          <p>Estado de estudiantes</p>
        </Link>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardMenu;
