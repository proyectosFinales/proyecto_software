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

  if (evento.nombre === 'Semestre') {
    const { data: semestre, error: semestreError } = await supabase
      .from('Semestre')
      .insert([{
        fecha_inicio: evento.fecha_inicio,
        fecha_fin: evento.fecha_fin,
        nombre: getNombreSemestre(evento.fecha_inicio),
        calendario_id: evento.calendario_id
      }])
      .select();

    if (semestreError) {
      throw semestreError;
    }
  }

  if (error) {
    throw error;
  }

  return data[0];
};

export const deleteEvento = async (id) => {
  const { error } = await supabase
    .from('Calendario')
    .delete()
    .eq('calendario_id', id);

  if (error) {
    throw error;
  }
}

export const updateEvento = async (id, updatedEvento) => {
  const { error } = await supabase
    .from('Calendario')
    .update(updatedEvento)
    .eq('calendario_id', id);
  
  if(updatedEvento.nombre === 'Semestre') {
    const { data: semestre, error: semestreError } = await supabase
      .from('Semestre')
      .update({
        fecha_inicio: updatedEvento.fecha_inicio,
        fecha_fin: updatedEvento.fecha_fin,
        nombre: getNombreSemestre(updatedEvento.fecha_inicio)
      })
      .eq('calendario_id', id);

    if (semestreError) 
      throw semestreError
  }

  if (error) {
    throw error;
  }
};

const getNombreSemestre = (fechaInicio) => {
  const fecha = new Date(fechaInicio);
  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1;

  if (month >= 1 && month <= 6) {
    return `Semestre I ${year}`;
  } else {
    return `Semestre II ${year}`;
  }
}