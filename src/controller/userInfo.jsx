import supabase from "../model/supabase";
import validateInfo, {
  validarCorreo,
  validarContraseñaDetallada,  // Revisa tu validacion detallada
  validarCorreoEstudiante,
  validarCorreoExistente
} from "./validarEntradas";

export async function getUserInfo(id) {
  const { data, error } = await supabase
    .from("Usuario")
    .select(`
      id,
      nombre,
      correo,
      contrasena,
      rol,
      sede,
      telefono,
      Profesor:Profesor!Profesor_id_usuario_fkey (
        profesor_id,
        cantidad_estudiantes
      ),
      Estudiante:Estudiante!Estudiante_id_usuario_fkey (
        estudiante_id,
        carnet,
        asesor,
        estado
      )
    `)
    .eq("id", id)
    .single();
    
  if (!data || error) {
    const msg = error
      ? `Hubo un problema al consultar datos de usuario. Detalle Supabase: ${error.message}`
      : "No se encontraron datos para ese usuario.";
    throw new Error(msg);
  }
  return data;
}

export async function gestionUserInfo(id) {
  const { data: userData, error: userError } = await supabase
    .from('Usuario')
    .select('rol')
    .eq('id', id)
    .single();

  if (userError || !userData) {
    throw new Error("Usuario no encontrado");
  }

  let query = supabase
    .from('Usuario')
    .select(`
      id,
      nombre,
      correo,
      rol,
      sede,
      telefono
    `)
    .eq('id', id);

  if (userData.rol == 2) {
    query = supabase
      .from('Usuario')
      .select(`
        id,
        nombre,
        correo,
        rol,
        sede,
        telefono,
        profesor:Profesor (
          profesor_id,
          cantidad_estudiantes
        )
      `)
      .eq('id', id);
  } else if (userData.rol == 3) {
    query = supabase
      .from('Usuario')
      .select(`
        id,
        nombre,
        correo,
        rol,
        sede,
        telefono,
        estudiante:Estudiante (
          estudiante_id,
          carnet,
          asesor,
          estado
        )
      `)
      .eq('id', id);
  }

  const { data, error } = await query.single();
  if (error) {
    console.error('Error detallado:', error);
    throw new Error("Hubo un problema al consultar datos: " + error.message);
  }
  if (!data) {
    throw new Error("No se encontraron datos para el usuario especificado.");
  }

  return data;
}

export async function getRol(id) {
  const { data, error } = await supabase
    .from("Usuario")
    .select("rol")
    .eq("id", id)
    .single();

  if (!data || error) {
    throw new Error("No se ha iniciado sesión.");
  }
  return data;
}

export async function updateUserInfo(userData) {
  try {
    // Valida correo
    if (!validarCorreo(userData.correo)) {
      throw new Error("El correo no cumple con un formato válido.");
    }

    // Valida contraseña a detalle
    const passError = validarContraseñaDetallada(userData.contrasena);
    if (passError) {
      throw new Error(passError);
    }

    // Verifica duplicado de correo
    const result = await validarCorreoExistente(userData.correo, userData.id);
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado.");
    }

    // Valida sede
    if (!userData.sede) {
      throw new Error("Debes seleccionar una sede.");
    }

    // Actualiza en Usuario
    const { error } = await supabase
      .from("Usuario")
      .upsert({
        id: userData.id,
        nombre: userData.nombre,
        correo: userData.correo,
        contrasena: userData.contrasena,  // <--- sin ñ
        sede: userData.sede,
        telefono: userData.telefono
      })
      .eq("id", userData.id);

    if (error) {
      throw new Error("Error al actualizar el usuario: " + error.message);
    }

    // Si es profesor:
    if (userData.rol == 2) {
      const { error: errorProf } = await supabase
        .from("Profesor")
        .upsert({
          id_usuario: userData.id
          // otros campos en Profesor si los tuvieras
        })
        .eq("id_usuario", userData.id);
      if (errorProf) {
        throw new Error("Error al actualizar el profesor: " + errorProf.message);
      }
    }
    // Si es estudiante:
    else if (userData.rol == 3) {
      // Validar otros campos (carnet, tel, etc.) sin password
      validateInfo(
        userData.carnet,
        userData.telefono,
        userData.correo,
        "", // sin re-check de password
        false
      );
      validarCorreoEstudiante(userData.correo);

      const { error: errorEst } = await supabase
        .from("Estudiante")
        .upsert({
          id_usuario: userData.id,
          carnet: userData.carnet,
          asesor: userData.asesor,
          estado: userData.estado
        })
        .eq("id_usuario", userData.id);

      if (errorEst) {
        throw new Error("Error al actualizar el estudiante: " + errorEst.message);
      }
    }

  } catch (err) {
    throw new Error(err.message);
  }
  return;
}

export async function getAllUsers() {
  const { data: dataE, error: errorE } = await supabase
    .from("Usuario")
    .select(`
      id,
      rol,
      nombre,
      correo,
      estudiante:Estudiante(
        estudiante_id,
        carnet,
        asesor,
        estado
      )
    `)
    .eq("rol", 3);

  const { data: dataP, error: errorP } = await supabase
    .from("Usuario")
    .select(`
      id,
      rol,
      nombre,
      correo,
      profesor:Profesor (
        profesor_id,
        cantidad_estudiantes
      )
    `)
    .eq("rol", 2);
  
  if (errorE || errorP) {
    throw new Error("Hubo problemas para extraer los usuarios.");
  }

  const updatedDataE = dataE.map(u => ({
    ...u,
    Profesor: null
  }));
  const updatedDataP = dataP.map(u => ({
    ...u,
    Estudiante: null
  }));
  return [...updatedDataE, ...updatedDataP];
}

export async function delUser(id) {
  const { error } = await supabase
    .from("Usuario")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

export async function editUserGestion(user) {
  try {
    if (!validarCorreo(user.correo)) {
      throw new Error("El correo no cumple con un formato válido");
    }
    // O si deseas revalidar la contraseña con la función detallada:
    // const passError = validarContraseñaDetallada(user.contrasena);
    // if (passError) {
    //   throw new Error(passError);
    // }

    const result = await validarCorreoExistente(user.correo, user.id);
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado.");
    }

    const { error } = await supabase
      .from("Usuario")
      .update({
        nombre: user.nombre,
        correo: user.correo,
        contrasena: user.contrasena, // <--- sin ñ
        sede: user.sede,
        telefono: user.telefono
      })
      .eq("id", user.id);
    if (error) {
      throw new Error("No se pudo editar la información del usuario.");
    }

    if (user.rol == 2) {
      const { error: error2 } = await supabase
        .from("Profesor")
        .update({
          // si hay campos extra...
        })
        .eq("id_usuario", user.id);
      if (error2) {
        throw new Error("No se pudo editar la información del profesor.");
      }
    } 
    else if (user.rol == 3) {
      if (!validateInfo(user.carnet, user.telefono, user.correo, "", false)) {
        throw new Error("Datos no válidos para el estudiante.");
      }
      const { error: errorEst } = await supabase
        .from("Estudiante")
        .update({
          carnet: user.carnet,
          asesor: user.asesor,
          estado: user.estado
        })
        .eq("id_usuario", user.id);
      if (errorEst) {
        throw new Error("No se pudo editar la información del estudiante.");
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
  return;
}
