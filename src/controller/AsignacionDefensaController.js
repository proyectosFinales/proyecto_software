// /controllers/AsignacionDefensaController.js

import { v4 as uuidv4 } from "uuid";
import supabase from "../model/supabase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/* =====================================
   1) AUTO-ASSIGN DEFENSES (CITAS)
===================================== */

/**
 * Assigns defenses for projects that are:
 *  - Proyecto.estado = "Aprobado"
 *  - Estudiante.estado = "Defensa"
 *  - No existing Cita
 * Returns { assigned: number, unassigned: string[] }.
 */
export async function assignAllDefensas() {
  console.log("=== assignAllDefensas: Starting... ===");
  try {
    // 1) Fetch candidate projects
    const { data: projects, error: projectErr } = await supabase
      .from("Proyecto")
      .select(`
        id,
        profesor_id,
        estudiante_id,
        estado,
        semestre_id,
        Estudiante:estudiante_id (
          estudiante_id,
          estado
        ),
        Profesor:profesor_id (
          profesor_id,
          Usuario:id_usuario (
            nombre
          )
        )
      `);

    if (projectErr) throw projectErr;

    // Filter to "Aprobado" + "Defensa" + no existing Cita
    const toAssign = [];
    for (const p of projects) {
      const projState = p.estado?.toLowerCase();
      const studState = p.Estudiante?.estado?.toLowerCase();
      if (projState === "aprobado" && studState === "defensa") {
        // check no existing cita
        const { data: existingCita, error: citaErr } = await supabase
          .from("Cita")
          .select("cita_id")
          .eq("proyecto_id", p.id)
          .maybeSingle();
        if (citaErr) throw citaErr;

        if (!existingCita) {
          toAssign.push(p);
        }
      }
    }

    let assignedCount = 0;
    const notAssigned = [];

    // 2) Attempt assignment for each
    for (const project of toAssign) {
      const result = await assignOneDefensa(project);
      if (result.success) {
        assignedCount++;
      } else {
        notAssigned.push(result.reason);
      }
    }

    console.log("=== assignAllDefensas: Done. ===");
    return { assigned: assignedCount, unassigned: notAssigned };
  } catch (err) {
    console.error("❌ Error in assignAllDefensas:", err);
    throw err;
  }
}

/**
 * Attempt to assign exactly one defense (Cita) for a given project.
 * Tries all free slots for that project's tutor, searching for 2 lectores.
 * Returns { success: boolean, reason?: string }
 */
async function assignOneDefensa(project) {
  try {
    const tutorName = project?.Profesor?.Usuario?.nombre || "Profesor desconocido";
    console.log(`\n--- assignOneDefensa: Project ${project.id}, tutor: ${tutorName} ---`);

    // 1) Get free tutor slots
    const freeTutorSlots = await findTutorFreeSlots(project.profesor_id);
    if (!freeTutorSlots || freeTutorSlots.length === 0) {
      const msg = `No hay disponibilidades para el profesor ${tutorName}.`;
      console.warn(msg);
      return { success: false, reason: msg };
    }

    // 2) Try each slot
    for (const slot of freeTutorSlots) {
      console.log(
        `Trying slot => ${slot.dia} ${slot.hora_inicio}-${slot.hora_fin} (Slot ID: ${slot.id})`
      );

      // Find 2 lectores
      const lectorResult = await buscarDosLectores(
        slot.dia,
        slot.hora_inicio,
        slot.hora_fin,
        project.profesor_id,
        project.semestre_id
      );

      if (lectorResult.success && lectorResult.lectores?.length === 2) {
        // Insert new Cita
        const citaId = uuidv4();
        const { error: insertErr } = await supabase.from("Cita").insert({
          cita_id: citaId,
          proyecto_id: project.id,
          estudiante_id: project.estudiante_id,
          semestre_id: project.semestre_id,
          tutor: project.profesor_id,
          lector1: lectorResult.lectores[0],
          lector2: lectorResult.lectores[1],
          disponibilidad_id: slot.id,
        });

        if (insertErr) {
          throw new Error(`Error inserting Cita: ${insertErr.message}`);
        }

        console.log(`✓ Assigned Cita (ID: ${citaId}) for Project ${project.id}`);
        return { success: true };
      } else {
        console.warn(
          `✗ Not enough lectores for slot ${slot.dia} ${slot.hora_inicio}-${slot.hora_fin}.`
        );
      }
    }

    // If none worked
    const failMsg = `No se encontró ningún horario en el que el profesor ${tutorName} y dos lectores pudieran asistir.`;
    return { success: false, reason: failMsg };
  } catch (err) {
    console.error("❌ Error in assignOneDefensa:", err);
    return { success: false, reason: err.message };
  }
}

/**
 * Find all tutor "disponibilidad" rows that aren't used by another Cita,
 * sorted by date/time ascending.
 */
async function findTutorFreeSlots(tutorId) {
  const { data: allSlots, error: slotErr } = await supabase
    .from("disponibilidad")
    .select("*")
    .eq("profesor_id", tutorId);
  if (slotErr) throw slotErr;

  if (!allSlots || allSlots.length === 0) {
    return [];
  }

  const free = [];
  for (const slot of allSlots) {
    const { data: used, error: usedErr } = await supabase
      .from("Cita")
      .select("cita_id")
      .eq("disponibilidad_id", slot.id)
      .maybeSingle();
    if (usedErr) throw usedErr;

    if (!used) {
      free.push(slot);
    }
  }

  // Sort ascending by day/time
  free.sort((a, b) => {
    const dateA = new Date(a.dia);
    const dateB = new Date(b.dia);
    const diffDate = dateA - dateB;
    if (diffDate !== 0) return diffDate;

    // same day => compare hour
    const [hA, mA] = a.hora_inicio.split(":").map(Number);
    const [hB, mB] = b.hora_inicio.split(":").map(Number);
    return hA * 60 + mA - (hB * 60 + mB);
  });

  return free;
}

/**
 * Finds TWO professors who can serve as lectores for the given day/time
 * (capacity = 2 * cantidad_estudiantes, no double-booking, etc.).
 */
async function buscarDosLectores(dia, horaInicio, horaFin, excludeProfId, semestreId) {
  console.log(
    `buscarDosLectores => Day: ${dia}, Time: ${horaInicio}-${horaFin}, excluding tutor: ${excludeProfId}`
  );

  const { data: profs, error: profsErr } = await supabase
    .from("Profesor")
    .select(`
      profesor_id,
      cantidad_estudiantes,
      Usuario:id_usuario (
        nombre
      )
    `);
  if (profsErr) throw profsErr;

  const possible = profs.filter((p) => p.profesor_id !== excludeProfId);
  const eligible = [];

  for (const prof of possible) {
    const profId = prof.profesor_id;
    const profName = prof.Usuario?.nombre || "Profesor sin nombre";

    // capacity = 2 * cantidad_estudiantes
    const lectorCapacity = 2 * prof.cantidad_estudiantes;

    // how many times they've served as lector
    const { data: lectorCitas, error: lectorErr } = await supabase
      .from("Cita")
      .select("cita_id")
      .eq("semestre_id", semestreId)
      .or(`lector1.eq.${profId},lector2.eq.${profId}`);
    if (lectorErr) throw lectorErr;

    if (lectorCitas.length >= lectorCapacity) {
      console.log(`- ${profName} at lector capacity ${lectorCapacity}, skip.`);
      continue;
    }

    // check day/time availability
    const { data: slotCheck } = await supabase
      .from("disponibilidad")
      .select("id")
      .eq("profesor_id", profId)
      .eq("dia", dia)
      .eq("hora_inicio", horaInicio)
      .eq("hora_fin", horaFin)
      .maybeSingle();
    if (!slotCheck) {
      // no slot match
      continue;
    }

    // check double-booking
    const { data: conflictCitas, error: conflictErr } = await supabase
      .from("Cita")
      .select(`
        cita_id,
        disponibilidad:disponibilidad_id (
          dia,
          hora_inicio,
          hora_fin
        )
      `)
      .or(`lector1.eq.${profId},lector2.eq.${profId}`);
    if (conflictErr) throw conflictErr;

    const isDoubleBooked = conflictCitas.some((c) => {
      return (
        c.disponibilidad?.dia === dia &&
        c.disponibilidad?.hora_inicio === horaInicio &&
        c.disponibilidad?.hora_fin === horaFin
      );
    });
    if (isDoubleBooked) {
      console.log(`- ${profName} is double-booked at ${dia} ${horaInicio}-${horaFin}, skip.`);
      continue;
    }

    // if all checks pass
    eligible.push({ profId, profName });
  }

  if (eligible.length < 2) {
    return {
      success: false,
      message: `Se requieren 2 lectores, hallados: ${eligible.length}.`,
    };
  }

  // pick any 2
  shuffleArray(eligible);
  const chosen = eligible.slice(0, 2);
  console.log(`buscarDosLectores => Found ${eligible.length} eligible, picked 2.`);
  return { success: true, lectores: [chosen[0].profId, chosen[1].profId] };
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* =====================================
   2) LIST ALL CITAS (FOR "CALENDAR")
===================================== */

/**
 * Lists all existing `Cita` records, with proper relationship names 
 */
export async function listAllCitas() {
  console.log("=== listAllCitas: Fetching all Citas with details... ===");
  try {

    const { data: citas, error } = await supabase
      .from("Cita")
      .select(`
        cita_id,
        disponibilidad_id,
        Disponibilidad:disponibilidad_id (
          dia,
          hora_inicio,
          hora_fin
        ),
        tutor:Profesor!Cita_tutor_fkey (
          profesor_id,
          Usuario:id_usuario (
            nombre
          )
        ),
        lector1:Profesor!cita_lector1_fkey (
          profesor_id,
          Usuario:id_usuario (
            nombre
          )
        ),
        lector2:Profesor!cita_lector2_fkey (
          profesor_id,
          Usuario:id_usuario (
            nombre
          )
        ),
        proyecto:Proyecto!Cita_proyecto_id_fkey (
          id,
          estado,
          Estudiante:estudiante_id (
            estudiante_id,
            Usuario:id_usuario (
              nombre
            )
          )
        )
      `);

    if (error) throw error;

    // Transform the data into a simpler shape if desired
    return citas.map((c) => ({
      cita_id: c.cita_id,
      disponibilidad_id: c.disponibilidad_id,
      day: c.Disponibilidad?.dia,
      startTime: c.Disponibilidad?.hora_inicio,
      endTime: c.Disponibilidad?.hora_fin,
      tutorId: c.tutor?.profesor_id,
      tutorName: c.tutor?.Usuario?.nombre,
      lector1Id: c.lector1?.profesor_id,
      lector1Name: c.lector1?.Usuario?.nombre,
      lector2Id: c.lector2?.profesor_id,
      lector2Name: c.lector2?.Usuario?.nombre,
      proyectoId: c.proyecto?.id,
      proyectoEstado: c.proyecto?.estado,
      estudianteName: c.proyecto?.Estudiante?.Usuario?.nombre,
    }));
  } catch (err) {
    console.error("❌ Error in listAllCitas:", err);
    throw err;
  }
}

/* =====================================
   3) UPDATE (MODIFY) AN EXISTING CITA
===================================== */

/**
 * Update an existing Cita by changing "disponibilidad_id", 
 * "lector1", "lector2", etc., re-checking capacity and double-booking. 
 * Returns { success: boolean, reason?: string }.
 */
export async function updateCita(citaId, updates) {
  console.log(`=== updateCita: Attempting to modify Cita ${citaId} ===`);
  try {
    // 1) Fetch the existing Cita
    const { data: existingCita, error: fetchErr } = await supabase
      .from("Cita")
      .select(`
        cita_id,
        tutor,
        lector1,
        lector2,
        proyecto_id,
        disponibilidad_id,
        proyecto:proyecto_id (
          semestre_id
        ),
        Disponibilidad:disponibilidad_id (
          dia,
          hora_inicio,
          hora_fin
        )
      `)
      .eq("cita_id", citaId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existingCita) {
      return { success: false, reason: `No se encontró la Cita con ID ${citaId}.` };
    }

    // Merge old + new
    const newCita = { ...existingCita, ...updates };

    // 2) If "disponibilidad_id" changed, fetch that slot and verify
    let slotDia = existingCita.Disponibilidad.dia;
    let slotHoraInicio = existingCita.Disponibilidad.hora_inicio;
    let slotHoraFin = existingCita.Disponibilidad.hora_fin;
    if (updates.disponibilidad_id && updates.disponibilidad_id !== existingCita.disponibilidad_id) {
      const { data: newSlot, error: slotErr } = await supabase
        .from("disponibilidad")
        .select("id, profesor_id, dia, hora_inicio, hora_fin")
        .eq("id", updates.disponibilidad_id)
        .maybeSingle();
      if (slotErr) throw slotErr;

      if (!newSlot) {
        return { success: false, reason: "La disponibilidad elegida no existe." };
      }

      // check if already used
      const { data: used, error: usedErr } = await supabase
        .from("Cita")
        .select("cita_id")
        .eq("disponibilidad_id", newSlot.id)
        .maybeSingle();
      if (usedErr) throw usedErr;

      // If `used` is found but is not the same Cita, it's a conflict
      if (used && used.cita_id !== citaId) {
        return {
          success: false,
          reason: "Esa disponibilidad ya está ocupada por otra Cita.",
        };
      }

      // ensure same tutor
      if (newSlot.profesor_id !== newCita.tutor) {
        return {
          success: false,
          reason: "La disponibilidad elegida no corresponde al mismo tutor.",
        };
      }

      slotDia = newSlot.dia;
      slotHoraInicio = newSlot.hora_inicio;
      slotHoraFin = newSlot.hora_fin;
    }

    // 3) If lector1 or lector2 changed, re-validate capacity
    const finalLector1 = newCita.lector1;
    const finalLector2 = newCita.lector2;

    if (finalLector1 || finalLector2) {
      if (!finalLector1 || !finalLector2) {
        return { success: false, reason: "Se requieren 2 lectores; faltan datos." };
      }
      // ensure lector1 != lector2
      if (finalLector1 === finalLector2) {
        return { success: false, reason: "lector1 y lector2 no pueden ser el mismo profesor." };
      }

      const semesterId = existingCita.proyecto.semestre_id;

      // check lector1
      const checkL1 = await validateSingleLector(
        finalLector1,
        slotDia,
        slotHoraInicio,
        slotHoraFin,
        semesterId
      );
      if (!checkL1.success) {
        return { success: false, reason: checkL1.reason };
      }

      // check lector2
      const checkL2 = await validateSingleLector(
        finalLector2,
        slotDia,
        slotHoraInicio,
        slotHoraFin,
        semesterId
      );
      if (!checkL2.success) {
        return { success: false, reason: checkL2.reason };
      }
    }

    // 4) Perform the update in Supabase
    const patch = {};
    if (updates.disponibilidad_id) patch.disponibilidad_id = updates.disponibilidad_id;
    if (updates.lector1) patch.lector1 = updates.lector1;
    if (updates.lector2) patch.lector2 = updates.lector2;

    const { error: updateErr } = await supabase
      .from("Cita")
      .update(patch)
      .eq("cita_id", citaId);
    if (updateErr) throw updateErr;

    console.log(`=== Cita ${citaId} updated successfully. ===`);
    return { success: true };
  } catch (err) {
    console.error("❌ Error in updateCita:", err);
    return { success: false, reason: err.message };
  }
}

/**
 * Helper: check if a single professor (profId) can serve as lector 
 * for the given day/time, with capacity=2*cantidad_estudiantes 
 * and no double-booking.
 */
async function validateSingleLector(profId, dia, horaInicio, horaFin, semestreId) {
  // 1) find the professor
  const { data: prof, error: profErr } = await supabase
    .from("Profesor")
    .select("profesor_id, cantidad_estudiantes, Usuario:id_usuario ( nombre )")
    .eq("profesor_id", profId)
    .maybeSingle();
  if (profErr) throw profErr;

  if (!prof) {
    return { success: false, reason: `Profesor con ID ${profId} no existe.` };
  }

  const profName = prof.Usuario?.nombre || "Profesor sin nombre";
  const capacity = 2 * prof.cantidad_estudiantes;

  // how many times they've served as lector
  const { data: lectorCitas, error: lectorErr } = await supabase
    .from("Cita")
    .select("cita_id")
    .eq("semestre_id", semestreId)
    .or(`lector1.eq.${profId},lector2.eq.${profId}`);
  if (lectorErr) throw lectorErr;

  if (lectorCitas.length >= capacity) {
    return {
      success: false,
      reason: `El profesor ${profName} está en su límite de lecturas (máx = ${capacity}).`,
    };
  }

  // check day/time availability
  const { data: slotCheck } = await supabase
    .from("disponibilidad")
    .select("id")
    .eq("profesor_id", profId)
    .eq("dia", dia)
    .eq("hora_inicio", horaInicio)
    .eq("hora_fin", horaFin)
    .maybeSingle();
  if (!slotCheck) {
    return {
      success: false,
      reason: `El profesor ${profName} no tiene disponibilidad para ${dia} ${horaInicio}-${horaFin}.`,
    };
  }

  // check double-booking
  const { data: conflictCitas, error: conflictErr } = await supabase
    .from("Cita")
    .select(`
      cita_id,
      disponibilidad:disponibilidad_id (
        dia, hora_inicio, hora_fin
      )
    `)
    .or(`lector1.eq.${profId},lector2.eq.${profId}`);
  if (conflictErr) throw conflictErr;

  const isDoubleBooked = conflictCitas.some((c) => {
    return (
      c.disponibilidad?.dia === dia &&
      c.disponibilidad?.hora_inicio === horaInicio &&
      c.disponibilidad?.hora_fin === horaFin
    );
  });
  if (isDoubleBooked) {
    return {
      success: false,
      reason: `El profesor ${profName} ya tiene una lectura en ${dia} ${horaInicio}-${horaFin}.`,
    };
  }

  return { success: true };
}

export function generateReports (data) {
  const filteredData = data.map((c) => ({
      Día: c.day,
      Inicio: c.startTime,
      Fin: c.endTime,
      Tutor: c.tutorName,
      Primer_Lector: c.lector1Name,
      Segundo_Lector: c.lector2Name,
      Estado_de_Proyecto: c.proyectoEstado,
      Estudiante: c.estudianteName,
    }));
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Citas de defensa");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Asignaciones de defensas");
}

export async function availabilityReports() {
  try {
    const { data: availabilities, error } = await supabase
      .from("disponibilidad")
      .select(`
        id,
        profesor_id,
        hora_inicio,
        hora_fin,
        dia,
        profesor:Disponibilidad_profesor_id_fkey (
          profesor_id,
          id_usuario,
          usuario:Profesor_id_usuario_fkey (
            nombre
          )
        )
      `);

    if (error) throw error;
    return availabilities.map((a) => ({
      start: a.hora_inicio,
      end: a.hora_fin,
      day: a.dia,
      nombre: a.profesor?.usuario?.nombre,
    }));
  } catch (err) {
    console.error("❌ Error in listAllCitas:", err);
    throw err;
  }
}

export function generateAvailability (data) {
  const filteredData = data.map((a) => ({
      Profesor: a.nombre,
      Día: a.day,
      Inicio: a.start,
      Fin: a.end
    }));
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fechas de disponibilidad");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Disponibilidades de Profesores");
}
