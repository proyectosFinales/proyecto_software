import { useEffect, useRef, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import styles from "../../styles/table.module.css";
import Profesor from "../../../controller/profesor";
import Modal from "../../components/modal.jsx";
import Anteproyecto from "../../../controller/anteproyecto";
import { FloatInput } from "../../components/input.jsx";
import { errorToast, successToast } from "../../components/toast";

const EdicionAsignacionProyectos = () => {
    const [profesores, setProfesores] = useState([]);

    useEffect(() => {
        actualizarProfesores();
    }, []);
    
    const actualizarProfesores = () => Profesor.obtenerEncargados().then(setProfesores);

    /** @param {Anteproyecto} anteproyecto */
    const desencargarAnteproyecto = async (anteproyecto) => {
        if(!window.confirm(`Remover la asignación del proyecto de ${anteproyecto.estudiante.nombre}?`)) return;
        anteproyecto.encargado = null;
        await anteproyecto.guardarAsignacion();
        successToast(`La asignación del proyecto de ${anteproyecto.estudiante.nombre} fue removida`);
        actualizarProfesores();
    }

    return <>
        <Layout title="Edición de asignación de proyectos">
            <Button>Generar reporte de asignaciones</Button>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Profesor</th>
                        <th>Estudiantes</th>
                    </tr>
                </thead>
                <tbody>
                    {profesores.map((profesor, i) =>
                        <tr key={`profesor-${i}`}>
                            <td>{profesor.nombre}</td>
                            <td>
                                <ul className="anteproyectos-profesores">
                                    {profesor.anteproyectos.map((ap, j) =>
                                        <li key={`anteproyecto-${j}-profesor-${i}`}>
                                            <button onClick={() => desencargarAnteproyecto(ap)}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                            <span>{ap.estudiante.nombre}</span>
                                        </li>
                                    )}
                                    <AdicionAnteproyectoProfesor profesor={profesor} onAdicion={actualizarProfesores}/>
                                </ul>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    </>;
}

const AdicionAnteproyectoProfesor = ({ profesor, onAdicion }) => {
    const modalRef = useRef({});
    const [anteproyectos, setAnteproyectos] = useState([]);
    const [seleccionado, setSeleccionado] = useState("");

    const abrir = async () => {
        const asignables = await Anteproyecto.obtenerAsignables();
        setAnteproyectos(asignables);
        modalRef.open();
    }

    const agregar = async () => {
        if(!seleccionado) {
            errorToast("Selecciona un proyecto a asignar");
            return;
        }
        /** @type {Anteproyecto} */
        const anteproyectoSeleccionado = anteproyectos.find(ap => ap.id === seleccionado);
        anteproyectoSeleccionado.encargado = profesor;
        await anteproyectoSeleccionado.guardarAsignacion();
        onAdicion();
        successToast("Proyecto agregado");
        setSeleccionado("");
        modalRef.close();
    }

    return <>
        <Button onClick={abrir}>Agregar proyecto</Button>
        <Modal
            title={`Adición de proyecto a ${profesor.nombre}`}
            modalRef={modalRef}
            footer={<Button onClick={agregar}>Agregar</Button>}
        >
            <FloatInput text="Anteproyectos disponibles">
                <select
                    value={seleccionado}
                    onChange={event => setSeleccionado(event.target.value)}
                >
                    <option disabled value="">Seleccione un anteproyecto</option>
                    {anteproyectos.map((ap, index) =>
                        <option key={`anteproyecto-asignable-${index}`} value={ap.id}>
                            {ap.estudiante.nombre}
                        </option>
                    )}
                </select>
            </FloatInput>
        </Modal>
    </>;
}

export default EdicionAsignacionProyectos;