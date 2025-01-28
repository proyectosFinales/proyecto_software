/**
 * file: src/controller/calificacionesController.js
 *
 * A comprehensive controller for managing "Calificacion" records:
 * - Insert/update calificaciones
 * - Fetch raw calificaciones (with optional filters)
 * - Various aggregators (statistics, trends, breakdowns, distributions)
 * - Helper functions to look up Estudiante, Proyecto, Semestre, etc.
 */

import supabase from "../model/supabase";

/* ------------------------------------------------------
 *  HELPER / UTILITY FUNCTIONS
 * ------------------------------------------------------ */

/**
 * Busca el "Estudiante" dado un usuarioId (ID del usuario de la sesión).
 * Retorna un objeto { estudiante_id, estado } o lanza un Error si no existe.
 *
 * @param  {string} usuarioId - UUID del usuario en la tabla Usuario
 * @return {Promise<{ estudiante_id: string, estado: string }>}
 */
export async function obtenerEstudiantePorUsuario(usuarioId) {
  const { data: student, error } = await supabase
    .from("Estudiante")
    .select("estudiante_id, estado")
    .eq("id_usuario", usuarioId)
    .single();

  if (error) {
    throw new Error(`Error buscando Estudiante: ${error.message}`);
  }
  if (!student) {
    throw new Error("No se encontró Estudiante para este usuarioId.");
  }
  return student;
}

/**
 * Obtiene el primer "Proyecto" asociado a un Estudiante.
 * (Si un estudiante tuviera múltiples proyectos, podrías ajustarlo).
 * Retorna { id, profesor_id, estado, semestre_id } o lanza Error si no existe.
 *
 * @param  {string} estudiante_id
 * @return {Promise<Object>}
 */
export async function obtenerProyectoEstudiante(estudiante_id) {
  const { data: proyectos, error } = await supabase
    .from("Proyecto")
    .select("id, profesor_id, estado, semestre_id")
    .eq("estudiante_id", estudiante_id);

  if (error) {
    throw new Error(`Error buscando Proyecto: ${error.message}`);
  }
  if (!proyectos || proyectos.length === 0) {
    throw new Error("No se encontró Proyecto para este estudiante.");
  }
  return proyectos[0];
}

/**
 * Busca el semestre activo en la tabla Semestre, donde activo = true.
 * Retorna el semestre_id (integer) o lanza Error si no hay un semestre activo.
 *
 * @return {Promise<number>}
 */
export async function obtenerSemestreActivo() {
  const { data, error } = await supabase
    .from("Semestre")
    .select("semestre_id, activo")
    .eq("activo", true)
    .single();

  if (error) {
    throw new Error(`Error buscando Semestre activo: ${error.message}`);
  }
  if (!data) {
    throw new Error("No se encontró un Semestre activo. Verifica la BD.");
  }
  return data.semestre_id;
}

/* ------------------------------------------------------
 *  INSERT / CREATE
 * ------------------------------------------------------ */

/**
 * Inserta una nueva "Calificacion" en la BD. 
 * Combina datos del usuario (Estudiante) y su Proyecto, y
 * asocia automáticamente el semestre_id activo.
 *
 * @param {Object}  formData   - Contiene las puntuaciones/criterios, recomendación, etc.
 * @param {string}  usuarioId  - UUID del usuario (sesión)
 * @return {Promise<any>}      - Retorna la data insertada o lanza Error.
 */
export async function calificarProfesor(formData, usuarioId) {
  // 1) Buscar el Estudiante
  const { estudiante_id } = await obtenerEstudiantePorUsuario(usuarioId);

  // 2) Buscar el primer Proyecto asociado
  const proyecto = await obtenerProyectoEstudiante(estudiante_id);

  // 3) Obtener semestre activo
  const semestre_id = await obtenerSemestreActivo();

  // 4) Construir payload con criterios y recomendación
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
    recomendacion: formData.recommendationScore, // e.g., 1-5
    star_rating: formData.starRating,           // e.g., 1-5
    comentarios: formData.additionalComments
  };

  // 5) Insertar
  const { data, error } = await supabase
    .from("Calificacion")
    .insert([ payload ]);

  if (error) {
    throw new Error(`Error al insertar la Calificacion: ${error.message}`);
  }
  return data;
}

/* ------------------------------------------------------
 *  RETRIEVE / READ
 * ------------------------------------------------------ */

/**
 * Obtiene un arreglo de "Calificacion", con joins a Profesor->Usuario y Proyecto, 
 * opcionalmente filtradas por 'professorId' y/o 'semesterId'.
 *
 * @param  {Object}   filters - { professorId?: string, semesterId?: number }
 * @return {Promise<Array>}   - Array de calificaciones
 */
export async function fetchAllCalificaciones({ professorId, semesterId } = {}) {
  let query = supabase
    .from("Calificacion")
    .select(`
      id,
      profesor_id,
      proyecto_id,
      estudiante_id,
      semestre_id,
      score_agilidad,
      score_empatia,
      score_respeto,
      score_comunicacion,
      score_aclaracion,
      score_respuestas,
      score_correccion,
      score_explicacion,
      score_retroalimentacion,
      recomendacion,
      star_rating,
      comentarios,
      fecha_calificacion,
      Profesor:profesor_id (
        profesor_id,
        id_usuario,
        Usuario: id_usuario (
          id,
          nombre
        )
      ),
      Proyecto:proyecto_id (
        id,
        semestre_id
      )
    `);

  if (professorId) {
    query = query.eq("profesor_id", professorId);
  }
  if (semesterId) {
    query = query.eq("semestre_id", semesterId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching Calificaciones: ${error.message}`);
  }
  return data;
}

/* ------------------------------------------------------
 *  AGGREGATORS / STATISTICS
 * ------------------------------------------------------ */

/**
 * Aggregator: estadísticos de nivel alto para tarjetas de "Dashboard."
 * Por ejemplo:
 *   - averageRating
 *   - totalReviews
 *   - recommendationScore (promedio)
 *   - responseRate (placeholder, si no se maneja, se fija en 0)
 *   - semesterProgress (puede ser un placeholder o lógica real)
 *
 * @param  {Object}  filters - { semesterId?: number, professorId?: string }
 * @return {Promise<{ averageRating: number, totalReviews: number, recommendationScore: number, responseRate: number, semesterProgress: object }>}
 */
export async function fetchDashboardStats({ semesterId, professorId } = {}) {
  let query = supabase
    .from("Calificacion")
    .select("star_rating, recomendacion");

  if (semesterId) query = query.eq("semestre_id", semesterId);
  if (professorId) query = query.eq("profesor_id", professorId);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching dashboard stats: ${error.message}`);
  }

  const count = data.length;
  let sumStars = 0;
  let sumRecs = 0;

  data.forEach(row => {
    sumStars += row.star_rating || 0;
    sumRecs += row.recomendacion || 0;
  });

  // Evitamos división por cero
  const averageRating = count === 0 ? 0 : sumStars / count;
  const recommendationScore = count === 0 ? 0 : sumRecs / count;

  // EJEMPLO placeholder, en caso de no tener una métrica real
  // para "tasa de respuesta" o "progreso semestral":
  const responseRate = 0;
  const semesterProgress = {
    current: count,
    total: 100, // cambia esto según tu lógica real
    percentage: count ? Math.min(100, (count / 100) * 100) : 0
  };

  return {
    averageRating,
    totalReviews: count,
    recommendationScore,
    responseRate,
    semesterProgress
  };
}

/**
 * Aggregator: Tendencia de calificación (star_rating) a lo largo de varios semestres.
 * Útil para un LineChart en "Tendencia por Semestre."
 *
 * Devuelve un array con objetos del tipo:
 *   [
 *     { semester: "2023-1", rating: 4.2, students: 40 },
 *     { semester: "2023-2", rating: 4.5, students: 52 },
 *     ...
 *   ]
 *
 * @param  {Object}   filters - { professorId?: string }
 * @return {Promise<Array>}
 */
export async function fetchSemesterRatingTrend({ professorId } = {}) {
  // OPCIÓN 1: Usar un RPC / Postgres Function si la tienes
  // OPCIÓN 2: Hacer un join manual a la tabla Semestre
  // EJEMPLO con la tabla "Calificacion" + "Semestre"
  let query = supabase
    .from("Calificacion")
    .select(`
      star_rating,
      semestre_id,
      Semestre:semestre_id ( nombre )
    `);

  if (professorId) {
    query = query.eq("profesor_id", professorId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching semester rating trend: ${error.message}`);
  }

  // Agrupamos por semestre_id
  const map = {}; // { [semestre_id]: { semesterName, sumRating, count } }
  data.forEach(row => {
    const sId = row.semestre_id;
    const sName = row.Semestre?.nombre || `Sem #${sId}`;

    if (!map[sId]) {
      map[sId] = { semesterName: sName, sumRating: 0, count: 0 };
    }
    map[sId].sumRating += (row.star_rating || 0);
    map[sId].count++;
  });

  // Convertimos el map en un array
  const results = Object.keys(map).map(semId => {
    const obj = map[semId];
    const avg = obj.count === 0 ? 0 : obj.sumRating / obj.count;
    return {
      semester: obj.semesterName,
      rating: parseFloat(avg.toFixed(2)),
      students: obj.count
    };
  });

  // Ordenamos (opcional) por nombre de semestre, etc.
  return results.sort((a, b) => (a.semester > b.semester ? 1 : -1));
}

/**
 * Aggregator: Desglose por criterio. Calcula promedios de campos numéricos 
 * (score_agilidad, score_empatia, etc.) para el conjunto filtrado.
 * Devuelve un array p.ej:
 *   [
 *     { name: 'Agilidad', value: 4.6 },
 *     { name: 'Empatía', value: 4.8 },
 *     ...
 *   ]
 *
 * @param  {Object}   filters - { semesterId?: number, professorId?: string }
 * @return {Promise<Array>}
 */
export async function fetchCriteriaBreakdown({ semesterId, professorId } = {}) {
  let query = supabase
    .from("Calificacion")
    .select(`
      score_agilidad,
      score_empatia,
      score_respeto,
      score_comunicacion,
      score_aclaracion,
      score_respuestas,
      score_correccion,
      score_explicacion,
      score_retroalimentacion
    `);

  if (semesterId) {
    query = query.eq("semestre_id", semesterId);
  }
  if (professorId) {
    query = query.eq("profesor_id", professorId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching criteria breakdown: ${error.message}`);
  }
  if (!data || data.length === 0) {
    // Si no hay datos, retornamos 0 en cada criterio
    return [
      { name: 'Agilidad', value: 0 },
      { name: 'Empatía', value: 0 },
      { name: 'Respeto', value: 0 },
      { name: 'Comunicación', value: 0 },
      { name: 'Aclaración', value: 0 },
      { name: 'Respuestas', value: 0 },
      { name: 'Corrección', value: 0 },
      { name: 'Explicación', value: 0 },
      { name: 'Retroalimentación', value: 0 }
    ];
  }

  const count = data.length;
  let sumAgilidad = 0, sumEmpatia = 0, sumRespeto = 0,
      sumComun = 0, sumAclara = 0, sumResp = 0,
      sumCorr = 0, sumExp = 0, sumRetro = 0;

  data.forEach(row => {
    sumAgilidad += row.score_agilidad || 0;
    sumEmpatia += row.score_empatia || 0;
    sumRespeto += row.score_respeto || 0;
    sumComun += row.score_comunicacion || 0;
    sumAclara += row.score_aclaracion || 0;
    sumResp += row.score_respuestas || 0;
    sumCorr += row.score_correccion || 0;
    sumExp += row.score_explicacion || 0;
    sumRetro += row.score_retroalimentacion || 0;
  });

  return [
    { name: 'Agilidad',         value: parseFloat((sumAgilidad / count).toFixed(1)) },
    { name: 'Empatía',          value: parseFloat((sumEmpatia / count).toFixed(1)) },
    { name: 'Respeto',          value: parseFloat((sumRespeto / count).toFixed(1)) },
    { name: 'Comunicación',     value: parseFloat((sumComun / count).toFixed(1)) },
    { name: 'Aclaración',       value: parseFloat((sumAclara / count).toFixed(1)) },
    { name: 'Respuestas',       value: parseFloat((sumResp / count).toFixed(1)) },
    { name: 'Corrección',       value: parseFloat((sumCorr / count).toFixed(1)) },
    { name: 'Explicación',      value: parseFloat((sumExp / count).toFixed(1)) },
    { name: 'Retroalimentación',value: parseFloat((sumRetro / count).toFixed(1)) }
  ];
}

/**
 * Aggregator: Distribución de "Recomendaciones". 
 * Ideal para un PieChart. Ejemplo simple: 'recomendacion' = 1 => Sí; caso contrario => No.
 * Ajusta la lógica según tu escala (p.ej. 1..5).
 *
 * @param  {Object}   filters - { semesterId?: number, professorId?: string }
 * @return {Promise<Array>}    - Array con [{ name, value }]
 */
export async function fetchPieData({ semesterId, professorId } = {}) {
  let query = supabase
    .from("Calificacion")
    .select("id, recomendacion");

  if (semesterId) {
    query = query.eq("semestre_id", semesterId);
  }
  if (professorId) {
    query = query.eq("profesor_id", professorId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching Pie data: ${error.message}`);
  }

  let recYes = 0;
  let recNo = 0;

  // Suponiendo recomendacion = 1 => "Sí", otro => "No"
  data.forEach(row => {
    if (row.recomendacion === 1) recYes++;
    else recNo++;
  });

  return [
    { name: "Recomienda", value: recYes },
    { name: "No recomienda", value: recNo }
  ];
}

/**
 * Aggregator: Distribución de "recomendacion" en buckets (ej.: 1..5).
 * Útil si manejas recomendacion con rangos, y quieres un Pie/Bar con
 * la cantidad en cada puntuación.
 *
 * @param  {Object}  filters - { semesterId?: number, professorId?: string }
 * @return {Promise<Array>}   - [{ label: '1', count: x }, { label: '2', count: y }, ...]
 */
export async function fetchRecommendationDistribution({ semesterId, professorId } = {}) {
  let query = supabase
    .from("Calificacion")
    .select("recomendacion");

  if (semesterId) query = query.eq("semestre_id", semesterId);
  if (professorId) query = query.eq("profesor_id", professorId);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching recommendation distribution: ${error.message}`);
  }

  // Ejemplo: guardamos recs en un map { '1': count, '2': count, '3': count, '4': count, '5': count }
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach(row => {
    const r = parseInt(row.recomendacion || 0, 10);
    if (distribution[r] !== undefined) {
      distribution[r]++;
    } else {
      // Si no está en 1..5, lo sumamos a un "otros" si deseas
    }
  });

  // Convertimos a array
  return Object.keys(distribution).map(k => ({
    score: k,
    count: distribution[k],
    color: colorForScore(k) // ver func auxiliar abajo
  }));
}

/**
 * Función auxiliar para asignar un color a cada bucket de recomendación. 
 * Totalmente personalizable.
 */
function colorForScore(score) {
  switch (score) {
    case '5': return '#22c55e'; // green
    case '4': return '#3b82f6'; // blue
    case '3': return '#f59e0b'; // amber
    case '2': return '#ef4444'; // red
    case '1': return '#a855f7'; // purple
    default:  return '#6b7280'; // gray
  }
}

/**
 * Aggregator: últimos comentarios (limite 4) para mostrarlos en dashboard.
 * Retorna un array con objetos { text, semesterName, date }.
 *
 * @param  {Object}   filters - { semesterId?: number, professorId?: string }
 * @return {Promise<Array>}
 */
export async function fetchRecentComments({ semesterId, professorId } = {}) {
  let query = supabase
    .from("Calificacion")
    .select(`
      comentarios,
      fecha_calificacion,
      semestre_id,
      Semestre:semestre_id ( nombre )
    `)
    .order("fecha_calificacion", { ascending: false })
    .limit(4);

  if (semesterId) query = query.eq("semestre_id", semesterId);
  if (professorId) query = query.eq("profesor_id", professorId);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching recent comments: ${error.message}`);
  }

  return data.map(row => ({
    text: row.comentarios || "",
    semesterName: row.Semestre?.nombre || `Sem #${row.semestre_id}`,
    date: row.fecha_calificacion
      ? new Date(row.fecha_calificacion).toLocaleDateString()
      : ""
  }));
}

/**
 * Aggregator: Distribución de star_rating (1..5). Similar a "recommendationDistribution".
 * Retorna un array con la cuenta de cuántos han dado 1, 2, 3, 4, 5 estrellas.
 *
 * @param  {Object}   filters - { semesterId?: number, professorId?: string }
 * @return {Promise<Array>}    - e.g. [ {star: 1, count: 3}, {star: 2, count: 10}, ... ]
 */
export async function fetchStarRatingDistribution({ semesterId, professorId } = {}) {
  let query = supabase
    .from("Calificacion")
    .select("star_rating");

  if (semesterId) query = query.eq("semestre_id", semesterId);
  if (professorId) query = query.eq("profesor_id", professorId);

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching star rating distribution: ${error.message}`);
  }

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach(row => {
    const rating = parseInt(row.star_rating || 0, 10);
    if (dist[rating] !== undefined) {
      dist[rating]++;
    }
  });

  return Object.keys(dist).map(key => ({
    star: parseInt(key, 10),
    count: dist[key]
  }));
}

/**
 * Aggregator (OPCIONAL): Muestra la calificación promedio de CADA profesor,
 * ordenado desc por star_rating, o cualquier otra métrica.
 * Podrías usarlo para un ranking de profesores (Mejores/Más bajitos).
 *
 * @param  {Object}  filters - { semesterId?: number } (opcional)
 * @return {Promise<Array>}   - e.g. [ { profesor_id, nombreProfesor, avgStar, totalCals }, ... ]
 */
export async function fetchProfessorRanking({ semesterId } = {}) {
  // Este query extrae (Profesor->Usuario.nombre) y star_rating
  let query = supabase
    .from("Calificacion")
    .select(`
      profesor_id,
      star_rating,
      Profesor:profesor_id (
        profesor_id,
        id_usuario,
        Usuario: id_usuario (
          nombre
        )
      )
    `);

  if (semesterId) {
    query = query.eq("semestre_id", semesterId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching professor ranking: ${error.message}`);
  }

  // Agrupamos por profesor_id
  const map = {};
  data.forEach(row => {
    if (!map[row.profesor_id]) {
      map[row.profesor_id] = {
        nombre: row.Profesor?.Usuario?.nombre || "Desconocido",
        sumStars: 0,
        count: 0
      };
    }
    map[row.profesor_id].sumStars += (row.star_rating || 0);
    map[row.profesor_id].count++;
  });

  // Creamos array final
  const results = Object.keys(map).map(profId => {
    const m = map[profId];
    const avg = m.count === 0 ? 0 : m.sumStars / m.count;
    return {
      profesor_id: profId,
      nombreProfesor: m.nombre,
      avgStar: parseFloat(avg.toFixed(2)),
      totalCals: m.count
    };
  });

  // Orden descendente
  return results.sort((a, b) => b.avgStar - a.avgStar);
}

/* ------------------------------------------------------
 *  EXPORT ALL
 * ------------------------------------------------------ */

const calificacionesController = {
  calificarProfesor,
  fetchAllCalificaciones,
  fetchDashboardStats,
  fetchSemesterRatingTrend,
  fetchCriteriaBreakdown,
  fetchPieData,
  fetchRecommendationDistribution,
  fetchRecentComments,
  fetchStarRatingDistribution,
  fetchProfessorRanking,
};

export default calificacionesController;
