import { useCallback, useEffect, useState } from "react";
import Button from "../../components/button";
import Layout from "../../components/layout";
import { FloatInput } from "../../components/input";
import styles from "../../styles/table.module.css";
import Profesor from "../../../controller/profesor";
import { loadToast } from "../../components/toast";

const CantidadProyectosProfesor = () => {
    const [profesores, setProfesores] = useState([]);

    useEffect(() => {
        Profesor.obtenerTodos().then(setProfesores);
    }, []);

    const actualizarCantidad = useCallback((indice, evento) => {
        profesores[indice].cantidadProyectos = Number(evento.target.value);
        setProfesores([...profesores]);
    }, [profesores]);

    const guardarCambios = useCallback(() => {
        const guardado = Promise.allSettled(profesores.map(p => p.actualizarCantidadProyectos()));
        loadToast(guardado, "Guardando cambios...", "Cambios guardados.", "Error en guardado de cambios");
    }, [profesores]);

    return <>
        <Layout title="Asignación de cantidad de proyectos por profesor">
            <Button type="dark" onClick={guardarCambios}>Guardar cambios</Button>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Profesor</th>
                        <th>Cantidad de proyectos</th>
                    </tr>
                </thead>
                <tbody>
                    {profesores.map((profesor, i) =>
                        <tr key={`profesor-${i}`}>
                            <td>{profesor.nombre}</td>
                            <td>
                                <FloatInput text="">
                                    <input
                                        type="number"
                                        value={profesor.cantidadProyectos}
                                        onChange={evento => actualizarCantidad(i, evento)}
                                    />
                                </FloatInput>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Layout>
    </>;
}

export default CantidadProyectosProfesor;