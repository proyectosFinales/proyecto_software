import { Link } from "react-router-dom";
import Layout from "../../components/layout";
import { AiOutlineCloudUpload } from "react-icons/ai";

const InicioCargaDatos = () => <>
    <Layout title="Menú de carga de datos">
        <div className="menu-grid" style={{textAlign: "center"}}>
            <Link className="menu-item" to="/carga-datos/cantidad-proyectos-profesor" style={{textDecoration: "none", color: "var(--primary1)"}}>
                <i className="fa-solid fa-chalkboard-user" style={{color: "var(--primary1)"}}></i>
                <p>Cantidad de proyectos por profesor</p>
            </Link>
            <Link className="menu-item" to="/cargarProfesores" style={{ textDecoration: "none", color: "var(--primary1)" }}>
                <AiOutlineCloudUpload style={{ color: "var(--primary1)", fontSize: "80px" }} /> {/* Tamaño y estilo del ícono */}
                <p>Carga de datos</p>
            </Link>
        </div>
    </Layout>
</>;

export default InicioCargaDatos;