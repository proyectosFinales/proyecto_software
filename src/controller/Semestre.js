import supabase from "../model/supabase";

export const fetchSemestres = async () => {
  const {data, error} = await supabase
    .from('Semestre')
    .select('semestre_id, nombre')
    .order('semestre_id', { ascending: false });
  
  if (error) 
    throw error;
  return data;
}

export const fetchSemestreActual = async () => {
  const { data: semestreData, error: semestreError } = await supabase
    .from('Semestre')
    .select('semestre_id')
    .not('calendario_id', 'is', null)
    .limit(1);

  if (semestreError) {
    throw new Error(semestreError.message);
  }

  let semestreId;

  if (semestreData.length > 0) {
    semestreId = semestreData[0].semestre_id;
  } else {
    const { data: maxSemestreData, error: maxSemestreError } = await supabase
      .from('Semestre')
      .select('semestre_id')
      .order('semestre_id', { ascending: false })
      .limit(1);

    if (maxSemestreError) {
      throw new Error(maxSemestreError.message);
    }

    if (maxSemestreData.length > 0) {
      semestreId = maxSemestreData[0].semestre_id;
    } else {
      throw new Error('No se encontró ningún semestre.');
    }
  }
  return semestreId;
}

// Obtener semestres con calificaciones
// Mae que source code más malo, con todo respeto el de la base de datos...
export const getSemestresDeCalificaciones = async () => {
  try {
    // Se consultan ambas columnas para construir el semestre
    const { data, error } = await supabase
      .from('Acta')
      .select('semestre, fecha_creacion'); // Se seleccionan ambas columnas

    if (error) {
      throw new Error(`Error al consultar semestres de actas: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Usar un Set para garantizar valores unicos
    const semesterSet = new Set();
    
    data.forEach(item => {
      // Se necesita el semestre ("I" o "II") y la fecha
      if (item.semestre && item.fecha_creacion) {
        // Se extrae el año de la fecha de creacion
        const year = new Date(item.fecha_creacion).getFullYear();
        semesterSet.add(`${item.semestre}-${year}`);
      }
    });

    // Devuelve la lista de strings unicos, ej: ["I-2025", "II-2024"]
    // Se ordena de forma descendente para mostrar el mas reciente primero
    return Array.from(semesterSet).sort().reverse();

  } catch (error) {
    console.error(error.message);
    return [];
  }
};