import supabase from "../model/supabase"

export const fetchTiposProyectos = async () => {
  const { data: tiposProyectos, error: tiposProyectosError } = await supabase
    .from('TipoProyecto')
    .select('*');
  if (tiposProyectosError) throw tiposProyectosError;

  return tiposProyectos;
};

export const addTipoProyecto = async (nombre) => {
  const { data: newTipoProyecto, error: newTipoProyectoError } = await supabase
    .from('TipoProyecto')
    .insert({nombre: nombre})
    .select('*');
  if (newTipoProyectoError) throw newTipoProyectoError;

  return newTipoProyecto[0];
}

export const editTipoProyecto = async (nombre, id) => {
  const { error: updatedTipoProyectoError } = await supabase
    .from('TipoProyecto')
    .update({nombre: nombre})
    .eq('id', id);
  if (updatedTipoProyectoError) throw updatedTipoProyectoError;
}

export const deleteTipoProyecto = async (id) => {
  const { error } = await supabase
    .from('TipoProyecto')
    .delete()
    .eq('id', id);
  if (error) throw error;
}