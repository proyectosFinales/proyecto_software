import { Link } from "react-router-dom";
import { AiOutlineCloudUpload } from "react-icons/ai";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";

const InicioCargaDatos = () => <>
    <Header title="Menú de base de datos"/>
        <div className="menu-grid" style={{textAlign: "center"}}>
            <Link className="menu-item" to="/carga-datos/cantidad-proyectos-profesor" style={{textDecoration: "none", color: "var(--primary1)"}}>
                <i className="fa-solid fa-chalkboard-user" style={{color: "var(--azul)"}}></i>
                <p>Proyectos por profesor</p>
            </Link>
            <Link className="menu-item" to="/cargarProfesores" style={{ textDecoration: "none", color: "var(--primary1)" }}>
                <AiOutlineCloudUpload style={{ color: "var(--azul)", fontSize: "80px" }} /> {/* Tamaño y estilo del ícono */}
                <p>Registrar profesores</p>
            </Link>
        </div>
    <Footer />
</>;

export default InicioCargaDatos;