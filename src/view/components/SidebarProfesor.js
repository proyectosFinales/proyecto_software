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

const SidebarProfesor = () => {
  return (
    <nav className={styles.sidebar}>
    <ul>
        <Link to="/" className={styles.menuItem}><li>Inicio</li></Link>
    </ul>
    </nav>
  );
};

export default SidebarProfesor;