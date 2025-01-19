/*SettingsProfesor.js */

import React from "react";
import { Link } from "react-router-dom";
import styles from './SettingsMenu.module.css';
import { useNavigate } from "react-router-dom";


const SettingsCoordinador = ({show}) => {

  const navigate = useNavigate();

  function delSessionToken () {
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/editar-perfil" className={styles.menuItem}><li>Perfil</li></Link>
        <li className={styles.menuItem} onClick={delSessionToken}>Cerrar sesión</li>
    </ul>
    </nav>
  );
};

export default SettingsCoordinador;