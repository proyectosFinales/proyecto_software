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