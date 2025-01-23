/**
 * CantidadProyectosProfesor.jsx
 * Permite editar la "cantidad de estudiantes" (antes "cantidadProyectos")
 * que cada profesor puede manejar. Llama a profesor.actualizarCantidadEstudiantes().
 */
import React, { useCallback, useEffect, useState } from "react";
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
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-6">Cantidad de Proyectos por Profesor</h1>
      <div className="overflow-x-auto max-w-2xl mx-auto bg-white rounded shadow p-4">
        <table className="min-w-full table-auto">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-2 text-left">Profesor</th>
              <th className="px-4 py-2 text-left">Cantidad Estudiantes</th>
            </tr>
          </thead>
          <tbody>
            {profesores.map((profesor, i) => (
              <tr key={profesor.profesor_id} className="border-b">
                <td className="px-4 py-2">{profesor.nombre}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={profesor.cantidadEstudiantes}
                    className="border border-gray-300 rounded px-2 py-1 w-20"
                    onChange={(event) => actualizarCantidad(i, event)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={guardarCambios}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default CantidadProyectosProfesor;
