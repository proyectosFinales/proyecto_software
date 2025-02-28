import supabase from "../model/supabase";
import validateInfo, {
  validarCorreo,
  validarContraseñaDetallada,  // Revisa tu validacion detallada
  validarCorreoEstudiante,
  validarCorreoExistente
} from "./validarEntradas";

export async function getUserInfo(id) {
  // First get the user data
  const { data: userData, error: userError } = await supabase
    .from("Usuario")
    .select(`
      id,
      nombre,
      correo,
      contrasena,
      rol,
      sede,
      telefono
    `)
    .eq("id", id)
    .single();
    
  if (!userData || userError) {
    const msg = userError
      ? `Hubo un problema al consultar datos de usuario. Detalle Supabase: ${userError.message}`
      : "No se encontraron datos para ese usuario.";
    throw new Error(msg);
  }

  // If it's a student, get their data from Estudiante table
  if (userData.rol === 3) {
    const { data: estudianteData, error: estudianteError } = await supabase
      .from("Estudiante")
      .select(`
        estudiante_id, 
        carnet, 
        asesor, 
        estado,
        Profesor (
          id_usuario,
          Usuario (
            nombre
          )
        )`)
      .eq("id_usuario", id)
      .single();

    if (estudianteError) {
      console.error("Error fetching estudiante:", estudianteError);
    } else if (estudianteData) {
      userData.Estudiante = estudianteData;
    }
  }

  // If it's a professor, get their data
  if (userData.rol === 2) {
    const { data: profesorData, error: profesorError } = await supabase
      .from("Profesor")
      .select(`
        profesor_id,
        cantidad_estudiantes,
        categoria_id,
        Categoria (
          nombre
        )
      `)
      .eq("id_usuario", id)
      .single();

    if (profesorError) {
      console.error("Error fetching profesor:", profesorError);
    } else if (profesorData) {
      userData.Profesor = [profesorData]; // Keep the same structure as before
    }
  }

  console.log("Raw data from getUserInfo:", userData); // For debugging
  return userData;
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
    // 1) Recuperar el rol original de la BD:
    const { data: oldData, error: oldError } = await supabase
      .from("Usuario")
      .select("rol")
      .eq("id", userData.id)
      .single();

    if (oldError || !oldData) {
      throw new Error("No se pudo recuperar el rol actual. " + (oldError?.message || ""));
    }

    // Guardamos en una variable local
    const realRol = oldData.rol;  // un número (1,2,3)

    // 2) Validar correo
    if (!validarCorreo(userData.correo)) {
      throw new Error("El correo no cumple con un formato válido.");
    }

    // 3) Validar contraseña a detalle
    const passError = validarContraseñaDetallada(userData.contrasena);
    if (passError) {
      throw new Error(passError);
    }

    // 4) Verificar duplicado de correo
    const result = await validarCorreoExistente(userData.correo, userData.id);
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado.");
    }

    // 5) Validar sede
    if (!userData.sede) {
      throw new Error("Debes seleccionar una sede.");
    }

    // 6) Actualizar la tabla Usuario,
    //    forzando el rol que ya tenía en la BD (realRol).
    const { error } = await supabase
      .from("Usuario")
      .update({
        nombre: userData.nombre,
        correo: userData.correo,
        contrasena: userData.contrasena,
        sede: userData.sede,
        telefono: userData.telefono,
        rol: realRol           // <-- obligamos a usar el rol que había antes
      })
      .eq("id", userData.id);

    if (error) {
      throw new Error("Error al actualizar el usuario: " + error.message);
    }

    // 7) Dependiendo del rol (ver oldData.rol o realRol, no userData.rol):
    if (realRol === 2) {
      // Si es profesor, actualiza la tabla "Profesor" 
      // sin cambiar "cantidad_estudiantes" (ni rol).
      const { error: errorProf } = await supabase
        .from("Profesor")
        .update({
          categoria_id: userData.categoria_id
          // Ejemplo: no tocamos "cantidad_estudiantes"
          // ni "id_usuario" (ya está asociado)
        })
        .eq("id_usuario", userData.id);

      if (errorProf) {
        throw new Error("Error al actualizar el profesor: " + errorProf.message);
      }
    } 
    else if (realRol === 3) {
      // Estudiante: validamos otros campos (carnet, tel, etc.) sin password
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
        .update({
          carnet: userData.carnet,
          asesor: userData.asesor,
          estado: userData.estado
        })
        .eq("id_usuario", userData.id);

      if (errorEst) {
        throw new Error("Error al actualizar el estudiante: " + errorEst.message);
      }
    }
    
    // Si realRol === 1 (Coordinador), no hay tabla aparte.

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
      contrasena,
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
