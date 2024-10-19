import supabase from "../model/supabase";


export async function getUserInfo(id) {
  const { data: data, error } = await supabase
    .from('usuarios')
    .select('correo, contraseña, rol, \
profesor: profesores(nombre), \
estudiante: estudiantes(nombre, carnet, telefono)')
    .eq('id', id)
    .single();

  if (!data) {
    throw new Error("Hubo un problema al consultad sus datos. Por favor, inténtelo de nuevo.");
  }

  return data;
}

export async function gestionUserInfo(id) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, correo, rol, \
profesor: profesores(nombre), \
estudiante: estudiantes(nombre, carnet, telefono, estado: anteproyectos(estado))')
    .eq('id', id)
    .single();

  if (!data) {
    console.log(error);
    throw new Error("Hubo un problema al consultad sus datos. Por favor, inténtelo de nuevo.");
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
  const { data: dataE, error: errorE } = await supabase
    .from('usuarios')
    .select("id, rol, estudiante:estudiantes(nombre)")
    .eq("rol", 3);


  const { data: dataP, error: errorP } = await supabase
    .from('usuarios')
    .select("id, rol, profesor:profesores(nombre)")
    .eq("rol", 2);


  if (errorE || errorP) {
    throw new Error("Hubo problemas para extraer los usuarios.");
  };
  
  return [...dataE, ...dataP];
}

export async function delUser(id) {

    const { data: data, error: error } = await supabase
    .from('usuarios')
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error);
  };
  
  return;
}