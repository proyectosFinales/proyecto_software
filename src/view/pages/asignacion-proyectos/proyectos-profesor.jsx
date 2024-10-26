import { useEffect, useState } from "react";
import Profesor from "../../../controller/profesor";
import Layout from "../../components/layout";
import tableStyles from "../../styles/table.module.css";

const ProyectosAsignadosProfesor = () => {
    const [anteproyectos, setAnteproyectos] = useState([]);
    
    useEffect(() => {
        const profesorID = localStorage.getItem("token");
        Profesor.fromID(profesorID).then(profesor => setAnteproyectos(profesor.anteproyectos));
    }, []);

    return <>
        <Layout title="Proyecto asignados a profesor">
            <table className={tableStyles.table}>
                <thead>
                    <tr>
                        <th>Empresa</th>
                        <th>Estudiante</th>
                        <th>Carnet</th>
                        <th>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    {anteproyectos.map((anteproyecto, index) =>
                        <tr key={`anteproyecto-${index}`} className={tableStyles.tableSpace}>
                            <td>{anteproyecto.nombreEmpresa}</td>
                            <td>{anteproyecto.estudiante.nombre}</td>
                            <td>{anteproyecto.estudiante.carnet}</td>
                            <td>{anteproyecto.estudiante.telefono}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    </>;
}

export default ProyectosAsignadosProfesor;