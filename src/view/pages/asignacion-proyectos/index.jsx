import { Link } from "react-router-dom";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";

const InicioAsignaciones = () => <>
    <Header title="Menú de asignaciones"/>
        <div className="menu-grid" style={{textAlign: "center"}}>
            <Link className="menu-item" to="/asignaciones/automatica" style={{textDecoration: "none", color: "var(--primary1)"}}>
                <i className="fa-solid fa-laptop-code" style={{color: "var(--primary1)"}}></i>
                <p>Asignación automática</p>
            </Link>
            <Link className="menu-item" to="/asignaciones/manual" style={{textDecoration: "none", color: "var(--primary1)"}}>
                <i className="fa-solid fa-laptop-file" style={{color: "var(--primary1)"}}></i>
                <p>Asignación manual y Reporte</p>
            </Link>
        </div>
    <Footer />
</>;

export default InicioAsignaciones;