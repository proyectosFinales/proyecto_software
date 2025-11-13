/**
 * EdicionAsignacionProyectos.jsx
 * Ventana para asignar manualmente Anteproyectos a profesores,
 * ver reporte, deasignar, etc.
 */
import React, { useEffect, useState, useRef } from "react";
import Anteproyecto from "../../../controller/anteproyecto";
import Button from "../../components/button";
import Modal from "../../components/modal.jsx";
import { FloatInput } from "../../components/input.jsx";
import { errorToast, successToast } from "../../components/toast";
import supabase from "../../../model/supabase";
import HeaderCoordinador from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";
import Profesor from "../../../controller/profesor.js";
import { fetchSemestreActual } from "../../../controller/Semestre";

/**
 * EdicionAsignacionProyectos
 * Muestra proyectos (Proyecto) y los profesores (Profesor) para asignar o desasignar.
 * - Proyecto.profesor_id -> la relación con Profesor (profesor_id).
 * - Profesor.id_usuario, etc.
 * 
 * @returns JSX
 */
function EdicionAsignacionProyectos() {
  // Obtener semestre y año actual igual que en HeaderCoordinador
  const fecha = new Date();
  const anoActual = fecha.getFullYear();
  const mes = fecha.getMonth() + 1;
  const semestreActual = mes <= 7 ? 1 : 2;
  const [proyectos, setProyectos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [filteredProfesores, setFilteredProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  // Filtros de semestre y año
  const [filtroSemestre, setFiltroSemestre] = useState(semestreActual);
  const [filtroAno, setFiltroAno] = useState(anoActual);

  /**
   * Carga la lista de proyectos y profesores.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: proyectosData, error: proyectosError } = await supabase
          .from("Proyecto")
          .select(`
            id,
            profesor_id,
            estudiante_id,
            anteproyecto_id,
            estado,
            fecha_inicio,
            fecha_fin,
            semestre,
            año,
            Estudiante:estudiante_id (
              estudiante_id,
              carnet,
              Usuario:id_usuario (
                id,
                nombre,
                correo
              )
            ),
            Anteproyecto:anteproyecto_id (
              departamento,
              empresa_id,
              categoria_id,
              Empresa: empresa_id (
                nombre
              ),
              Categoria: categoria_id (
                nombre
              )
            )
          `);

        if (proyectosError) {
          console.error("Error fetching Proyectos:", proyectosError);
          return;
        }

        setProyectos(proyectosData);
        Profesor.obtenerTodos().then((profesoresData) => {
          setProfesores(profesoresData);
          console.log("Profesores cargados:", profesoresData);
        }).catch(console.error);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    useEffect(() => {
      // Filtra profesores que tienen disponibilidad mayor a asignados
      const filtrados = profesores.filter((prof) => {
        const disponibilidad = prof.original.disponibilidad ?? 0;
        const asignados = prof.original.proyectosAsignados ?? 0;
        return disponibilidad > asignados;
      });
      setFilteredProfesores(filtrados);
      console.log("Filtered Profesores: ", filtrados);
    }, [profesores]);

  /**
   * Asigna un profesor a un proyecto (UPDATE Proyecto.profesor_id).
   * @param {string} proyectoId
   * @param {string} profesorId
   */
  const handleAssign = async (proyectoId, profesorId, estudianteId) => {
    if (!profesorId) return;
    try {
      const profesorAnteriorId = proyectos.find(proj => proj.id === proyectoId).profesor_id;

      // Obtener datos actuales de asignaciones del profesor
      const profActual = profesores.find(p => p.profesor_id === profesorId);
      const asignados = profActual?.original?.proyectosAsignados ?? 0;
      const disponibilidad = profActual?.original?.disponibilidad ?? 0;
      if (asignados + 1 > disponibilidad) {
        errorToast("No se puede asignar: el profesor ya alcanzó su disponibilidad máxima.");
        return;
      }

      // Actualizar el proyecto con el nuevo profesor
      const { proyectoError } = await supabase
        .from("Proyecto")
        .update({ profesor_id: profesorId })
        .eq("id", proyectoId);
      if (proyectoError) throw proyectoError;

      // Actualizar el estudiante con el nuevo asesor
      const { estudianteError } = await supabase
        .from("Estudiante")
        .update({ asesor: profesorId })
        .eq("estudiante_id", estudianteId);
      if (estudianteError) throw estudianteError;

      // Sumar 1 a asignados en AsignacionesProfesor para el nuevo profesor
      const { error: asignacionError } = await supabase
        .from("AsignacionesProfesor")
        .update({ asignados: asignados + 1 })
        .eq("idProfesor", profesorId);
      if (asignacionError) throw asignacionError;

      // Si había un profesor anterior, restar 1 a asignados en AsignacionesProfesor
      if (profesorAnteriorId) {
        const profAnterior = profesores.find(p => p.profesor_id === profesorAnteriorId);
        const asignadosAnterior = profAnterior?.original?.proyectosAsignados ?? 0;
        await supabase
          .from("AsignacionesProfesor")
          .update({ asignados: Math.max(0, asignadosAnterior - 1) })
          .eq("idProfesor", profesorAnteriorId);
      }

      setProyectos((prevProyectos) =>
        prevProyectos.map((proj) =>
          proj.id === proyectoId ? { ...proj, profesor_id: profesorId } : proj
        )
      );

      setProfesores((prevProfesores) =>
        prevProfesores.map((prof) => {
          if (prof.profesor_id === profesorId) {
            return { ...prof, original: { ...prof.original, proyectosAsignados: asignados + 1 } };
          } else if (prof.profesor_id === profesorAnteriorId) {
            return { ...prof, original: { ...prof.original, proyectosAsignados: Math.max(0, (prof.original.proyectosAsignados ?? 0) - 1) } };
          } else {
            return prof;
          }
        })
      );

      alert("Proyecto asignado exitosamente");
    } catch (err) {
      console.error("handleAssign error:", err);
      errorToast("Error al asignar el proyecto");
    }
  };

  /**
   * Desasigna el profesor de un proyecto (UPDATE Proyecto.profesor_id = null).
   * @param {string} proyectoId
   */
  const handleUnassign = async (proyectoId, estudianteId, profesorId) => {
    try {
      // Obtener datos actuales de asignaciones del profesor
      const profActual = profesores.find(p => p.profesor_id === profesorId);
      const asignados = profActual?.original?.proyectosAsignados ?? 0;

      const { error: proyectoError } = await supabase
        .from("Proyecto")
        .update({ profesor_id: null })
        .eq("id", proyectoId);
      if (proyectoError) throw proyectoError;

      const { estudianteError } = await supabase
        .from("Estudiante")
        .update({ asesor: null })
        .eq("estudiante_id", estudianteId);
      if (estudianteError) throw estudianteError;

      // Restar 1 a asignados en AsignacionesProfesor para el profesor
      const { error: asignacionError } = await supabase
        .from("AsignacionesProfesor")
        .update({ asignados: Math.max(0, asignados - 1) })
        .eq("idProfesor", profesorId);
      if (asignacionError) throw asignacionError;

      setProyectos((prevProyectos) =>
        prevProyectos.map((proj) =>
          proj.id === proyectoId ? { ...proj, profesor_id: null } : proj
        )
      );

      setProfesores((prevProfesores) =>
        prevProfesores.map((prof) =>
          prof.profesor_id === profesorId
            ? { ...prof, original: { ...prof.original, proyectosAsignados: Math.max(0, (prof.original.proyectosAsignados ?? 0) - 1) } }
            : prof
        )
      );

      alert("Proyecto desasignado exitosamente");
    } catch (err) {
      console.error("handleUnassign error:", err);
      alert("Error al desasignar el proyecto");
    }
  };

  const handleEstadoChange = async (proyectoId, nuevoEstado, estudianteId) => {
    try{
      const { proyectoError } = await supabase
        .from("Proyecto")
        .update({ estado: nuevoEstado })
        .eq("id", proyectoId);

      if (proyectoError) throw proyectoError;

      fetchSemestreActual().then(async (semestreId) => {
        const { estudianteError } = await supabase
          .from("Estudiante")
          .update({ estado: nuevoEstado === 'Aprobado' ? 'defensa' : 'reprobado',
            semestre_id: semestreId
           })
          .eq("estudiante_id", estudianteId);

          if (estudianteError) throw estudianteError;
      }).catch((err) => {throw err;});

      setProyectos((prevProyectos) =>
        prevProyectos.map((proj) =>
          proj.id === proyectoId ? { ...proj, estado: nuevoEstado } : proj
        )
      );

      alert("Estado actualizado exitosamente");
    } catch (err) {
      console.error("handleEstadoChange error:", err);
      alert("Error al actualizar el estado del proyecto");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <HeaderCoordinador />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl">Cargando información...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Filtros de semestre y año sobre los proyectos
  const proyectosFiltrados = proyectos.filter(
    (proy) =>
      (filtroSemestre ? proy.semestre === Number(filtroSemestre) : true) &&
      (filtroAno ? proy.año === Number(filtroAno) : true)
  );

  // Filtro de semestre: solo 1 y 2
  const listaSemestres = [1, 2];
  // Filtro de año: últimos 10 años incluyendo el actual
  const listaAnios = Array.from({ length: 10 }, (_, i) => anoActual - i);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderCoordinador title="Asignación de Proyectos a Profesores" />
      <main className="flex-grow p-4 sm:p-8">
        <h1 className="text-2xl font-semibold mb-4">Lista de Proyectos</h1>
        {/* Filtros de semestre y año */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Semestre</label>
            <select
              className="border rounded px-2 py-1 min-w-[100px]"
              value={filtroSemestre}
              onChange={(e) => setFiltroSemestre(e.target.value)}
            >
              {listaSemestres.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Año</label>
            <select
              className="border rounded px-2 py-1 min-w-[100px]"
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
            >
              {listaAnios.map((anio) => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
        </div>
        {proyectosFiltrados.length === 0 ? (
          <p className="bg-white p-4 shadow rounded">No existen proyectos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Estudiante</th>
                  <th className="p-3 text-left">Carnet</th>
                  <th className="p-3 text-left">Empresa</th>
                  <th className="p-3 text-left">Departamento</th>
                  <th className="p-3 text-left">Categoría de anteproyecto</th>
                  <th className="p-3 text-left">Semestre</th>
                  <th className="p-3 text-left">Año</th>
                  <th className="p-3 text-left">Estado de proyecto</th>
                  <th className="p-3 text-left">Profesor</th>
                  <th className="p-3 text-left">Categoría de profesor</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyectosFiltrados.map((proyecto) => {
                  const assignedProf = profesores.find(
                    (prof) => prof.profesor_id === proyecto.profesor_id
                  );
                  return (
                    <tr key={proyecto.id} className="border-b">
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Estudiante.Usuario.nombre}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Estudiante.carnet}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Anteproyecto.Empresa.nombre}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Anteproyecto.departamento}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.Anteproyecto.Categoria?.nombre ?? "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.semestre}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.año}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.estado}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {assignedProf ? assignedProf.nombre : "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {assignedProf ? assignedProf.categoria ?? "N/A" : "N/A"}
                      </td>
                      <td className="flex p-3 text-sm text-gray-700 space-x-2">
                        {(() => {
                          const esPeriodoActual = proyecto.semestre === semestreActual && proyecto.año === anoActual;
                          return <>
                            <button
                              onClick={() => handleEstadoChange(proyecto.id, 'Aprobado', proyecto.estudiante_id)}
                              className="px-2 py-1 bg-green-500 text-white rounded mr-2"
                              disabled={!esPeriodoActual}
                              style={!esPeriodoActual ? { backgroundColor: '#e5e7eb', color: '#9ca3af' } : {}}
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleEstadoChange(proyecto.id, 'Reprobado', proyecto.estudiante_id)}
                              className="px-2 py-1 bg-red-500 text-white rounded"
                              disabled={!esPeriodoActual}
                              style={!esPeriodoActual ? { backgroundColor: '#e5e7eb', color: '#9ca3af' } : {}}
                            >
                              Reprobar
                            </button>
                            <select
                              className="border rounded px-2 py-1"
                              value={proyecto.profesor_id || ""}
                              onChange={(e) => handleAssign(proyecto.id, e.target.value, proyecto.estudiante_id)}
                              disabled={!esPeriodoActual}
                              style={!esPeriodoActual ? { backgroundColor: '#e5e7eb', color: '#9ca3af' } : {}}
                            >
                              <option value="">-- Asignar profesor --</option>
                              {assignedProf && (
                                <option key={assignedProf.profesor_id} value={assignedProf.profesor_id}>
                                  {assignedProf.nombre}
                                </option>
                              )}
                              {filteredProfesores
                                .filter((prof) => {
                                  // Filtrar por semestre y año actual
                                  return (
                                    prof.año === anoActual &&
                                    prof.semestre === semestreActual &&
                                    prof.profesor_id !== proyecto.profesor_id
                                  );
                                })
                                .map((prof) => (
                                  <option key={prof.profesor_id} value={prof.profesor_id}>
                                    {prof.nombre}
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleUnassign(proyecto.id, proyecto.estudiante_id, proyecto.profesor_id)}
                              disabled={!esPeriodoActual}
                              style={!esPeriodoActual ? { backgroundColor: '#e5e7eb', color: '#9ca3af' } : {}}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                            >
                              Desasignar
                            </button>
                          </>;
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

/**
 * Modal para agregar un anteproyecto asignable al profesor.
 */
const AdicionAnteproyectoProfesor = ({ profesor, onAdicion }) => {
  const modalRef = useRef(null);
  const [anteproyectos, setAnteproyectos] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");

  const abrir = async () => {
    const asignables = await Anteproyecto.obtenerAsignables();
    setAnteproyectos(asignables);
    modalRef.current.open();
  };

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
    modalRef.current.close();
  };

  if (!profesor) return null;

  return (
    <>
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
            {anteproyectos.map((ap, index) => (
              <option key={`anteproyecto-asignable-${index}`} value={ap.id}>
                {ap.estudiante.nombre} - {ap.nombreEmpresa}
              </option>
            ))}
          </select>
        </FloatInput>
      </Modal>
    </>
  );
};

export default EdicionAsignacionProyectos;
