import supabase from "../model/supabase";
import validateInfo, { validarCorreo, validarContraseña, validarCorreoEstudiante, validarCorreoExistente } from "./validarEntradas";


export async function getUserInfo(id) {
  const { data } = await supabase
    .from('usuarios')
    .select('id, correo, contraseña, sede, rol, profesor: profesores(nombre), estudiante: estudiantes(nombre, carnet, telefono)')
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

  try {
    if (!validarCorreo(userData.correo)) {
      throw new Error("El correo no cumple con un formato válido, asegúrese de ingresar su correo de la institución.");
    } else if (!validarContraseña(userData.contraseña)) {
      throw new Error("La contraseña no es válida, debe contener al menos 8 caracteres y que mínimo contenga:\n- 1 minúscula\n- 1 mayúscula\n- 1 número\n- 1 caracter especial");
    }

    const result = await validarCorreoExistente(userData.correo, userData.id);
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado, asegúrese de ingresar su correo de la institución.");
    }

    if (userData.sede === "" || userData.sede === null) {
      throw new Error("Debes seleccionar una sede.");
    }

    const { error } = await supabase
      .from('usuarios')
      .upsert({
        id: userData.id,
        correo: userData.correo,
        contraseña: userData.contraseña,
        sede: userData.sede
      })
      .eq('id', userData.id);

    if (error) {
      throw new Error('Error al actualizar el usuario:', error.message);
    }

    if (userData.rol === "2") {

      const { error } = await supabase
        .from('profesores')
        .upsert({
          id: userData.id,
          nombre: userData.nombre
        })
        .eq('id', userData.id);

      if (error) {
        throw new Error("Error al actualizar el usuario");
      }

    } else if (userData.rol === "3") {

      try {
        validateInfo(userData.carnet, userData.telefono, userData.correo, userData.contraseña, "", false);
        validarCorreoEstudiante(userData.correo);
      } catch (error) {
        throw new Error(error.message);
      }

      const { error } = await supabase
        .from('estudiantes')
        .upsert({
          id: userData.id,
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
  } catch (error) {
    throw new Error(error.message);
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
    return {
      ...usuario,
      profesor: {
        nombre: ""
      }
    }
  });

  const updatedDataP = dataP.map(usuario => {
    if (usuario.profesor === null) {
      usuario.profesor = {
        nombre: "Usuario no registrado"
      };
    }
    return {
      ...usuario,
      estudiante: {
        nombre: ""
      }
    }
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

  try {
    if (!validarCorreo(user.correo)) {
      throw new Error("El correo no cumple con un formato válido, asegúrese de ingresar su correo de la institución.")
    }

    const result = await validarCorreoExistente(user.correo, user.id);
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado, asegúrese de ingresar su correo de la institución.");
    }

    

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
      if (!validateInfo(user.carnet, user.telefono, user.correo, "", false)) {
        throw new Error("El correo no cumple con un formato válido, asegúrese de ingresar su correo de la institución.")
      }

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
  } catch (error) {
    throw new Error(error.message);
  }

  return;
}