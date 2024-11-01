import React from "react";
import { Link } from "react-router-dom";
import styles from './Sidebar.module.css';


const SidebarEstudiante = ({show}) => {
  return (
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/MenuEstudiante" className={styles.menuItem}><li>Inicio</li></Link>
        <Link to="/anteproyectosEstudiante" className={styles.menuItem}><li>Anteproyecto</li></Link>
        <Link to="/MeneEstudiante" className={styles.menuItem}><li>Citas</li></Link>
    </ul>
    </nav>
  );
};

export default SidebarEstudiante;