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
            updateAvance(avance.id, 'Atrasado', proyectoId);
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

export const fetchAvancesSinProyecto = async () => {
  const { data: avances, error: avancesError } = await supabase
    .from('Avance')
    .select(`
      id,
      num_avance, 
      estado, 
      proyecto_id,
      fecha_avance,
      Proyecto:proyecto_id (
        estudiante_id, 
        profesor_id,
        Estudiante:estudiante_id (
          id_usuario,
          carnet,
          Usuario:id_usuario (
            nombre
          )
        ),
        Profesor:profesor_id (
          id_usuario,
          Usuario:id_usuario (
            nombre
          )
        )
      )`
    ).order('fecha_avance', { ascending: false });
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

export const updateAvance = async (avanceId, nuevoEstado, proyectoId = null) => {
  const { error } = await supabase
    .from('Avance')
    .update({ estado: nuevoEstado })
    .eq('id', avanceId);
  if (error) throw error;

  if (proyectoId) {
    try {
      await reprobarEstudiante(proyectoId);
    } catch (reprobarError) {
      console.error('Error al reprobar estudiante:', reprobarError);
      throw reprobarError;
    }
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

export const getDetallesAvancesParaReporte = async () => {
  try {
    // REQ-31 pide detalles. Asumimos que los avances son Actas
    const { data, error } = await supabase
      .from('Acta')
      .select(`
        id,
        fecha_creacion,
        titulo,
        semestre,
        Estudiante (
          Usuario ( nombre )
        ),
        Profesor (
          Usuario ( nombre )
        ),
        datos
      `)
      // Se filtran solo los titulos que correspondan a avances
      .in('titulo', ['Avance I', 'Avance II', 'Avance III', 'Informe Preliminar', 'Informe Final']);

    if (error) {
      throw new Error(`Error al obtener detalles de avances: ${error.message}`);
    }

    // Mapear los datos a un formato plano para el CSV
    const reportData = data.map(item => ({
      estudiante: item.Estudiante?.Usuario?.nombre || 'N/A',
      profesor: item.Profesor?.Usuario?.nombre || 'N/A',
      titulo: item.titulo,
      semestre: `${item.semestre}-${new Date(item.fecha_creacion).getFullYear()}`,
      fecha: new Date(item.fecha_creacion).toLocaleDateString(),
      // Se asume que los datos de avance (Pasa/No Pasa) estan en 'datos'
      estado: item.datos?.estado || 'Pendiente'
    }));

    return reportData;

  } catch (error) {
    console.error(error.message);
    return [];
  }
};