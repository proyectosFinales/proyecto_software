// /controllers/AsignacionDefensaController.js

import { v4 as uuidv4 } from "uuid";
import supabase from "../model/supabase";

export async function assignAllDefensas() {
  try {
    console.log("=== assignAllDefensas: Starting... ===");
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

    // Filter to "Aprobado" + "Defensa" + no Cita
    const toAssign = [];
    for (const p of projects) {
      const projState = p.estado?.toLowerCase();
      const studState = p.Estudiante?.estado?.toLowerCase();
      if (projState === "aprobado" && studState === "defensa") {
        // check no Cita
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

    for (const project of toAssign) {
      const result = await assignOneDefensa(project);
      if (result.success) {
        assignedCount++;
      } else {
        notAssigned.push(result.reason);
      }
    }

    console.log("=== assignAllDefensas: Done. ===");
    return {
      assigned: assignedCount,
      unassigned: notAssigned,
    };
  } catch (err) {
    console.error("❌ Error in assignAllDefensas:", err);
    throw err;
  }
}

async function assignOneDefensa(project) {
  try {
    const tutorName = project?.Profesor?.Usuario?.nombre || "Profesor desconocido";
    console.log(`\n--- assignOneDefensa for Project [${project.id}], tutor: ${tutorName} ---`);

    // Tutor slots
    const freeTutorSlots = await findTutorFreeSlots(project.profesor_id);
    if (!freeTutorSlots || freeTutorSlots.length === 0) {
      const msg = `No hay disponibilidades para el profesor ${tutorName}.`;
      console.warn(msg);
      return { success: false, reason: msg };
    }

    // Try each slot in ascending day/time order
    for (const slot of freeTutorSlots) {
      const dayString = slot.dia;
      const startTime = slot.hora_inicio;
      const endTime = slot.hora_fin;
      console.log(`Trying slot => ${dayString} ${startTime}-${endTime} for tutor ${tutorName}`);

      // find 2 lectores
      const lectorResult = await buscarDosLectores(
        dayString,
        startTime,
        endTime,
        project.profesor_id,
        project.semestre_id
      );

      if (lectorResult.success && lectorResult.lectores?.length === 2) {
        console.log(
          `✓ Found 2 lectores for slot ${dayString} ${startTime}-${endTime}:`,
          lectorResult.lectores
        );

        // Insert Cita
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

        console.log(`✓ Inserted Cita for project ${project.id}, ID: ${citaId}`);
        return { success: true };
      } else {
        // no 2 lectores found here
        console.warn(
          `✗ No 2 lectores found at ${dayString} ${startTime}-${endTime}. Reason: ${
            lectorResult.message || "unknown"
          }`
        );
      }
    }

    // If we exit the loop, no slot worked
    const failMsg = `No se encontró ningún horario en el que el profesor ${tutorName} y dos lectores pudieran asistir.`;
    console.warn(failMsg);
    return { success: false, reason: failMsg };
  } catch (err) {
    console.error("❌ Error in assignOneDefensa:", err);
    return { success: false, reason: err.message };
  }
}

async function findTutorFreeSlots(tutorId) {
  const { data: allSlots, error: slotErr } = await supabase
    .from("disponibilidad")
    .select("*")
    .eq("profesor_id", tutorId);

  if (slotErr) throw slotErr;
  if (!allSlots || allSlots.length === 0) {
    return [];
  }

  // filter out used
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

  // sort ascending by date/time
  free.sort((a, b) => {
    const dateA = new Date(a.dia);
    const dateB = new Date(b.dia);
    const diff = dateA - dateB;
    if (diff !== 0) return diff;

    // same day => compare hour
    const [hA, mA] = a.hora_inicio.split(":").map(Number);
    const [hB, mB] = b.hora_inicio.split(":").map(Number);
    return hA * 60 + mA - (hB * 60 + mB);
  });

  return free;
}

/**
 * KEY CHANGE: lectorCapacity = 2 * cantidad_estudiantes
 * (Ignoring 'estudiantes_libres' now, per your request.)
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
      estudiantes_libres,
      Usuario:id_usuario (
        nombre
      )
    `);
  if (profsErr) throw profsErr;

  // Filter out tutor
  const possibleLectores = profs.filter((p) => p.profesor_id !== excludeProfId);

  const eligible = [];

  for (const prof of possibleLectores) {
    const profId = prof.profesor_id;
    const profName = prof.Usuario?.nombre || "Profesor sin nombre";

    // --- [Key line changed here] ---
    const lectorCapacity = 2 * prof.cantidad_estudiantes;

    // how many times they've served as lector
    const { data: lectorCitas, error: lectorErr } = await supabase
      .from("Cita")
      .select("cita_id")
      .eq("semestre_id", semestreId)
      .or(`lector1.eq.${profId},lector2.eq.${profId}`);
    if (lectorErr) throw lectorErr;

    if (lectorCitas.length >= lectorCapacity) {
      console.log(`- ${profName} is at lector capacity (limit ${lectorCapacity}), skip.`);
      continue;
    }

    // check if they have availability
    const { data: lectorSlot } = await supabase
      .from("disponibilidad")
      .select("id, dia, hora_inicio, hora_fin")
      .eq("profesor_id", profId)
      .eq("dia", dia)
      .eq("hora_inicio", horaInicio)
      .eq("hora_fin", horaFin)
      .maybeSingle();

    if (!lectorSlot) {
      // no matching day/time
      continue;
    }

    // check double-booking
    const { data: conflictCitas, error: conflictErr } = await supabase
      .from("Cita")
      .select(
        `
        cita_id,
        lector1,
        lector2,
        disponibilidad:disponibilidad_id (
          id,
          dia,
          hora_inicio,
          hora_fin
        )
      `
      )
      .or(`lector1.eq.${profId},lector2.eq.${profId}`);
    if (conflictErr) throw conflictErr;

    const isDoubleBooked = conflictCitas.some(
      (c) =>
        c.disponibilidad?.dia === dia &&
        c.disponibilidad?.hora_inicio === horaInicio &&
        c.disponibilidad?.hora_fin === horaFin
    );
    if (isDoubleBooked) {
      console.log(`- ${profName} is double-booked at ${dia} ${horaInicio}-${horaFin}, skip.`);
      continue;
    }

    // if we got here, we can use them as lector
    eligible.push({ profId, profName });
  }

  // need at least 2
  if (eligible.length < 2) {
    const msg = `Se requieren 2 profesores lectores. Solo se encontró(n) ${eligible.length} para ${dia} ${horaInicio}-${horaFin}.`;
    return { success: false, message: msg };
  }

  // pick 2 randomly
  shuffleArray(eligible);
  const chosen = eligible.slice(0, 2);

  console.log(`buscarDosLectores => Found ${eligible.length} eligible, chosen:`, chosen);
  return {
    success: true,
    lectores: [chosen[0].profId, chosen[1].profId],
  };
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
