import { useEffect, useRef, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import tableStyles from "../../styles/table.module.css";
import listStyles from "../../styles/list.module.css";
import Anteproyecto from "../../../controller/anteproyecto";
import Profesor from "../../../controller/profesor";
import { asignarAnteproyectosAProfesores } from "../../../controller/asignacion";
import { loadToast } from "../../components/toast";
import Modal from "../../components/modal.jsx";

const AsignacionAutomatica = () => {
    const [anteproyectos, setAnteproyectos] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [calculando, setCalculando] = useState(false);
    const [asignaciones, setAsignaciones] = useState({asignados: [], noasignados: []});
    const modalRef = useRef({});

    useEffect(() => {
        Anteproyecto.obtenerAsignables().then(setAnteproyectos);
        Profesor.obtenerTodos().then(setProfesores);
    }, []);

    const calcularAsignacion = () => {
        setCalculando(true);
        const asignacion = asignarAnteproyectosAProfesores(anteproyectos, profesores);
        asignacion.then(resultado => {
            console.log(resultado);
            modalRef.open();
            setAsignaciones(resultado);
        });
        asignacion.finally(() => setCalculando(false));
        loadToast(
            asignacion,
            "Realizando asignación de anteproyectos...",
            "Asignación calculada",
            "Error en asignación !!!"
        );
    }

    return <>
        <Layout title="Asignación Automática de profesores a proyectos">
            <Button onClick={calcularAsignacion} disabled={calculando}>Inicializar asignación</Button>
            <TablaAnteproyectos anteproyectos={anteproyectos}/>
            <TablaProfesores profesores={profesores}/>
            <Modal title="Asignación Calculada" modalRef={modalRef}>
                <ul className={listStyles.list}>
                    <li>Anteproyectos asignados</li>
                    {asignaciones.asignados.map((anteproyecto, index) =>
                        <li>
                            <ElementoDatosAnteproyecto anteproyecto={anteproyecto}/>
                            <hr/>
                            <p><label>Profesor asignado:</label> {anteproyecto.encargado.nombre}</p>
                        </li>
                    )}
                </ul>
            </Modal>
        </Layout>
    </>;
}

const TablaAnteproyectos = ({ anteproyectos }) => <>
    <ul className={listStyles.list}>
        <li className={listStyles.title}>Anteproyectos asignables</li>
        {anteproyectos.map((ap, index) =>
            <li key={`ap-${index}`}>
                <ElementoDatosAnteproyecto anteproyecto={ap}/>     
            </li>
        )}
    </ul>
</>;

const ElementoDatosAnteproyecto = ({ anteproyecto }) => <>
    <p><label>Estudiante:</label> {anteproyecto.estudiante.nombre}</p>
    <p><label>Sede:</label> {anteproyecto.estudiante.sede}</p>
    <p><label>Empresa:</label> {anteproyecto.nombre}</p>
    <p><label>Estado:</label> {anteproyecto.estado}</p>
    <p>
        <label>Encargados anteriores:</label>{" "}
        {anteproyecto.anteproyectosPerdidos.map(ap => ap.profesor.nombre).join(", ") || "-"}
    </p>
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