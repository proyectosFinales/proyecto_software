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

/**
 * EdicionAsignacionProyectos
 * Muestra proyectos (Proyecto) y los profesores (Profesor) para asignar o desasignar.
 * - Proyecto.profesor_id -> la relación con Profesor (profesor_id).
 * - Profesor.id_usuario, etc.
 * 
 * @returns JSX
 */
function EdicionAsignacionProyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [filteredProfesores, setFilteredProfesores] = useState([]);
  const [loading, setLoading] = useState(true);

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
              Empresa: empresa_id (
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
    setFilteredProfesores(profesores.filter((prof) => prof.original.estudiantesLibres > 0));
  }, [profesores]);

  /**
   * Asigna un profesor a un proyecto (UPDATE Proyecto.profesor_id).
   * @param {string} proyectoId
   * @param {string} profesorId
   */
  const handleAssign = async (proyectoId, profesorId, estudianteId) => {
    if(!profesorId) return;
    try {
      const { proyectoError } = await supabase
        .from("Proyecto")
        .update({ profesor_id: profesorId })
        .eq("id", proyectoId);

      if (proyectoError) throw proyectoError;

      const { estudianteError } = await supabase
        .from("Estudiante")
        .update({ asesor: profesorId })
        .eq("estudiante_id", estudianteId);
      
      if (estudianteError) throw estudianteError;

      const { profesorError } = await supabase
        .from("Profesor")
        .update({ estudiantes_libres: profesores.find(p => p.profesor_id === profesorId).original.estudiantesLibres - 1 })
        .eq("profesor_id", profesorId);
      
      if (profesorError) throw profesorError;

      setProyectos((prevProyectos) =>
        prevProyectos.map((proj) =>
          proj.id === proyectoId ? { ...proj, profesor_id: profesorId } : proj
        )
      );

      setProfesores((prevProfesores) =>
        prevProfesores.map((prof) =>
          prof.profesor_id === profesorId ? { ...prof, original: {...prof.original, estudiantesLibres: prof.original.estudiantesLibres - 1} } : prof
        )
      );
    } catch (err) {
      console.error("handleAssign error:", err);
    }
  };

  /**
   * Desasigna el profesor de un proyecto (UPDATE Proyecto.profesor_id = null).
   * @param {string} proyectoId
   */
  const handleUnassign = async (proyectoId, estudianteId, profesorId) => {
    try {
      const { error : proyectoError } = await supabase
        .from("Proyecto")
        .update({ profesor_id: null })
        .eq("id", proyectoId);

      if (proyectoError) throw proyectoError;

      const { estudianteError } = await supabase
        .from("Estudiante")
        .update({ asesor: null }) 
        .eq("estudiante_id", estudianteId);
      
      if (estudianteError) throw estudianteError;

      const { profesorError } = await supabase
        .from("Profesor")
        .update({ estudiantes_libres: profesores.find(p => p.profesor_id === profesorId).original.estudiantesLibres + 1 })
        .eq("profesor_id", profesorId);
      
      if (profesorError) throw profesorError;

      setProyectos((prevProyectos) =>
        prevProyectos.map((proj) =>
          proj.id === proyectoId ? { ...proj, profesor_id: null } : proj
        )
      );

      setProfesores((prevProfesores) =>
        prevProfesores.map((prof) =>
          prof.profesor_id === profesorId ? { ...prof, estudiantesLibres: prof.estudiantesLibres + 1 } : prof
        )
      );
    } catch (err) {
      console.error("handleUnassign error:", err);
      alert("Error al desasignar el proyecto");
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <HeaderCoordinador title="Asignación de Proyectos a Profesores" />
      <main className="flex-grow p-4 sm:p-8">
        <h1 className="text-2xl font-semibold mb-4">Lista de Proyectos</h1>
        {proyectos.length === 0 ? (
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
                  <th className="p-3 text-left">Profesor</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((proyecto) => {
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
                        {assignedProf ? assignedProf.nombre : "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-700 space-x-2">
                        {/* Profesor Selection Dropdown */}
                        <select
                          className="border rounded px-2 py-1"
                          value={proyecto.profesor_id || ""}
                          onChange={(e) => handleAssign(proyecto.id, e.target.value, proyecto.estudiante_id)}
                        >
                          <option value="">-- Asignar profesor --</option>
                          {assignedProf && (
                            <option key={assignedProf.profesor_id} value={assignedProf.profesor_id}>
                              {assignedProf.nombre}
                            </option>
                          )}
                          {filteredProfesores
                            .filter((prof) => prof.profesor_id !== proyecto.profesor_id)
                            .map((prof) => (
                              <option key={prof.profesor_id} value={prof.profesor_id}>
                                {prof.nombre}
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => handleUnassign(proyecto.id, proyecto.estudiante_id, proyecto.profesor_id)}
                          disabled={!proyecto.profesor_id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Desasignar
                        </button>
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
