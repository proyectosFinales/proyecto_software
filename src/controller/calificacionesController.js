import supabase from "../model/supabase";

/**
 * Obtiene el proyecto actual de un Estudiante para un semestre específico.
 * @param {string} estudiante_id - Estudiante ID
 * @param {number} semestre_id - El semestre actual (por ejemplo, 1, 2, etc.)
 * @returns {Object} Objeto con { proyecto_id, profesor_id }, o lanza error si no existe.
 */
async function obtenerProyectoEstudiante(estudiante_id, semestre_id) {
  // Ajusta nombre de tabla, columnas, y filtros según tu esquema.
  const { data, error } = await supabase
    .from("Proyecto")
    .select("id, profesor_id")
    .eq("estudiante_id", estudiante_id)
    .eq("semestre_id", semestre_id)
    .single();

  if (error) {
    throw new Error("Error al buscar Proyecto para el estudiante: " + error.message);
  }

  if (!data) {
    throw new Error("No se encontró un Proyecto activo para el estudiante en el semestre " + semestre_id);
  }

  return {
    proyecto_id: data.id,
    profesor_id: data.profesor_id
  };
}

/**
 * Inserta una fila en la tabla "Calificacion", usando los datos del form.
 * @param {Object} formData   - Objeto con la estructura { serviceRatings: {...}, recommendationScore, starRating, additionalComments }
 * @param {string} estudiante_id 
 * @param {number} semestre_id - Semestre actual
 */
export async function calificarProfesor(formData, estudiante_id, semestre_id = 1) {
  // 1. Buscar Proyecto del estudiante en el semestre actual.
  const { proyecto_id, profesor_id } = await obtenerProyectoEstudiante(estudiante_id, semestre_id);

  // 2. Preparar payload para insertar en "Calificacion".
  // Ajusta los nombres de columnas (comillas o no) según tu esquema real.
  const payload = {
    proyecto_id: proyecto_id,
    profesor_id: profesor_id,
    estudiante_id: estudiante_id,
    semestre_id: semestre_id,

    // Extrae los puntajes del formData.serviceRatings
    score_agilidad: formData.serviceRatings.agilidad,
    score_empatia: formData.serviceRatings.empatia,
    score_respeto: formData.serviceRatings.respeto,
    score_comunicacion: formData.serviceRatings.comunicacion,
    score_aclaracion: formData.serviceRatings.aclaracion,
    score_respuestas: formData.serviceRatings.respuestas,
    score_correccion: formData.serviceRatings.correccion,
    score_explicacion: formData.serviceRatings.explicacion,
    score_retroalimentacion: formData.serviceRatings.retroalimentacion,

    recomendacion: formData.recommendationScore,
    star_rating: formData.starRating,
    comentarios: formData.additionalComments
    // created_at y updated_at se pueden manejar con default NOW() en la BD
  };

  // 3. Insertar en la tabla "Calificacion".
  const { data, error } = await supabase
    .from("Calificacion")
    .insert([ payload ]);

  if (error) {
    throw new Error("Error al insertar Calificacion: " + error.message);
  }

  return data;
}

export default {
  calificarProfesor
};