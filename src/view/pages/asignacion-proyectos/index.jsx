/**
 * InicioAsignaciones.jsx
 * Menú simple con enlaces a la asignación automática y manual.
 */
import { Link } from "react-router-dom";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";

const InicioAsignaciones = () => (
  <>
    <Header title="Menú de asignaciones"/>
    <div className="menu-grid" style={{textAlign: "center"}}>
      <Link className="menu-item" to="/asignaciones/automatica" style={{textDecoration: "none", color: "var(--azul)"}}>
        <i className="fa-solid fa-laptop-code" style={{color: "var(--azul)"}}></i>
        <p>Asignación automática</p>
      </Link>
      <Link className="menu-item" to="/asignaciones/manual" style={{textDecoration: "none", color: "var(--azul)"}}>
        <i className="fa-solid fa-laptop-file" style={{color: "var(--azul)"}}></i>
        <p>Asignación manual y Reporte</p>
      </Link>
    </div>
    <Footer />
  </>
);

export default InicioAsignaciones;
