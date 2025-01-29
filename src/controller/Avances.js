import supabase from '../model/supabase';
import { fetchSemestreActual } from './Semestre';

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

export const updateAvance = async (avanceId, nuevoEstado, proyectoId) => {
  const { error } = await supabase
    .from('Avance')
    .update({ estado: nuevoEstado })
    .eq('id', avanceId);
  if (error) throw error;

  try {
    await reprobarEstudiante(proyectoId);
  } catch (reprobarError) {
    console.error('Error al reprobar estudiante:', reprobarError);
    throw reprobarError;
  }
};

export const addAvance = async (estado, proyectoId) => {
  const { data: maxNumeroData, error: maxNumeroError } = await supabase
    .from('Avance')
    .select('num_avance')
    .eq('proyecto_id', proyectoId)
    .order('num_avance', { ascending: false })
    .limit(1);

  if (maxNumeroError) throw maxNumeroError;

  const nuevoNumero = maxNumeroData.length > 0 ? maxNumeroData[0].num_avance + 1 : 1;

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

  try {
    await reprobarEstudiante(proyectoId);
  } catch (reprobarError) {
    console.error('Error al reprobar estudiante:', reprobarError);
    throw reprobarError;
  }

  return nuevoAvanceData;
}

export const deleteAvance = async (avanceId, proyectoId) => {
  const { error } = await supabase
    .from('Avance')
    .delete()
    .eq('id', avanceId);
  if (error) throw error;

  try {
    await reprobarEstudiante(proyectoId);
  } catch (reprobarError) {
    console.error('Error al reprobar estudiante:', reprobarError);
    throw reprobarError;
  }
}

const reprobarEstudiante = async (proyecto_id) => {
  const { data, error } = await supabase
    .from('Avance')
    .select('*')
    .eq('estado', 'Reprobado')
    .eq('proyecto_id', proyecto_id);
  if (error) throw error;

  const estados = data.length > 0 ? ['Reprobado', 'reprobado'] : ['Pendiente', 'en progreso'];

  const { data: proyectoData, error: proyectoError } = await supabase
    .from('Proyecto')
    .update({ estado: estados[0] })
    .eq('id', proyecto_id)
    .select('estudiante_id');
  if (proyectoError) throw proyectoError;

  fetchSemestreActual().then(async (semestreId) => {
    const { data: estudianteData, error: estudianteError } = await supabase
      .from('Estudiante')
      .update({ estado: estados[1], semestre_id: semestreId })
      .eq('estudiante_id', proyectoData[0].estudiante_id);
    if (estudianteError) throw estudianteError;
  }).catch(err => {
    throw err;
  });
}