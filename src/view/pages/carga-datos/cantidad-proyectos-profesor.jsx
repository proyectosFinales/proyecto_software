/**
 * CantidadProyectosProfesor.jsx
 * Permite editar la "cantidad de estudiantes" (antes "cantidadProyectos")
 * que cada profesor puede manejar. Llama a profesor.actualizarCantidadEstudiantes().
 */
import React, { useCallback, useEffect, useState } from "react";
import Profesor from "../../../controller/profesor";
import { loadToast } from "../../components/toast";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";

const CantidadProyectosProfesor = () => {
  console.log('CantidadProyectosProfesor: Component rendering');
  const [profesores, setProfesores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('CantidadProyectosProfesor: useEffect running');
    const fetchProfesores = async () => {
      try {
        const data = await Profesor.obtenerTodos();
        setProfesores(data);
      } catch (err) {
        console.error('Error fetching professors:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfesores();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="text-base sm:text-lg font-semibold text-gray-600 animate-pulse">
          Cargando profesores...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <div className="text-base sm:text-lg font-semibold text-red-600">
            Error: {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors duration-200 text-sm sm:text-base"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header title="Cantidad de Proyectos por Profesor" />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Enhanced responsive title section */}
          <div className="mb-6 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Cantidad de Proyectos por Profesor
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Ajuste la cantidad máxima de estudiantes que cada profesor puede supervisar.
            </p>
          </div>

          {/* Enhanced responsive table section */}
          <div className="overflow-x-auto bg-white rounded-lg shadow -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Profesor
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad Estudiantes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profesores.map((profesor, i) => (
                    <tr 
                      key={profesor.profesor_id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {profesor.nombre}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-16 sm:w-20 px-2 sm:px-3 py-1 sm:py-2 border rounded-md 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                                   text-xs sm:text-sm"
                          value={profesor.cantidadEstudiantes}
                          onChange={(e) => actualizarCantidad(i, e)}
                          min="0"
                          max="20"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced responsive action buttons */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={guardarCambios}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition-colors duration-200 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:ring-offset-2 text-sm sm:text-base"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CantidadProyectosProfesor;
