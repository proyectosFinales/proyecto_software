import React from "react";
import { Link } from "react-router-dom";
import styles from './Sidebar.module.css';

const SidebarProfesor = ({show}) => {
  return (
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/" className={styles.menuItem}><li>Inicio</li></Link>
        <Link to="/anteproyectosCoordinador" className={styles.menuItem}><li>Anteproyecto</li></Link>
        <Link to="/proyectosCoordinador" className={styles.menuItem}><li>Proyectos</li></Link>
        <Link to="/asignaciones" className={styles.menuItem}><li>Asignaciones</li></Link>
    </ul>
    </nav>
  );
};

export default SidebarProfesor;