import supabase from "../model/supabase";


export async function getUserInfo(id) {
  const { data } = await supabase
    .from('usuarios')
    .select('id, correo, contraseña, rol, profesor: profesores(nombre), estudiante: estudiantes(nombre, carnet, telefono)')
    .eq('id', id)
    .single();

  if (!data) {
    throw new Error("Hubo un problema al consultar sus datos. Por favor, inténtelo de nuevo.");
  }

  return data;
}

export async function gestionUserInfo(id) {

  const { data } = await supabase
    .from('usuarios')
    .select('id, correo, rol, profesor: profesores(nombre), estudiante: estudiantes(nombre, carnet, telefono, estado: anteproyectos(estado))')
    .eq('id', id)
    .single();

  if (!data) {
    throw new Error("Hubo un problema al consultad sus datos. Por favor, inténtelo de nuevo.");
  }

  return data;
}

export async function updateUserInfo(userData) {

  const { error } = await supabase
    .from('usuarios')
    .update({
      correo: userData.correo,
      contraseña: userData.contraseña,
    })
    .eq('id', userData.id);

  if (error) {
    throw new Error('Error al actualizar el usuario:', error.message);
  }

  if (userData.rol === "2") {
    const { error } = await supabase
    .from('profesores')
    .update({ nombre: userData.nombre })
    .eq('id', userData.id);

    if (error) {
      throw new Error("Error al actualizar el usuario", error.message);
    }
  } else if (userData.rol === "3") {

    const { error } = await supabase
    .from('estudiantes')
    .update({
      nombre: userData.nombre,
      correo: userData.correo,
      carnet: userData.carnet,
      telefono: userData.telefono,
     })
    .eq('id', userData.id);

    if (error) {
      throw new Error("Error al actualizar el usuario", error.message);
    }

  }

  return;
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

  const updatedDataE = dataE.map(usuario => {
    if (usuario.estudiante === null) {
      usuario.estudiante = {
        nombre: "Usuario no registrado"
      };
    }
    return {...usuario,
    profesor: {
      nombre: ""
    }}
  });

  const updatedDataP = dataP.map(usuario => {
    if (usuario.profesor === null) {
      usuario.profesor = {
        nombre: "Usuario no registrado"
      };
    }
    return {...usuario,
    estudiante: {
      nombre: ""
    }}
  });

  return [...updatedDataE, ...updatedDataP];
}

export async function delUser(id) {

  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  };

  return;
}

export async function editUserGestion(user) {

  const { error } = await supabase
    .from('usuarios')
    .update({ correo: user.correo })
    .eq("id", user.id);

  if (error) {
    throw new Error("No se pudo editar la información del usuario. Por favor inténtelo de nuevo.")
  };

  if (user.rol === "2") {
    const { error: error2 } = await supabase
      .from('profesores')
      .update({ nombre: user.nombre })
      .eq("id", user.id);

    if (error2) {
      throw new Error("No se pudo editar la información del profesor. Por favor inténtelo de nuevo.");
    }
  } else {
    const { error } = await supabase
      .from('estudiantes')
      .update({
        nombre: user.nombre,
        carnet: user.carnet,
        telefono: user.telefono,
        correo: user.correo
      })
      .eq("id", user.id);

    const { error: error2 } = await supabase
      .from('anteproyectos')
      .update({ estado: user.estado })
      .eq("idEstudiante", user.id);

    if (error || error2) {
      throw new Error("No se pudo editar la información del estudiante. Por favor inténtelo de nuevo.");
    }

  }

  return;
}