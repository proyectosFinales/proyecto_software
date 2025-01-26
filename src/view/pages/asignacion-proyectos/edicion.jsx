/**
 * EdicionAsignacionProyectos.jsx
 * Ventana para asignar manualmente Anteproyectos a profesores,
 * ver reporte, deasignar, etc.
 */
import React, { useEffect, useState, useRef } from "react";
import Anteproyecto from "../../../controller/anteproyecto";
import Profesor from "../../../controller/profesor";
import { generarReporteAsignaciones } from "../../../controller/asignacion.js";
import Button from "../../components/button";
import Layout from "../../components/layout";
import styles from "../../styles/table.module.css";
import Modal from "../../components/modal.jsx";
import { FloatInput } from "../../components/input.jsx";
import { errorToast, successToast } from "../../components/toast";
import supabase from "../../../model/supabase";
import HeaderCoordinador from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";

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
  const [loading, setLoading] = useState(true);

  /**
   * Carga la lista de proyectos y profesores.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.debug("Fetching Proyectos...");
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
            -- optional, if you want to join with Estudiante->Usuario
            Estudiante:estudiante_id (
              estudiante_id,
              Usuario:id_usuario (
                id,
                nombre,
                correo
              )
            )
          `);

        if (proyectosError) {
          console.error("Error fetching Proyectos:", proyectosError);
          return;
        }

        console.debug("Fetching Profesores...");
        const { data: profesoresData, error: profesoresError } = await supabase
          .from("Profesor")
          .select(`
            profesor_id,
            id_usuario,
            cantidad_estudiantes
          `);

        if (profesoresError) {
          console.error("Error fetching Profesores:", profesoresError);
          return;
        }

        setProyectos(proyectosData || []);
        setProfesores(profesoresData || []);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Asigna un profesor a un proyecto (UPDATE Proyecto.profesor_id).
   * @param {string} proyectoId
   * @param {string} profesorId
   */
  const handleAssign = async (proyectoId, profesorId) => {
    try {
      console.debug(`Assigning professor_id = ${profesorId} to proyecto_id = ${proyectoId}`);
      const { error } = await supabase
        .from("Proyecto")
        .update({ profesor_id: profesorId })
        .eq("id", proyectoId);

      if (error) {
        console.error("Error updating Proyecto:", error);
      } else {
        // On success, refresh the local state
        setProyectos((prevProyectos) =>
          prevProyectos.map((proj) =>
            proj.id === proyectoId ? { ...proj, profesor_id: profesorId } : proj
          )
        );
      }
    } catch (err) {
      console.error("handleAssign error:", err);
    }
  };

  /**
   * Desasigna el profesor de un proyecto (UPDATE Proyecto.profesor_id = null).
   * @param {string} proyectoId
   */
  const handleUnassign = async (proyectoId) => {
    try {
      console.debug(`Unassigning professor for proyecto_id = ${proyectoId}`);
      const { error } = await supabase
        .from("Proyecto")
        .update({ profesor_id: null })
        .eq("id", proyectoId);

      if (error) {
        console.error("Error unassigning Proyecto:", error);
      } else {
        // On success, refresh the local state
        setProyectos((prevProyectos) =>
          prevProyectos.map((proj) =>
            proj.id === proyectoId ? { ...proj, profesor_id: null } : proj
          )
        );
      }
    } catch (err) {
      console.error("handleUnassign error:", err);
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
                  <th className="p-3 text-left">Proyecto ID</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-left">Profesor Asignado</th>
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
                        {proyecto.id}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {proyecto.estado}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {assignedProf ? assignedProf.profesor_id : "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-700 space-x-2">
                        {/* Profesor Selection Dropdown */}
                        <select
                          className="border rounded px-2 py-1"
                          value={proyecto.profesor_id || ""}
                          onChange={(e) => handleAssign(proyecto.id, e.target.value)}
                        >
                          <option value="">-- Asignar profesor --</option>
                          {profesores.map((prof) => (
                            <option key={prof.profesor_id} value={prof.profesor_id}>
                              {prof.profesor_id}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUnassign(proyecto.id)}
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
