import { useEffect, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import tableStyles from "../../styles/table.module.css";
import Anteproyecto from "../../../controller/anteproyecto";
import Profesor from "../../../controller/profesor";
import { asignarAnteproyectosAProfesores } from "../../../controller/asignacion";
import { loadToast } from "../../components/toast";

const AsignacionAutomatica = () => {
    const [anteproyectos, setAnteproyectos] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [calculando, setCalculando] = useState(false);

    useEffect(() => {
        Anteproyecto.obtenerAsignables().then(setAnteproyectos);
        Profesor.obtenerTodos().then(setProfesores);
    }, []);

    const calcularAsignacion = () => {
        setCalculando(true);
        const asignacion = asignarAnteproyectosAProfesores(anteproyectos, profesores);
        asignacion.finally(() => setCalculando(false));
        loadToast(
            asignacion,
            "Realizando asignación de anteproyectos...",
            "Asignación realizada",
            "Error en asignación !!!"
        );
    }

    return <>
        <Layout title="Asignación Automática de profesores a proyectos">
            <Button onClick={calcularAsignacion} disabled={calculando}>Inicializar asignación</Button>
            <TablaAnteproyectos anteproyectos={anteproyectos}/>
            <TablaProfesores profesores={profesores}/>
        </Layout>
    </>;
}

const TablaAnteproyectos = ({ anteproyectos }) => <>
    <table className={tableStyles.table}>
        <thead>
            <tr className={tableStyles.title}>
                <th colSpan={4}>Anteproyectos asignables</th>
            </tr>
            <tr>
                <th>Estudiante</th>
                <th>Sede</th>
                <th>Empresa</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            {anteproyectos.map((ap, index) =>
                <tr key={`ap-${index}`} className={tableStyles.tableSpace}>
                    <td>{ap.estudiante.nombre}</td>
                    <td>{ap.estudiante.sede}</td>
                    <td>{ap.nombre}</td>
                    <td>{ap.estado}</td>
                </tr>
            )}
        </tbody>
    </table>
</>;

const TablaProfesores = ({ profesores }) => <>
    <table className={tableStyles.table}>
        <thead>
            <tr className={tableStyles.title}>
                <th colSpan={3}>Profesores</th>
            </tr>
            <tr>
                <th>Nombre</th>
                <th>Sede</th>
                <th>Cantidad de proyectos</th>
            </tr>
        </thead>
        <tbody>
            {profesores.map((p, index) =>
                <tr key={`profesor-${index}`} className={tableStyles.tableSpace}>
                    <td>{p.nombre}</td>
                    <td>{p.sede}</td>
                    <td>{p.cantidadProyectos}</td>
                </tr>
            )}
        </tbody>
    </table>
</>;

export default AsignacionAutomatica;