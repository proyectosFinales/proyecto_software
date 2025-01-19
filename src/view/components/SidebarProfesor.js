/*SidebarProfesor.js */
import React from "react";
import { Link } from "react-router-dom";
import styles from './Sidebar.module.css';

const SidebarProfesor = ({show}) => {
  return (
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/menuProfesor" className={styles.menuItem}><li>Inicio</li></Link>
        <Link to="/proyectos-profesor" className={styles.menuItem}><li>Proyectos</li></Link>
        <Link to="/disponibildad-profesor" className={styles.menuItem}><li>Disponibilidad para defensas</li></Link>
        <Link to="/citas-profesor" className={styles.menuItem}><li>Citas</li></Link>
    </ul>
    </nav>
  );
};

export default SidebarProfesor;