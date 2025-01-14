/**
 * CantidadProyectosProfesor.jsx
 * Permite editar la "cantidad de estudiantes" (antes "cantidadProyectos")
 * que cada profesor puede manejar. Llama a profesor.actualizarCantidadEstudiantes().
 */
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

  // Actualiza en tiempo real la propiedad "cantidadEstudiantes"
  const actualizarCantidad = useCallback((indice, evento) => {
    profesores[indice].cantidadEstudiantes = Number(evento.target.value);
    setProfesores([...profesores]);
  }, [profesores]);

  // Guarda cambios en BD (llama p.actualizarCantidadEstudiantes())
  const guardarCambios = useCallback(() => {
    const guardado = Promise.allSettled(
      profesores.map((p) => p.actualizarCantidadEstudiantes())
    );
    loadToast(
      guardado,
      "Guardando cambios...",
      "Cambios guardados.",
      "Error en guardado de cambios"
    );
  }, [profesores]);

  return (
    <Layout title="Asignación de cantidad de proyectos por profesor">
      <Button onClick={guardarCambios}>Guardar cambios</Button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Profesor</th>
            <th>Cantidad de estudiantes</th>
          </tr>
        </thead>
        <tbody>
          {profesores.map((profesor, i) => (
            <tr key={`profesor-${i}`}>
              <td>{profesor.nombre}</td>
              <td>
                <FloatInput text="">
                  <input
                    type="number"
                    value={profesor.cantidadEstudiantes}
                    onChange={(evento) => actualizarCantidad(i, evento)}
                  />
                </FloatInput>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default CantidadProyectosProfesor;
