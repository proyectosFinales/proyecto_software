import supabase from '../model/supabase';

export const getEventos = async () => {
  const { data, error } = await supabase
    .from('Calendario')
    .select('calendario_id, nombre, fecha_inicio, fecha_fin');
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const addEvento = async (evento) => {
  const { data, error } = await supabase
    .from('Calendario')
    .insert([evento])
    .select('calendario_id, nombre, fecha_inicio, fecha_fin');

  if (error) {
    throw error;
  }

  return data[0];
};