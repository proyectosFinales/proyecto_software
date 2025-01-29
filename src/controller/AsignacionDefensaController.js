// /controllers/AsignacionDefensaController.js
import { v4 as uuidv4 } from "uuid";
import supabase from "../model/supabase";

/**
 * Main function: assign defenses (Citas) to all eligible projects.
 * Returns { assigned: number, unassigned: string[] }
 *   - "unassigned" is an array of error messages explaining why each project wasn't assigned.
 */
export async function assignAllDefensas() {
  try {
    // STEP 1: Fetch all candidate projects
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

    // Filter out only "Aprobado" + "Defensa" + no existing Cita
    const toAssign = [];
    for (const p of projects) {
      const projState = p.estado?.toLowerCase();
      const studState = p.Estudiante?.estado?.toLowerCase();
      if (projState === "aprobado" && studState === "defensa") {
        // check no existing Cita
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

    // STEP 2: Try to assign each project
    for (const project of toAssign) {
      const result = await assignOneDefensa(project);
      if (result.success) {
        assignedCount++;
      } else {
        notAssigned.push(result.reason);
      }
    }

    return {
      assigned: assignedCount,
      unassigned: notAssigned,
    };
  } catch (err) {
    console.error("❌ Error in assignAllDefensas:", err);
    throw err;
  }
}

/**
 * Assign exactly ONE defense (Cita) for a given project, if possible.
 * We'll attempt all free tutor slots in chronological order and pick
 * the first one that yields 2 lectores. If none works, return an error message.
 */
async function assignOneDefensa(project) {
  try {
    // 1) Get the tutor's name for user-friendly errors
    const tutorName = project?.Profesor?.Usuario?.nombre || "Profesor desconocido";

    // 2) Find all free tutor slots
    const freeTutorSlots = await findTutorFreeSlots(project.profesor_id);
    if (!freeTutorSlots || freeTutorSlots.length === 0) {
      // no tutor availability
      return {
        success: false,
        reason: `No hay disponibilidades para el profesor ${tutorName}.`,
      };
    }

    // We'll attempt each slot until we find 2 lectores
    for (const slot of freeTutorSlots) {
      const dia = slot.dia;
      const horaInicio = slot.hora_inicio;
      const horaFin = slot.hora_fin;

      // 3) Try to find 2 lectores for this slot
      const lectorResult = await buscarDosLectores(
        dia,
        horaInicio,
        horaFin,
        project.profesor_id,
        project.semestre_id
      );
      // lectorResult: { success: boolean, lectores?: string[], message?: string }

      if (lectorResult.success && lectorResult.lectores?.length === 2) {
        // We have 2 lectores; insert the new Cita referencing this slot
        const citaId = uuidv4();
        const { error: insertErr } = await supabase.from("Cita").insert({
          cita_id: citaId,
          proyecto_id: project.id,
          estudiante_id: project.estudiante_id,
          semestre_id: project.semestre_id, // ensure this is never "null" string
          tutor: project.profesor_id,
          lector1: lectorResult.lectores[0],
          lector2: lectorResult.lectores[1],
          disponibilidad_id: slot.id, // store the tutor's chosen slot
        });

        if (insertErr) throw insertErr;
        // success, return
        return { success: true };
      } else {
        // either not success or didn't find 2
        // keep trying next slot
        // you might log something for debugging
      }
    }

    // If we exit the loop, no slot worked
    return {
      success: false,
      reason: `No se encontró ningún horario en el que el profesor ${tutorName} y dos lectores pudieran asistir.`,
    };
  } catch (err) {
    console.error("❌ Error in assignOneDefensa:", err);
    return { success: false, reason: err.message };
  }
}

/**
 * Finds all "disponibilidad" rows for a given tutor that are not used in any other Cita.
 * Return them as an array (with {id, dia, hora_inicio, hora_fin...}).
 */
async function findTutorFreeSlots(tutorId) {
  // 1) all availability for that professor
  const { data: allSlots, error: slotErr } = await supabase
    .from("disponibilidad")
    .select("*")
    .eq("profesor_id", tutorId);
  if (slotErr) throw slotErr;

  if (!allSlots || allSlots.length === 0) {
    return [];
  }

  // 2) filter out the ones used by a cita
  const free = [];
  for (const slot of allSlots) {
    // check if there's a cita referencing this slot
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

  // (optional) sort by date/time if you want chronological
  free.sort((a, b) => {
    // first compare day
    const dateA = new Date(a.dia);
    const dateB = new Date(b.dia);
    const diffDate = dateA - dateB;
    if (diffDate !== 0) return diffDate;

    // if same day, compare hora_inicio
    const [hA, mA, sA] = a.hora_inicio.split(":").map(Number);
    const [hB, mB, sB] = b.hora_inicio.split(":").map(Number);
    return hA * 60 + mA - (hB * 60 + mB);
  });

  return free;
}

/**
 * Try to find TWO lector professors who can attend a given day/time.
 * Return { success: boolean, lectores?: string[], message?: string }
 *
 * - We get all professors except the tutor
 * - Check capacity for each
 * - Check they have matching availability for (dia, horaInicio, horaFin)
 * - Check they're not double-booked at that same date/time
 * - If at least 2 are found, success
 * - Otherwise, fail with a message explaining how many we actually found
 */
async function buscarDosLectores(
  dia,
  horaInicio,
  horaFin,
  excludeProfId,
  semestreId
) {
  // 1) fetch all professors with their name, capacity, etc.
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

  // Filter out the tutor
  const possibleLectores = profs.filter((p) => p.profesor_id !== excludeProfId);

  // We'll build an array of { profId, profName } who are actually eligible
  const eligible = [];

  for (const prof of possibleLectores) {
    const profId = prof.profesor_id;
    const profName = prof.Usuario?.nombre || "Profesor sin nombre";
    const realStudents = prof.cantidad_estudiantes - prof.estudiantes_libres;
    const lectorCapacity = 2 * realStudents;

    // Count how many times they've served as lector in the same semester
    const { data: lectorCitas, error: lectorErr } = await supabase
      .from("Cita")
      .select("cita_id")
      .eq("semestre_id", semestreId)
      .or(`lector1.eq.${profId},lector2.eq.${profId}`);
    if (lectorErr) throw lectorErr;

    if (lectorCitas.length >= lectorCapacity) {
      // This professor is at capacity, skip
      continue;
    }

    // check if they have a matching availability row
    const { data: lectorSlot, error: lectorSlotErr } = await supabase
      .from("disponibilidad")
      .select("id")
      .eq("profesor_id", profId)
      .eq("dia", dia)
      .eq("hora_inicio", horaInicio)
      .eq("hora_fin", horaFin)
      .maybeSingle();
    if (lectorSlotErr) throw lectorSlotErr;
    if (!lectorSlot) {
      // they don't have that day/time
      continue;
    }

    // Check double booking for same day/time
    // We'll look for any Cita that references a disponibilidad with the same day/time
    // and has lector1 or lector2 = profId
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

    // see if any have the same day/time
    const isDoubleBooked = conflictCitas.some((cita) => {
      return (
        cita.disponibilidad?.dia === dia &&
        cita.disponibilidad?.hora_inicio === horaInicio &&
        cita.disponibilidad?.hora_fin === horaFin
      );
    });
    if (isDoubleBooked) {
      // can't serve as lector at the same time
      continue;
    }

    // If we got here, professor is eligible
    eligible.push({ profId, profName });
  }

  // We need at least 2
  if (eligible.length < 2) {
    return {
      success: false,
      message: `Se requieren 2 profesores lectores disponibles, pero solo se encontró(n) ${eligible.length} para la fecha/horario ${dia} ${horaInicio}-${horaFin}.`,
    };
  }

  // pick any 2 (random or first two)
  shuffleArray(eligible);
  const chosen = eligible.slice(0, 2);

  return {
    success: true,
    lectores: [chosen[0].profId, chosen[1].profId],
    message: `Elegidos: ${chosen[0].profName} y ${chosen[1].profName}.`,
  };
}

/** Utility: shuffle array in-place */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
