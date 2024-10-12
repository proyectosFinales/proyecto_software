import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wuqbfddlwitkszlakvmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cWJmZGRsd2l0a3N6bGFrdm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3Nzg0MjgsImV4cCI6MjA0MjM1NDQyOH0.1C7P4EffAD_SBFke5MWEmKkzAnJYSkez43U4rS66D3s';
const supabase = createClient(supabaseUrl, supabaseKey);



export async function getUserInfo(id) {
    const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        throw new Error('No se encontró el usuario de la sesión. \nPor favor vuelta a interntarlo.'); 
    }
    
    return data;
}

export async function updateUserInfo(userData) {
    const { response, error } = await supabase
      .from('Usuarios')
      .update({
        Nombre: userData.nombre,
        Correo: userData.correo,
        Telefono: userData.telefono,
        Contraseña: userData.password,
      })
      .eq('id', userData.id);
  
    if (error) {
      console.error('Error al actualizar el usuario:', error.message);
      return { error };
    }
  
    return { response };
  }

  export async function getAllUsers() {
    const { data, error } = await supabase
      .from('Usuarios')
      .select("id, Nombre");
  
    if (error) {
      console.error('Error al actualizar el usuario:', error.message);
      return { error };
    }
  
    return { data };
  }