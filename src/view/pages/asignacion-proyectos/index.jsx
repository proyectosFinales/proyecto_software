import { Link } from "react-router-dom";
import Layout from "../../components/layout";

const InicioAsignaciones = () => <>
    <Layout title="Menú de carga de datos">
        <div className="menu-grid" style={{textAlign: "center"}}>
            <Link className="menu-item" to="/asignaciones/automatica" style={{textDecoration: "none", color: "var(--primary1)"}}>
                <i className="fa-solid fa-laptop-code" style={{color: "var(--primary1)"}}></i>
                <p>Asignación automática</p>
            </Link>
            <Link className="menu-item" to="/asignaciones/manual" style={{textDecoration: "none", color: "var(--primary1)"}}>
                <i className="fa-solid fa-laptop-file" style={{color: "var(--primary1)"}}></i>
                <p>Asignación manual</p>
            </Link>
        </div>
    </Layout>
</>;

export default InicioAsignaciones;