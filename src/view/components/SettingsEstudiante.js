import React from "react";
import { Link } from "react-router-dom";
import styles from './SettingsMenu.module.css';


const SettingsCoordinador = ({show}) => {
  return (
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/editar-perfil" className={styles.menuItem}><li>Perfil</li></Link>
        <Link to="/" className={styles.menuItem}><li>Cerrar sesión</li></Link>
        <Link to="/darseBaja" className={styles.menuItem}><li>Darse de baja</li></Link>
        
    </ul>
    </nav>
  );
};

export default SettingsCoordinador;