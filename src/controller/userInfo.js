import supabase from "../model/supabase";


export async function getUserInfo(id) {
    const { data, error } = await supabase
        .from('estudiantes')
        .select('*')
        .eq('usuarioID', id)
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
      .from('usuarios')
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
      .from('usuarios')
      .select("id, nombre");
  
    if (error) {
      console.error('Error al actualizar el usuario:', error.message);
      return { error };
    }
  
    return { data };
  }