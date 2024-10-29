import { useEffect, useState } from "react";
import Profesor from "../../../controller/profesor";
import Layout from "../../components/layout";
import listStyles from "../../styles/list.module.css";
import SidebarProfesor from "../../components/SidebarProfesor";
import SettingsCoordinador from "../../components/SettingsProfesor";

const ProyectosAsignadosProfesor = () => {
    const [anteproyectos, setAnteproyectos] = useState([]);
    
    useEffect(() => {
        const profesorID = localStorage.getItem("token");
        Profesor.fromID(profesorID).then(profesor => setAnteproyectos(profesor.anteproyectos));
    }, []);

    return <>
        <Layout title="Proyecto asignados a profesor" Sidebar={SidebarProfesor} Settings={SettingsCoordinador}>
            <ul className={listStyles.list}>
                <li className={listStyles.title}>Anteproyectos asignados</li>
                {anteproyectos.map((anteproyecto, index) =>
                    <li key={`anteproyecto-${index}`}>
                        <p><label>Empresa:</label> {anteproyecto.nombreEmpresa}</p>
                        <p><label>Estudiante:</label> {anteproyecto.estudiante.nombre}</p>
                        <p><label>Correo:</label> {anteproyecto.estudiante.correo}</p>
                        <p><label>Carnet:</label> {anteproyecto.estudiante.carnet}</p>
                        <p><label>Teléfono:</label> {anteproyecto.estudiante.telefono}</p>
                    </li>
                )}
            </ul>
        </Layout>
    </>;
}

export default ProyectosAsignadosProfesor;