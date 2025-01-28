import supabase from '../model/supabase';

export const fetchAvances = async (proyectoId) => {
  const { data: avances, error: avancesError } = await supabase
    .from('Avance')
    .select('*')
    .eq('proyecto_id', proyectoId)
    .order('num_avance', { ascending: true });
  if (avancesError) throw avancesError;
  
  const updatedAvances = await Promise.all(avances.map(async (avance) => {
    if (avance.num_avance <= 3 && avance.estado === 'Pendiente') {
      const { data: calendario, error: calendarioError } = await supabase
        .from('Calendario')
        .select('fecha_fin')
        .eq('nombre', `Entrega Avance ${avance.num_avance}`);

      if (calendarioError) throw calendarioError;

      if(calendario && calendario.length > 0) {
        const fechaFin = new Date(calendario[0].fecha_fin);
        const fechaActual = new Date();

        if (fechaActual > fechaFin) {
          avance.estado = 'Atrasado';

          try {
            updateAvance(avance.id, 'Atrasado');
          } catch (error) {
            throw error;
          }
        }
      }
    }
    return avance;
  }));

  return updatedAvances;

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