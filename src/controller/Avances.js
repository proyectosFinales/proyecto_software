import supabase from '../model/supabase';

export const fetchAvances = async (proyectoId) => {
  const { data, error } = await supabase
    .from('Avance')
    .select('*')
    .eq('proyecto_id', proyectoId)
    .order('num_avance', { ascending: true });
  if (error) throw error;
  return data;
};

export const updateAvance = async (avanceId, nuevoEstado) => {
  const { error } = await supabase
    .from('Avance')
    .update({ estado: nuevoEstado })
    .eq('id', avanceId);
  if (error) throw error;
};

export const addAvance = async (estado, proyectoId) => {
  const { data: maxNumeroData, error: maxNumeroError } = await supabase
    .from('Avance')
    .select('num_avance')
    .eq('proyecto_id', proyectoId)
    .order('num_avance', { ascending: false })
    .limit(1)
    .single();

  if (maxNumeroError) throw maxNumeroError;

  const nuevoNumero = maxNumeroData ? maxNumeroData.num_avance + 1 : 1;

  const { data: nuevoAvanceData, error: nuevoAvanceError } = await supabase
    .from('Avance')
    .insert({
      proyecto_id: proyectoId,
      num_avance: nuevoNumero,
      estado: estado,
    })
    .select('*')
    .single();

  if (nuevoAvanceError) throw nuevoAvanceError;

  return nuevoAvanceData;
}

export const deleteAvance = async (avanceId) => {
  const { error } = await supabase
    .from('Avance')
    .delete()
    .eq('id', avanceId);
  if (error) throw error;
}