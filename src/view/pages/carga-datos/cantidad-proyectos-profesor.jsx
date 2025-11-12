/**
 * CantidadProyectosProfesor.jsx
 * Permite editar la "cantidad de estudiantes" (antes "cantidadProyectos")
 * que cada profesor puede manejar. Llama a profesor.actualizarCantidadEstudiantes().
 */
import React, { useCallback, useEffect, useState } from "react";
import Profesor from "../../../controller/profesor";
import Proyecto from "../../../controller/Proyecto";
import { loadToast } from "../../components/toast";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";

const CantidadProyectosProfesor = () => {
  console.log('CantidadProyectosProfesor: Component rendering');
  const [profesores, setProfesores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proyectossinProfesor, setProyectossinProfesor] = useState(0);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  useEffect(() => {
    console.log('CantidadProyectosProfesor: useEffect running');
    const fetchProfesores = async () => {
      try {
        const data = await Profesor.obtenerTodos();
        setProfesores(data);
        
        // Obtener cantidad de proyectos sin profesor
        const cantProyectos = await Proyecto.obtenerCantidadProyectossinProfesor();
        setProyectossinProfesor(cantProyectos);
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
    if(profesores[indice].proyectosAsignados > Number(evento.target.value)) {
      alert("La disponibilidad no puede ser menor a los proyectos ya asignados.");
      return;
    }
    profesores[indice].disponibilidad = Number(evento.target.value);
    console.log(profesores[indice].disponibilidad);
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
    
    // Mostrar alerta visual
    setMostrarAlerta(true);
    // Ocultar alerta después de 5 segundos
    setTimeout(() => {
      setMostrarAlerta(false);
    }, 5000);
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
      {/* Alerta de guardado */}
      {mostrarAlerta && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center space-x-3 max-w-sm">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                ✓ Cambios guardados
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Header title="Cantidad de Proyectos por Profesor" />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Enhanced responsive title section */}
          <div className="mb-6 space-y-2">
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Cantidad de Proyectos por Profesor
              </h2>
              
              {/* Badge flotante pequeño - esquina superior derecha */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-lg shadow-md p-2 hover:shadow-lg transition-shadow duration-200 w-14 h-14 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold leading-none">{proyectossinProfesor}</div>
                  <div className="text-xs font-semibold leading-tight">sin asignar</div>
                </div>
              </div>
            </div>
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
                      Disponibilidad
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Proyectos Asignados
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
                          value={profesor.disponibilidad}
                          onChange={(e) => actualizarCantidad(i, e)}
                          min="0"
                          max="20"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {profesor.proyectosAsignados}
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
