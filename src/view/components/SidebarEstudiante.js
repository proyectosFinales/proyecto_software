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

const SidebarEstudiante = () => {
  return (
    <nav className={styles.sidebar}>
    <ul>
        <Link to="/" className={styles.menuItem}><li>Inicio</li></Link>
        <Link to="/anteproyectosEstudiante" className={styles.menuItem}><li>Anteproyecto</li></Link>
        <Link to="/asignacionesEstudiante" className={styles.menuItem}><li>Proyectos</li></Link>
    </ul>
    </nav>
  );
};

export default SidebarEstudiante;