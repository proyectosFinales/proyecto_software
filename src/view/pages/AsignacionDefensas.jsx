import React, { useState, useEffect } from "react";
import supabase from "../../model/supabase"; 
import Footer from "../components/Footer";
import Header from "../components/HeaderCoordinador"; // or whichever
import { errorToast, successToast } from "../components/toast";

const AsignacionDefensas = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [assigningInProgress, setAssigningInProgress] = useState(false);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    console.log("🚀 Component mounted - Fetching pending defensas...");
    fetchPendingDefensas();
  }, []);

  async function fetchPendingDefensas() {
    try {
      console.log("📊 Fetching projects with their students...");
      const { data: projects, error } = await supabase
        .from("Proyecto")
        .select(`
          id,
          profesor_id,
          estudiante_id,
          estado,
          semestre_id,
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
        console.error("❌ Error fetching projects:", error);
        throw error;
      }

      console.log("📋 All projects fetched:", projects);

      // Filter the data
      const filtered = [];
      for (const proj of projects) {
        console.log("\n🔍 Analyzing project:", {
          id: proj.id,
          estado: proj.estado,
          estudianteEstado: proj.Estudiante?.estado,
          estudianteNombre: proj.Estudiante?.Usuario?.nombre,
          profesorNombre: proj.Profesor?.Usuario?.nombre
        });

        // Make case-insensitive comparisons
        const projectState = proj.estado?.toLowerCase();
        const studentState = proj.Estudiante?.estado?.toLowerCase();

        if (projectState === "aprobado") {
          console.log("✅ Project is Aprobado");
        } else {
          console.log("❌ Project is not Aprobado, estado:", proj.estado);
        }

        if (studentState === "defensa") {
          console.log("✅ Student is in Defensa state");
        } else {
          console.log("❌ Student is not in Defensa state:", proj.Estudiante?.estado);
        }

        if (projectState === "aprobado" && studentState === "defensa") {
          console.log("🔎 Checking for existing cita...");
          
          const { data: existingCita, error: citaError } = await supabase
            .from("Cita")
            .select("cita_id")
            .eq("proyecto_id", proj.id)
            .maybeSingle();

          if (citaError) {
            console.error("❌ Error checking existing cita:", citaError);
            throw citaError;
          }

          if (!existingCita) {
            console.log("✅ No existing cita found - adding to filtered list");
            filtered.push(proj);
          } else {
            console.log("⚠️ Project already has a cita assigned");
          }
        }
      }

      console.log("\n📊 Final filtered projects:", filtered);
      console.log(`Found ${filtered.length} projects needing defensas`);
      
      // Get professor availability for these projects
      for (const proj of filtered) {
        console.log("🔍 Checking availability for professor:", proj.Profesor?.Usuario?.nombre);
        const { data: availability, error: availError } = await supabase
          .from("disponibilidad")
          .select("*")
          .eq("profesor_id", proj.profesor_id);

        if (availError) {
          console.error("❌ Error fetching availability:", availError, "for professor:", proj.Profesor?.Usuario?.nombre);
        } else {
          if (availability && availability.length > 0) {
            console.log(`📅 Found ${availability.length} available slots for professor ${proj.Profesor?.Usuario?.nombre}:`, availability);
          } else {
            console.log(`⚠️ No availability found for professor ${proj.Profesor?.Usuario?.nombre}`);
          }
        }
      }

      setPendingProjects(filtered);
      
      // Update UI message
      if (filtered.length === 0) {
        setStatusMessage("No se encontraron proyectos que requieran cita de defensa.");
      } else {
        setStatusMessage(`Se encontraron ${filtered.length} proyectos que requieren cita.`);
      }

    } catch (err) {
      console.error("❌ Error in fetchPendingDefensas:", err);
      errorToast(err.message);
    }
  }

  async function handleAssignDefensas() {
    console.log("🎯 Starting defense assignment process...");
    setAssigningInProgress(true);
    try {
      // For each project, find an available slot in Disponibilidad
      // Then assign a cita with two random or systematically chosen "lectores"
      let notAssigned = [];

      for (const proj of pendingProjects) {
        const assigned = await assignOneDefensa(proj);
        if (!assigned.success) {
          notAssigned.push(assigned.reason);
        }
      }

      if (notAssigned.length > 0) {
        setUnassignedStudents(notAssigned);
        setStatusMessage(
          `Se asignaron citas, pero ${notAssigned.length} no pudieron asignarse.`
        );
      } else {
        setStatusMessage("Todas las defensas se asignaron exitosamente!");
      }
      // Refresh or cleanup
      await fetchPendingDefensas();
    } catch (err) {
      console.error("❌ Error in handleAssignDefensas:", err);
      errorToast("Error al asignar defensas: " + err.message);
    } finally {
      setAssigningInProgress(false);
    }
  }

  async function assignOneDefensa(project) {
    // 1) Get an available slot in Disponibilidad for the professor
    //    i.e. select * from Disponibilidad where profesor_id=project.profesor_id 
    //    AND (no Cita is referencing that Disponibilidad's id).
    try {
      // Since your schema uses: 
      //   - Cita does not hold "disponibilidad_id" in your snippet 
      //   - but you said you want to store in the cita something referencing the slot
      // If "cita" doesn't have that column yet, you might add it. 
      // For example:
      const { data: availableSlots, error: slotError } = await supabase
        .from("disponibilidad")
        .select(`id, dia, hora_inicio, hora_fin`)
        .eq("profesor_id", project.profesor_id);

      if (slotError) throw slotError;

      // Filter out the ones already used in a Cita
      let chosenSlot = null;
      for (const slot of availableSlots) {
        // Check if used:
        const { data: used, error: usedErr } = await supabase
          .from("Cita")
          .select("cita_id")
          .eq("hora_inicio", slot.hora_inicio)
          .eq("hora_fin", slot.hora_fin)
          .eq("fecha", slot.dia)
          .maybeSingle();
        if (usedErr) throw usedErr;
        if (!used) {
          chosenSlot = slot;
          break;
        }
      }
      if (!chosenSlot) {
        return { success: false, reason: `No hay disponibilidad para prof. ${project.profesor_id}` };
      }

      // 2) Find two readers (lectores) that can come. 
      //    Logic: 
      //    - We want two distinct professors that are NOT the professor_id from the project  
      //    - Each professor must have the ability to be lector => they must appear no more than 2*(prof.cantidad_estudiantes - prof.estudiantes_libres) times as lector. 
      //    - Also that they have an available slot matching the chosenSlot day/time, if you want them physically there
      const foundLectores = await buscarDosLectores(chosenSlot.dia, chosenSlot.hora_inicio, chosenSlot.hora_fin, project.profesor_id);
      if (!foundLectores || foundLectores.length < 2) {
        return { success: false, reason: `No hay suficientes lectores disponibles para la fecha ${chosenSlot.dia}` };
      }

      // 3) Insert the new Cita row
      const { data: newCita, error: newCitaError } = await supabase
        .from("Cita")
        .insert({
          cita_id: crypto.randomUUID(), // or rely on supabase default
          fecha: chosenSlot.dia,
          hora_inicio: chosenSlot.hora_inicio,
          hora_fin: chosenSlot.hora_fin,
          tutor: project.profesor_id,
          lector1: foundLectores[0],
          lector2: foundLectores[1],
          proyecto_id: project.id,
          estudiante_id: project.estudiante_id,
          semestre_id: project.semestre_id,
          // Possibly "medio", "virtual" columns, etc.
        })
        .select()
        .single();
      
      if (newCitaError) throw newCitaError;
      return { success: true };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  }

  async function buscarDosLectores(dia, horaInicio, horaFin, excludeProf) {
    // 1) Get all professors
    const { data: allProfs, error: allProfsError } = await supabase
      .from("Profesor")
      .select(`
        profesor_id,
        cantidad_estudiantes,
        estudiantes_libres
      `);

    if (allProfsError) throw allProfsError;

    // 2) Filter out the professor who is the "tutor"
    const filtered = allProfs.filter((p) => p.profesor_id !== excludeProf);

    // 3) For each professor, check if they have availability for the day  
    // and that they have not exceeded the "2*(EstudiantesAsignados) as lector" requirement
    let potentialLectores = [];
    for (const prof of filtered) {
      const lectorCapacity = 2 * (prof.cantidad_estudiantes - prof.estudiantes_libres);

      // Count how many times already assigned as lector in the same day/time
      const { data: lectorCitas, error: lectorErr } = await supabase
        .from("Cita")
        .select("cita_id")
        .eq("fecha", dia)
        .or(`lector1.eq.${prof.profesor_id},lector2.eq.${prof.profesor_id}`);

      if (lectorErr) throw lectorErr;

      if (lectorCitas.length < lectorCapacity) {
        // Check availability table for that prof
        const { data: profSlots, error: slotErr } = await supabase
          .from("disponibilidad")
          .select("id")
          .eq("profesor_id", prof.profesor_id)
          .eq("dia", dia)
          .eq("hora_inicio", horaInicio)
          .eq("hora_fin", horaFin)
          .maybeSingle();

        if (slotErr) throw slotErr;
        if (profSlots) {
          potentialLectores.push(prof.profesor_id);
        }
      }
    }

    // Now pick any two from potentialLectores
    if (potentialLectores.length < 2) return null;
    // If you want a random pick:
    // shuffle them
    potentialLectores.sort(() => 0.5 - Math.random());
    return [potentialLectores[0], potentialLectores[1]];
  }

  return (
    <div>
      <Header title="Asignación de Defensas" />
      <main className="p-4">
        <h2 className="text-xl font-semibold mb-4">Proyectos listos para defensa</h2>
        <p className="mb-6">
          {statusMessage || `Se encontraron ${pendingProjects.length} proyectos que requieren cita.`}
        </p>

        {pendingProjects.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Proyectos pendientes:</h3>
            <ul className="list-disc pl-5">
              {pendingProjects.map((proj) => (
                <li key={proj.id} className="mb-2">
                  Estudiante: {proj.Estudiante?.Usuario?.nombre || 'N/A'} - 
                  Profesor: {proj.Profesor?.Usuario?.nombre || 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={assigningInProgress || pendingProjects.length === 0}
          onClick={handleAssignDefensas}
        >
          {assigningInProgress ? "Asignando..." : "Asignar Automáticamente"}
        </button>
        
        {unassignedStudents.length > 0 && (
          <div className="mt-4 bg-yellow-100 p-4 rounded">
            <h4 className="font-semibold">Estudiantes sin cita asignada:</h4>
            <ul className="list-disc ml-4">
              {unassignedStudents.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AsignacionDefensas; 