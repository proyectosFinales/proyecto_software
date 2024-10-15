import { useEffect, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import tableStyles from "../../styles/table.module.css";
import Anteproyecto from "../../../controller/anteproyecto";

const AsignacionAutomatica = () => {
    const [anteproyectos, setAnteproyectos] = useState([]);

    useEffect(() => {
        Anteproyecto.obtenerTodos().then(setAnteproyectos);
    }, []);

    return <>
        <Layout title="Asignación Automática de profesores a proyectos">
            <Button>Inicializar asignación</Button>
            <table className={tableStyles.table}>
                <thead>

                    <tr>
                        <th>Estudiante</th>
                        <th>Empresa</th>
                    </tr>
                </thead>
                <tbody>
                    {anteproyectos.map((ap, index) =>
                        <tr key={`ap-${index}`}>
                            <td className={tableStyles.tableSpace}>{ap.estudiante.nombre}</td>
                            <td className={tableStyles.tableSpace}>{ap.nombre}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    </>;
}

export default AsignacionAutomatica;