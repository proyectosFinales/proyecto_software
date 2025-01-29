// /pages/AsignacionDefensas.js

import React, { useEffect, useState } from "react";
import Header from "../components/HeaderCoordinador"; // or your Header
import Footer from "../components/Footer";            // or your Footer
import supabase from "../../model/supabase";             // your Supabase client
import { assignAllDefensas } from "../../controller/AsignacionDefensaController";
import { successToast, errorToast } from "../components/toast";

/**
 * This page:
 *  1) Fetches and displays projects that are pending defense assignment
 *  2) Has a button to call the "assignAllDefensas" controller
 *  3) Shows results (# assigned, reasons for unassigned) and updates the pending list
 */
const AsignacionDefensas = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [assigningInProgress, setAssigningInProgress] = useState(false);

  // Store final results from assignment
  const [assignedCount, setAssignedCount] = useState(0);
  const [unassignedReasons, setUnassignedReasons] = useState([]);

  // On mount, fetch "pending" projects
  useEffect(() => {
    fetchPendingDefensas();
  }, []);

  /**
   * Fetch all "pending" projects that:
   *   - Proyecto.estado = "Aprobado"
   *   - Estudiante.estado = "Defensa"
   *   - No existing Cita
   * This is just to display them; the actual assignment logic is in the controller.
   */
  async function fetchPendingDefensas() {
    try {
      setStatusMessage("Buscando proyectos pendientes...");
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

      // Filter them to the "Aprobado + Defensa + no Cita" group
      const filtered = [];
      for (const p of projects) {
        const projState = p.estado?.toLowerCase();
        const studState = p.Estudiante?.estado?.toLowerCase();
        if (projState === "aprobado" && studState === "defensa") {
          // check no existing Cita
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
          `Se encontraron ${filtered.length} proyecto(s) pendientes de defensa.`
        );
      }
    } catch (err) {
      console.error("Error in fetchPendingDefensas:", err);
      setStatusMessage("Ocurrió un error al buscar proyectos.");
    }
  }

  /**
   * Call the improved controller to assign all possible defenses.
   */
  async function handleAssignDefensas() {
    try {
      setAssigningInProgress(true);
      setStatusMessage("Asignando defensas, por favor espera...");

      // Call the more detailed controller
      const result = await assignAllDefensas(); 
      // e.g. { assigned: number, unassigned: string[] }

      setAssignedCount(result.assigned || 0);
      setUnassignedReasons(result.unassigned || []);

      // Show success message
      if (result.assigned > 0) {
        successToast(`¡Asignadas ${result.assigned} defensa(s) exitosamente!`);
      } else {
        successToast("No se asignaron defensas nuevas.");
      }

      // Refresh the pending list
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
      {/* Header (Coordinator) */}
      <Header title="Asignación de Defensas" />

      <main className="p-4">
        <h2 className="text-xl font-semibold mb-4">Proyectos listos para defensa</h2>

        {/* Show current status/instructions */}
        <p className="mb-6">{statusMessage}</p>

        {/* If there are pending projects, list them */}
        {pendingProjects.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Proyectos pendientes:</h3>
            <ul className="list-disc pl-5">
              {pendingProjects.map((proj) => (
                <li key={proj.id} className="mb-2">
                  <strong>Estudiante:</strong>{" "}
                  {proj.Estudiante?.Usuario?.nombre || "N/A"}
                  {" | "}
                  <strong>Profesor:</strong>{" "}
                  {proj.Profesor?.Usuario?.nombre || "N/A"}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Button to trigger auto-assignment */}
        <div className="mb-6">
          <button
            onClick={handleAssignDefensas}
            disabled={assigningInProgress || pendingProjects.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {assigningInProgress ? "Asignando..." : "Asignar Defensas Automáticamente"}
          </button>
        </div>

        {/* Show assignment results */}
        {(assignedCount > 0 || unassignedReasons.length > 0) && (
          <div className="mt-4 p-4 border rounded-md">
            <h4 className="font-semibold mb-2">Resultados:</h4>
            <p>Defensas asignadas: {assignedCount}</p>

            {unassignedReasons.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">
                  No se pudo asignar cita a los siguientes casos:
                </p>
                <ul className="list-disc pl-5">
                  {unassignedReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AsignacionDefensas;
