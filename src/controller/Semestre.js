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
