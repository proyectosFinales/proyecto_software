import { useEffect, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import styles from "../../styles/table.module.css";
import Anteproyecto from "../../../controller/anteproyecto";
import GenerarPDFAnteproyecto from "./pdf";

const Anteproyectos = () => {
    const [anteproyectos, setAnteproyectos] = useState([]);

    useEffect(() => {
        Anteproyecto.obtenerTodos().then(setAnteproyectos);
    }, []);

    return <>
        <Layout title="Anteproyectos">
            <Button>Generar reporte de anteproyectos</Button>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Propuesta de Proyecto</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {anteproyectos.map((ap, index) =>
                        <tr key={`anteproyecto-${index}`}>
                            <td>{ap.estudiante.nombre}</td>
                            <td>{ap.nombre}</td>
                            <td className={styles.tableButtons}>
                                <Button>Revisar</Button>
                                <GenerarPDFAnteproyecto anteproyecto={ap}/>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    </>;
}

export default Anteproyectos;