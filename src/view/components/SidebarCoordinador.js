import React from "react";
import { Link } from "react-router-dom";
import styles from './Sidebar.module.css';

/*copiar y pegar esto tambien

const [isMenuOpen, setIsMenuOpen] = useState(false);
const navigate = useNavigate(); // Hook para redireccionar

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
*/

const SidebarCoordinador = () => {
  return (
    <nav className={styles.sidebar}>
    <ul>
        <Link to="/" className={styles.menuItem}><li>Inicio</li></Link>
        <Link to="/anteproyectosCoordinador" className={styles.menuItem}><li>Anteproyecto</li></Link>
        <Link to="/proyectosCoordinador" className={styles.menuItem}><li>Proyectos</li></Link>
        <Link to="/asignaciones" className={styles.menuItem}><li>Asignaciones</li></Link>
        <Link to="/" className={styles.menuItem}><li>Base de datos</li></Link>
        <Link to="/citas" className={styles.menuItem}><li>Citas</li></Link>
        <Link to="/gestion-perfiles" className={styles.menuItem}><li>Gestionar perfiles</li></Link>
        <Link to="/editar-perfil" className={styles.menuItem}><li>Modificar Información</li></Link>
    </ul>
    </nav>
  );
};

export default SidebarCoordinador;