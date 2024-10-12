import { Link } from "react-router-dom";
import Layout from "../../components/layout";

const InicioCargaDatos = () => <>
    <Layout title="Menú de carga de datos">
        <div className="menu-grid" style={{textAlign: "center"}}>
            <Link className="menu-item" to="/carga-datos/cantidad-proyectos-profesor" style={{textDecoration: "none", color: "var(--primary1)"}}>
                <i className="fa-solid fa-chalkboard-user" style={{color: "var(--primary1)"}}></i>
                <p>Cantidad de proyectos por profesor</p>
            </Link>
        </div>
    </Layout>
</>;

export default InicioCargaDatos;