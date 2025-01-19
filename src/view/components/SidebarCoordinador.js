/*SidebarCoordinador.js */
import React from "react";
import { Link } from "react-router-dom";
import styles from './Sidebar.module.css';

const SidebarCoordinador = ({show}) => {
  return (
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/menuCoordinador" className={styles.menuItem}><li>Inicio</li></Link>
        <Link to="/anteproyectosCoordinador" className={styles.menuItem}><li>Anteproyecto</li></Link>
        <Link to="/aprobarProyectos" className={styles.menuItem}><li>Proyectos</li></Link>
        <Link to="/asignaciones" className={styles.menuItem}><li>Asignaciones</li></Link>
        <Link to="/carga-datos" className={styles.menuItem}><li>Base de datos</li></Link>
        <Link to="/citasMenu" className={styles.menuItem}><li>Citas y Calendario</li></Link>
        <Link to="/gestion-perfiles" className={styles.menuItem}><li>Gestionar perfiles</li></Link>
    </ul>
    </nav>
  );
};

export default SidebarCoordinador;