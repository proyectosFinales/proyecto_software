// /pages/AsignacionDefensas.js

import React, { useEffect, useState } from "react";
import Header from "../components/HeaderCoordinador";
import Footer from "../components/Footer";
import supabase from "../../model/supabase";
import { assignAllDefensas } from "../../controller/AsignacionDefensaController";
import { successToast, errorToast } from "../components/toast";

/**
 * A page to:
 *  - List "Aprobado"+"Defensa" projects with no Cita
 *  - Let you auto-assign defenses
 *  - Show results
 *  - Warn if all lectores might be at capacity
 */
const AsignacionDefensas = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [assigningInProgress, setAssigningInProgress] = useState(false);

  // Show final results
  const [assignedCount, setAssignedCount] = useState(0);
  const [unassignedReasons, setUnassignedReasons] = useState([]);

  useEffect(() => {
    fetchPendingDefensas();
  }, []);

  /**
   * Gather all "pending defense" projects:
   *   - Proyecto.estado = Aprobado
   *   - Estudiante.estado = Defensa
   *   - No existing Cita
   */
  async function fetchPendingDefensas() {
    try {
      setStatusMessage("Buscando proyectos pendientes de defensa...");

      const { data: projects, error } = await supabase
        .from("Proyecto")
        .select(`
          id,
          estado,
          estudiante_id,
          profesor_id,
          Estudiante:estudiante_id (
            estudiante_id,
            estado,
            Usuario:id_usuario (
              nombre
            )
          ),
          Profesor:profesor_id (
            profesor_id,
            Usuario:id_usuario (
              nombre
            )
          )
        `);

      if (error) {
        console.error("Error fetching projects:", error);
        setStatusMessage("Error al buscar proyectos.");
        return;
      }

      // Filter out only those truly pending
      const filtered = [];
      for (const p of projects) {
        const projState = p.estado?.toLowerCase();
        const studState = p.Estudiante?.estado?.toLowerCase();
        if (projState === "aprobado" && studState === "defensa") {
          // check no Cita
          const { data: existing, error: exErr } = await supabase
            .from("Cita")
            .select("cita_id")
            .eq("proyecto_id", p.id)
            .maybeSingle();
          if (!exErr && !existing) {
            filtered.push(p);
          }
        }
      }

      setPendingProjects(filtered);
      if (filtered.length === 0) {
        setStatusMessage("No hay proyectos pendientes de defensa.");
      } else {
        setStatusMessage(
          `Se encontraron ${filtered.length} proyecto(s) pendiente(s) de defensa.`
        );
      }
    } catch (err) {
      console.error("Error in fetchPendingDefensas:", err);
      setStatusMessage("Ocurrió un error al buscar proyectos.");
    }
  }

  /**
   * Trigger auto-assignment by calling the updated "assignAllDefensas" controller.
   */
  async function handleAssignDefensas() {
    try {
      setAssigningInProgress(true);
      setStatusMessage("Asignando defensas... revisa la consola para logs de depuración.");

      const result = await assignAllDefensas();
      // { assigned, unassigned: string[] }
      setAssignedCount(result.assigned || 0);
      setUnassignedReasons(result.unassigned || []);

      if (result.assigned > 0) {
        successToast(`¡Asignadas ${result.assigned} defensa(s) exitosamente!`);
      } else {
        successToast("No se asignaron defensas nuevas, revisa disponibilidad o capacidad.");
      }

      await fetchPendingDefensas();
      setStatusMessage("Proceso de asignación finalizado.");
    } catch (err) {
      console.error("Error assigning defensas:", err);
      errorToast("Ocurrió un error asignando las defensas: " + err.message);
    } finally {
      setAssigningInProgress(false);
    }
  }

  return (
    <div>
      <Header title="Asignación de Defensas" />
      <main className="p-4">
        <h2 className="text-xl font-semibold mb-4">Proyectos listos para defensa</h2>

        <p className="mb-4">{statusMessage}</p>

        {/* List pending projects if any */}
        {pendingProjects.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Proyectos pendientes:</h3>
            <ul className="list-disc pl-5">
              {pendingProjects.map((p) => (
                <li key={p.id} className="mb-2">
                  <strong>Estudiante:</strong> {p.Estudiante?.Usuario?.nombre || "N/A"}
                  {" | "}
                  <strong>Profesor:</strong> {p.Profesor?.Usuario?.nombre || "N/A"}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Button to assign */}
        <div className="mb-6">
          <button
            onClick={handleAssignDefensas}
            disabled={assigningInProgress || pendingProjects.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {assigningInProgress ? "Asignando..." : "Asignar Defensas Automáticamente"}
          </button>
        </div>

        {/* Show results */}
        {(assignedCount > 0 || unassignedReasons.length > 0) && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h4 className="font-semibold mb-2">Resultados:</h4>
            <p>Defensas asignadas: {assignedCount}</p>

            {unassignedReasons.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">No se pudo asignar cita a los siguientes casos:</p>
                <ul className="list-disc pl-5">
                  {unassignedReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>

                {/* Additional user-friendly note if capacity was a problem */}
                {unassignedReasons.some((r) => r.includes("lector capacity") || r.includes("at lector capacity")) && (
                  <div className="mt-3 text-red-600">
                    <p>
                      Parece que algunos profesores han alcanzado su límite de defensorías (2 * su cantidad_estudiantes). 
                      Considere <strong>agregar más profesores</strong> o <strong>aumentar la capacidad</strong> de los existentes
                      para poder asignar más lectores.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AsignacionDefensas;
