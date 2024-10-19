import React from "react";
import { Link } from "react-router-dom";
import styles from './SettingsMenu.module.css';

/*copiar y pegar esta variable

const [isMenuOpen, setIsMenuOpen] = useState(false);

copiar y pegar este botón dentro del header

<button className={styles.menuIcon} onClick={() => setIsMenuOpen(!isMenuOpen)}>
  &#9776;
</button>

*/

const SettingsCoordinador = ({show}) => {
  return (
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/" className={styles.menuItem}><li>Perfil</li></Link>
        <Link to="/proyectosCoordinador" className={styles.menuItem}><li>Cerrar sesión</li></Link>
    </ul>
    </nav>
  );
};

export default SettingsCoordinador;