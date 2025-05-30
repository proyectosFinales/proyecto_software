import { useEffect, useRef, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import tableStyles from "../../styles/table.module.css";
import listStyles from "../../styles/list.module.css";
import Anteproyecto from "../../../controller/anteproyecto";
import Profesor from "../../../controller/profesor";
import { asignarAnteproyectosAProfesores } from "../../../controller/asignacion";
import { errorToast, loadToast, successToast } from "../../components/toast";
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
            modalRef.open();
            setAsignaciones(resultado);
        });
        asignacion.finally(() => setCalculando(false));
    }

    const guardarAsignacion = () => {
        const guardado = Promise.all(asignaciones.asignados.map(ap => ap.guardarAsignacion()));
        guardado.then(() => {
            modalRef.close();
            successToast("Asignaciones de anteproyectos guardadas.");
        });
        guardado.catch(() => errorToast("Error en guardado de asignaciones de anteproyectos."));
    }

    return <>
        <Layout title="Asignación Automática de profesores a proyectos">
            <Button onClick={calcularAsignacion} disabled={calculando}>Inicializar asignación</Button>
            <TablaAnteproyectos title="Anteproyectos asignables" anteproyectos={anteproyectos}/>
            <TablaProfesores profesores={profesores}/>
            <Modal
                title="Asignación Calculada"
                modalRef={modalRef}
                footer={<Button onClick={guardarAsignacion}>Guardar asignaciones</Button>}
            >
                <Button onClick={guardarAsignacion}>Guardar asignaciones</Button>
                <DetalleAsignaciones asignaciones={asignaciones}/>
            </Modal>
        </Layout>
    </>;
}

const DetalleAsignaciones = ({ asignaciones }) => <>
    {asignaciones.noasignados.length ?
        <p className="precaucion">Quedaron anteproyectos sin asignar debido a incompatibilidades como Sede, No disponibilidad de profesores o Repetición con encargados anteriores!!! (Estos anteproyectos pueden ser asignados de manera manual en la edición de asignaciones).</p>
    : ""}
    <ul className={listStyles.list}>
        <li className={listStyles.title}>Anteproyectos asignados</li>
        {asignaciones.asignados.map((anteproyecto, index) =>
        <li key={`asignado-${index}`}>
                <ElementoDatosAnteproyecto anteproyecto={anteproyecto}/>
                <hr/>
                <p><label>Profesor asignado:</label> {anteproyecto.encargado.nombre}</p>
                <p><label>Sede:</label> {anteproyecto.encargado.sede}</p>
            </li>
        )}
    </ul>
    <TablaAnteproyectos title="Anteproyectos no asignados" anteproyectos={asignaciones.noasignados}/>
</>;

const TablaAnteproyectos = ({ title, anteproyectos }) => <>
    <ul className={listStyles.list}>
        <li className={listStyles.title}>{title}</li>
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
    <p><label>Empresa:</label> {anteproyecto.nombreEmpresa}</p>
    <p><label>Estado:</label> {anteproyecto.estado}</p>
    <p>
        <label>Encargados anteriores:</label>{" "}
        {anteproyecto.anteproyectosPerdidos.map(ap => ap.encargado.nombre).join(", ") || "-"}
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