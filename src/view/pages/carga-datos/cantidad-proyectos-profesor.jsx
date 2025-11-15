/**
 * CantidadProyectosProfesor.jsx
 * Permite editar la "cantidad de estudiantes" (antes "cantidadProyectos")
 * que cada profesor puede manejar. Llama a profesor.actualizarCantidadEstudiantes().
 */
import React, { useCallback, useEffect, useState } from "react";
import { obtenerProyectosDetalladosProfesor } from '../../../controller/obtenerProyectosDetalladosProfesor';
import Profesor from "../../../controller/profesor";
import Proyecto from "../../../controller/Proyecto";
import { loadToast } from "../../components/toast";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";
import supabase from "../../../model/supabase";

const CantidadProyectosProfesor = () => {
  const [profesorExpandido, setProfesorExpandido] = useState(null); // profesor_id
  const [proyectosExpandido, setProyectosExpandido] = useState([]); // proyectos del profesor expandido
  console.log('CantidadProyectosProfesor: Component rendering');
  const [profesores, setProfesores] = useState([]);
  const [filtroSemestre, setFiltroSemestre] = useState(() => {
    const mes = new Date().getMonth() + 1;
    return mes <= 7 ? "1" : "2";
  });
  const [filtroAno, setFiltroAno] = useState(() => String(new Date().getFullYear()));
  const [profesoresFiltrados, setProfesoresFiltrados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proyectossinProfesor, setProyectossinProfesor] = useState(0);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState({ campo: null, direccion: 'asc' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    console.log('CantidadProyectosProfesor: useEffect running');
    const fetchProfesores = async () => {
      try {
        const data = await Profesor.obtenerTodos();
        setProfesores(data);
        setProfesoresFiltrados(data);
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

  useEffect(() => {
    let filtrados = profesores;
    if (filtroSemestre) {
      filtrados = filtrados.filter(p => String(p.semestre) === String(filtroSemestre));
    }
    if (filtroAno) {
      filtrados = filtrados.filter(p => String(p.año) === String(filtroAno));
    }
    
    // Filtro de búsqueda por texto
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtrados = filtrados.filter((prof) => {
        const nombre = prof.nombre?.toLowerCase() || '';
        const categoria = prof.categoria?.toLowerCase() || '';
        const profesorId = String(prof.profesor_id || '').toLowerCase();
        
        return (
          nombre.includes(lowerSearchText) ||
          categoria.includes(lowerSearchText) ||
          profesorId.includes(lowerSearchText)
        );
      });
    }
    
    // Aplicar ordenamiento
    if (ordenamiento.campo) {
      filtrados = [...filtrados].sort((a, b) => {
        let valorA = a[ordenamiento.campo];
        let valorB = b[ordenamiento.campo];
        
        // Convertir a string para comparación alfabética si es texto
        if (ordenamiento.campo === 'nombre') {
          valorA = String(valorA).toLowerCase();
          valorB = String(valorB).toLowerCase();
        }
        
        if (valorA < valorB) return ordenamiento.direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenamiento.direccion === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setProfesoresFiltrados(filtrados);
  }, [filtroSemestre, filtroAno, profesores, ordenamiento, searchText]);

  // Actualiza en tiempo real la propiedad "cantidadEstudiantes"
  const actualizarCantidad = useCallback((profesor, evento) => {
    if(profesor.proyectosAsignados > Number(evento.target.value)) {
      alert("La disponibilidad no puede ser menor a los proyectos ya asignados.");
      return;
    }
    // Encontrar el índice del profesor en la lista completa
    const indice = profesores.findIndex(p => 
      p.profesor_id === profesor.profesor_id && 
      p.semestre === profesor.semestre && 
      p.año === profesor.año
    );
    
    if (indice !== -1) {
      profesores[indice].disponibilidad = Number(evento.target.value);
      setProfesores([...profesores]);
    }
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

  // Manejar ordenamiento de columnas
  const handleOrdenar = (campo) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Renderizar ícono de ordenamiento
  const renderIconoOrdenamiento = (campo) => {
    if (ordenamiento.campo !== campo) {
      return (
        <svg className="inline-block w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return ordenamiento.direccion === 'asc' ? (
      <svg className="inline-block w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="inline-block w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Función para eliminar asignación de profesor en un semestre específico
  const eliminarAsignacionProfesor = async (profesor) => {
    try {
      // Primera confirmación
      if (!window.confirm(`¿Está seguro que desea eliminar la asignación del profesor "${profesor.nombre}" para el semestre ${profesor.semestre}/${profesor.año}?`)) {
        return;
      }

      // Verificar si tiene proyectos asignados en ESTE semestre/año específico
      const { data: asignacion, error: errorAsignacion } = await supabase
        .from('AsignacionesProfesor')
        .select('asignados')
        .eq('idProfesor', profesor.profesor_id)

        .eq('semestre', profesor.semestre)
        .eq('año', profesor.año)
        .single();

      if (errorAsignacion) {
        throw new Error(`Error al verificar asignación: ${errorAsignacion.message}`);
      }

      if (asignacion && asignacion.asignados > 0) {
        alert(`No se puede eliminar la asignación porque el profesor tiene ${asignacion.asignados} proyecto(s) asignado(s) en este semestre.`);
        return;
      }

      // Segunda confirmación
      if (!window.confirm(`CONFIRMACIÓN FINAL: ¿Realmente desea eliminar la asignación del profesor "${profesor.nombre}" para el semestre ${profesor.semestre}/${profesor.año}?`)) {
        return;
      }

      console.log(`Eliminando asignación del profesor ${profesor.profesor_id} para semestre ${profesor.semestre}/${profesor.año}...`);

      // Eliminar la asignación específica
      const { error: errorEliminar } = await supabase
        .from('AsignacionesProfesor')
        .delete()
        .eq('idProfesor', profesor.profesor_id)
        .eq('semestre', profesor.semestre)
        .eq('año', profesor.año);

      if (errorEliminar) {
        throw new Error(`Error al eliminar asignación: ${errorEliminar.message}`);
      }

      console.log('Asignación eliminada exitosamente');

      alert(`Asignación del profesor "${profesor.nombre}" para el semestre ${profesor.semestre}/${profesor.año} eliminada exitosamente.`);

      // Recargar la lista de profesores
      const data = await Profesor.obtenerTodos();
      setProfesores(data);
      setProfesoresFiltrados(data);

    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      alert(`Error al eliminar asignación: ${error.message}`);
    }
  };

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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 animate-in slide-in-from-top-2 duration-300 pointer-events-none">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center space-x-3 max-w-sm pointer-events-auto">
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
              <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-lg shadow-md p-2 hover:shadow-lg transition-shadow duration-200 w-44 h-14 flex items-center justify-center">
                <div className="flex flex-col items-center w-full">
                  <div className="text-lg font-bold leading-none">{proyectossinProfesor}</div>
                  <div className="text-xs sm:text-sm font-semibold leading-tight w-full text-center">Proyectos sin asignar</div>
                </div>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Ajuste la cantidad máxima de estudiantes que cada profesor puede supervisar.
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <input
              type="text"
              className="border border-gray-300 rounded py-2 px-4 w-full sm:w-1/2"
              placeholder="Buscar profesores por nombre, categoría o ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Filtros */}
          <div className="mb-2 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">Semestre</label>
              <select
                value={filtroSemestre}
                onChange={e => setFiltroSemestre(e.target.value)}
                className="px-3 py-2 border rounded-lg text-base min-w-[90px] text-center"
                style={{ fontSize: '1.05rem', height: '42px', maxWidth: '120px' }}
              >
                <option value="">Todos</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">Año</label>
              <select
                value={filtroAno}
                onChange={e => setFiltroAno(e.target.value)}
                className="px-3 py-2 border rounded-lg text-base min-w-[100px] text-center"
                style={{ fontSize: '1.05rem', height: '42px', maxWidth: '130px' }}
              >
                <option value="">Todos</option>
                {(() => {
                  const anioActual = new Date().getFullYear();
                  const listaAnios = [];
                  for (let i = 1; i >= -5; i--) {
                    listaAnios.push(anioActual + i);
                  }
                  return listaAnios.map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ));
                })()}
              </select>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
              style={{ minHeight: '42px' }}
              onClick={() => {
                if (profesoresFiltrados.length === 0) return;
                const encabezados = [
                  'ID Profesor', 'Profesor', 'Disponibilidad', 'Proyectos Asignados', 'Semestre', 'Año'
                ];
                const filas = profesoresFiltrados.map(p => [
                  p.profesor_id,
                  p.nombre,
                  p.disponibilidad,
                  p.proyectosAsignados,
                  p.semestre,
                  p.año
                ]);
                const csvContent = [
                  encabezados.join(','),
                  ...filas.map(fila => fila.map(valor => `"${String(valor).replace(/"/g, '""')}` + '"').join(','))
                ].join('\r\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'reporte_cantidad_proyectos_profesor.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              disabled={profesoresFiltrados.length === 0}
            >
              Descargar reporte CSV
            </button>
          </div>
          {/* Mensaje de advertencia si el filtro no es editable */}
          {(() => {
            const fecha = new Date();
            const anoActual = fecha.getFullYear();
            const mes = fecha.getMonth() + 1;
            const semestreActual = mes <= 7 ? 1 : 2;
            
            // Calcular el siguiente semestre y año
            let semestreSiguiente, anoSiguiente;
            if (semestreActual === 1) {
              semestreSiguiente = 2;
              anoSiguiente = anoActual;
            } else {
              semestreSiguiente = 1;
              anoSiguiente = anoActual + 1;
            }
            
            const esEditable = 
              (Number(filtroSemestre) === semestreActual && Number(filtroAno) === anoActual) ||
              (Number(filtroSemestre) === semestreSiguiente && Number(filtroAno) === anoSiguiente);
            
            if (filtroSemestre && filtroAno && !esEditable) {
              return (
                <div className="mb-4 text-xs text-red-600">
                  Solo se puede editar la disponibilidad en el semestre actual ({semestreActual}/{anoActual}) y el siguiente ({semestreSiguiente}/{anoSiguiente}).
                </div>
              );
            }
            return null;
          })()}

          {/* Enhanced responsive table section */}
          <div className="overflow-x-auto bg-white rounded-lg shadow -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleOrdenar('nombre')}
                    >
                      Profesor {renderIconoOrdenamiento('nombre')}
                    </th>
                    
                    <th 
                      className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleOrdenar('disponibilidad')}
                    >
                      Disponibilidad {renderIconoOrdenamiento('disponibilidad')}
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleOrdenar('proyectosAsignados')}
                    >
                      Proyectos Asignados {renderIconoOrdenamiento('proyectosAsignados')}
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleOrdenar('semestre')}
                    >
                      Semestre {renderIconoOrdenamiento('semestre')}
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleOrdenar('año')}
                    >
                      Año {renderIconoOrdenamiento('año')}
                    </th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profesoresFiltrados.map((profesor, i) => {
                    // Determinar semestre y año actual y siguiente
                    const fecha = new Date();
                    const anoActual = fecha.getFullYear();
                    const mes = fecha.getMonth() + 1; // Enero = 1
                    const semestreActual = mes <= 7 ? 1 : 2;
                    
                    // Calcular el siguiente semestre y año
                    let semestreSiguiente, anoSiguiente;
                    if (semestreActual === 1) {
                      semestreSiguiente = 2;
                      anoSiguiente = anoActual;
                    } else {
                      semestreSiguiente = 1;
                      anoSiguiente = anoActual + 1;
                    }
                    
                    // Permitir editar si es el semestre actual o el siguiente
                    const esEditable = 
                      (Number(profesor.año) === anoActual && Number(profesor.semestre) === semestreActual) ||
                      (Number(profesor.año) === anoSiguiente && Number(profesor.semestre) === semestreSiguiente);
                    
                    // Crear clave única combinando profesor_id + semestre + año
                    const claveUnica = `${profesor.profesor_id}-${profesor.semestre}-${profesor.año}`;
                    
                    return (
                      <React.Fragment key={claveUnica}>
                        <tr 
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span>{profesor.nombre}</span>
                              <button
                                onClick={() => eliminarAsignacionProfesor(profesor)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full p-1 transition-colors duration-200"
                                title={`Eliminar asignación del semestre ${profesor.semestre}/${profesor.año}`}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              className="w-16 sm:w-20 px-2 sm:px-3 py-1 sm:py-2 border rounded-md 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       text-xs sm:text-sm"
                              value={profesor.disponibilidad}
                              onChange={e => esEditable && actualizarCantidad(profesor, e)}
                              min="0"
                              max="20"
                              disabled={!esEditable}
                              style={!esEditable ? { backgroundColor: '#f3f4f6', color: '#a1a1aa', cursor: 'not-allowed' } : {}}
                            />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-medium text-gray-900">
                            {profesor.proyectosAsignados}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-medium text-gray-900">
                            {profesor.semestre}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center text-xs sm:text-sm font-medium text-gray-900">
                            {profesor.año}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                            <button
                              className={`px-3 py-1 rounded text-xs font-semibold ${profesor.proyectosAsignados === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                              disabled={profesor.proyectosAsignados === 0}
                              onClick={async () => {
                                if (profesor.proyectosAsignados === 0) return;
                                if (profesorExpandido === claveUnica) {
                                  setProfesorExpandido(null);
                                  setProyectosExpandido([]);
                                } else {
                                  setProfesorExpandido(claveUnica);
                                  try {
                                    const proyectos = await obtenerProyectosDetalladosProfesor(profesor.profesor_id);
                                    setProyectosExpandido(proyectos);
                                  } catch (e) {
                                    setProyectosExpandido([]);
                                  }
                                }
                              }}
                            >
                              Ver proyectos
                            </button>
                          </td>
                        </tr>
                        {/* Fila expandida para proyectos asignados */}
                        {profesorExpandido === claveUnica && proyectosExpandido.length > 0 && (
                          <tr key={claveUnica + "-expandido"}>
                            <td colSpan={6} className="bg-blue-50 px-6 py-2">
                              <div className="font-bold text-blue-900 mb-2">Proyectos asignados</div>
                              <div className="space-y-2">
                                {proyectosExpandido.map((proy) => (
                                  <div key={proy.id} className="flex flex-wrap items-center justify-between border-b border-blue-200 py-1">
                                    <div className="flex-1 min-w-[120px] font-medium text-blue-900">
                                      Estudiante: {proy.estudiante?.nombre || 'Sin nombre'}
                                    </div>
                                    <div className="flex-1 min-w-[120px] text-blue-800">
                                      Empresa: {proy.empresa?.nombre || 'Sin empresa'}
                                    </div>
                                    <button
                                      className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold"
                                      onClick={() => window.location.href = `/verProyecto?id=${proy.id}`}
                                    >
                                      Ver
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
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
