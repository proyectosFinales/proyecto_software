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
    <div className="min-h-screen flex flex-col p-6 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Cantidad de Proyectos por Profesor</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
        <table className="min-w-full text-left border">
          <thead className="border-b bg-gray-100">
            <tr>
              <th className="px-4 py-2 font-medium">Profesor</th>
              <th className="px-4 py-2 font-medium">Cantidad Estudiantes</th>
            </tr>
          </thead>
          <tbody>
            {profesores.map((profesor, i) => (
              <tr key={profesor.profesor_id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{profesor.nombre}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className="w-20 border rounded p-1 focus:outline-none"
                    value={profesor.cantidadEstudiantes}
                    onChange={(e) => actualizarCantidad(i, e)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={guardarCambios}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default CantidadProyectosProfesor;
