import supabase from "../model/supabase";

/**
 * Busca el "Estudiante" dado un usuarioId (en la sesión).
 * Retorna { estudiante_id, estado } o lanza Error si no existe.
 */
async function obtenerEstudiantePorUsuario(usuarioId) {
  const { data: stud, error: errStud } = await supabase
    .from("Estudiante")
    .select("estudiante_id, estado")
    .eq("id_usuario", usuarioId)
    .single();

  if (errStud) {
    throw new Error("Error buscando Estudiante: " + errStud.message);
  }
  if (!stud) {
    throw new Error("No se encontró Estudiante para este usuarioId.");
  }
  return stud;
}

/**
 * Obtiene el proyecto(s) actual(es) de un Estudiante (sin filtrar semestre).
 * Retorna caso de uso, aquí escogemos el primero.
 */
async function obtenerProyectoEstudiante(estudiante_id) {
  const { data: proys, error: errProy } = await supabase
    .from("Proyecto")
    .select("id, profesor_id, estado")
    .eq("estudiante_id", estudiante_id);

  if (errProy) {
    throw new Error("Error buscando Proyecto: " + errProy.message);
  }
  if (!proys || proys.length === 0) {
    throw new Error("No se encontró Proyecto para este estudiante.");
  }

  return proys[0];
}

/**
 * Busca el semestre activo en la tabla Semestre (donde activo = true).
 */
async function obtenerSemestreActivo() {
  const { data: semRow, error: sError } = await supabase
    .from("Semestre")
    .select("semestre_id, activo")
    .eq("activo", true)
    .single();

  if (sError) {
    throw new Error("Error buscando Semestre activo: " + sError.message);
  }
  if (!semRow) {
    throw new Error("No se encontró un Semestre activo. Verifica la BD.");
  }
  return semRow.semestre_id;
}

/**
 * Inserta una fila en la tabla "Calificacion".
 * @param {Object} formData   - { serviceRatings: {...}, recommendationScore, starRating, additionalComments }
 * @param {string} usuarioId  - ID del usuario (session token)
 */
export async function calificarProfesor(formData, usuarioId) {
  // 1) Buscar Estudiante
  const { estudiante_id } = await obtenerEstudiantePorUsuario(usuarioId);

  // 2) Buscar primer Proyecto asociado
  const proyecto = await obtenerProyectoEstudiante(estudiante_id);

  // 3) Buscar semestre activo
  const semestre_id = await obtenerSemestreActivo();

  // 4) Construir payload con el semestre_id activo
  const payload = {
    proyecto_id: proyecto.id,
    profesor_id: proyecto.profesor_id,
    estudiante_id,
    semestre_id,

    score_agilidad:          formData.serviceRatings.agilidad,
    score_empatia:           formData.serviceRatings.empatia,
    score_respeto:           formData.serviceRatings.respeto,
    score_comunicacion:      formData.serviceRatings.comunicacion,
    score_aclaracion:        formData.serviceRatings.aclaracion,
    score_respuestas:        formData.serviceRatings.respuestas,
    score_correccion:        formData.serviceRatings.correccion,
    score_explicacion:       formData.serviceRatings.explicacion,
    score_retroalimentacion: formData.serviceRatings.retroalimentacion,

    recomendacion: formData.recommendationScore,
    star_rating: formData.starRating,
    comentarios: formData.additionalComments
  };

  // 5) Insertar en "Calificacion"
  const { data, error } = await supabase
    .from("Calificacion")
    .insert([ payload ]);

  if (error) {
    throw new Error("Error al insertar la Calificacion: " + error.message);
  }

  return data;
}

export default {
  calificarProfesor
};