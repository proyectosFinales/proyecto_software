import supabase from "../model/supabase";
import validateInfo, {
  validarCorreo,
  validarContraseña,
  validarCorreoEstudiante,
  validarCorreoExistente
} from "./validarEntradas";

/**
 * Obtiene info de un usuario, incluyendo si es profesor o estudiante.
 */
export async function getUserInfo(id) {
  // Realiza la consulta con la sintaxis JSON-like:
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
      Profesor:Profesor!profesor_id_usuario_fkey (
        profesor_id,
        cantidad_estudiantes
      ),
      Estudiante:Estudiante!estudiante_id_usuario_fkey (
        estudiante_id,
        carnet,
        cedula
      )
    `)
    .eq("id", id)
    .single();
    
  // DEBUG: imprimir en consola qué devolvió Supabase
  console.log("[getUserInfo] data:", data);
  console.log("[getUserInfo] error:", error);

  // Verificamos si hubo error o si no vino data
  if (!data || error) {
    // Mensaje más detallado
    const msg = error
      ? `Hubo un problema al consultar datos de usuario. Detalle Supabase: ${error.message}`
      : "No se encontraron datos para ese usuario.";
    throw new Error(msg);
  }

  return data;
}

/**
 * Igual que getUserInfo, pero con la anidación extendida (Anteproyecto).
 */
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
      contrasena,
      rol,
      sede,
      telefono
    `)
    .eq('id', id);

  if (userData.rol === 2) {
    query = supabase
      .from('Usuario')
      .select(`
        id,
        nombre,
        correo,
        contrasena,
        rol,
        sede,
        telefono,
        profesor:Profesor (
          profesor_id,
          cantidad_estudiantes
        )
      `)
      .eq('id', id);
  } else if (userData.rol === 3) {
    query = supabase
      .from('Usuario')
      .select(`
        id,
        nombre,
        correo,
        contrasena,
        rol,
        sede,
        telefono,
        estudiante:Estudiante (
          estudiante_id,
          carnet
        )
      `)
      .eq('id', id);
  }

  const { data, error } = await query.single();
  console.log(data);

  if (error) {
    console.error('Error detallado:', error);
    throw new Error("Hubo un problema al consultar datos: " + error.message);
  }

  if (!data) {
    throw new Error("No se encontraron datos para el usuario especificado.");
  }

  return data;
}

/**
 * Obtiene solo el rol de un usuario para la ruta protegida
 */
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

/**
 * Actualiza datos de un usuario (tabla Usuario) y, si corresponde, en Estudiante o Profesor.
 */
export async function updateUserInfo(userData) {
  try {
    if (!validarCorreo(userData.correo)) {
      throw new Error("El correo no cumple con un formato válido.");
    } else if (!validarContraseña(userData.contrasena)) {
      throw new Error(
        "La contraseña no es válida, debe contener al menos 8 caracteres..."
      );
    }

    const result = await validarCorreoExistente(userData.correo, userData.id);
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado.");
    }

    if (!userData.sede) {
      throw new Error("Debes seleccionar una sede.");
    }

    // 1. Actualizar en Usuario
    const { error } = await supabase
      .from("Usuario")
      .upsert({
        id: userData.id,
        nombre: userData.nombre,
        correo: userData.correo,
        contrasena: userData.contrasena,
        sede: userData.sede,
        telefono: userData.telefono
      })
      .eq("id", userData.id);

    if (error) {
      throw new Error("Error al actualizar el usuario: " + error.message);
    }

    // 2. Si es profesor:
    if (userData.rol === 2) {
      const { error: errorProf } = await supabase
        .from("Profesor")
        .upsert({
          id_usuario: userData.id
          // Si hay otros campos en Profesor, agrégalos aquí
        })
        .eq("id_usuario", userData.id);

      if (errorProf) {
        throw new Error("Error al actualizar el profesor: " + errorProf.message);
      }
    }
    // 3. Si es estudiante:
    else if (userData.rol === 3) {
      validateInfo(
        userData.carnet,
        userData.telefono,
        userData.correo,
        userData.contrasena,
        "",
        false
      );
      validarCorreoEstudiante(userData.correo);

      const { error: errorEst } = await supabase
        .from("Estudiante")
        .upsert({
          id_usuario: userData.id,
          carnet: userData.carnet,
          cedula: userData.cedula
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

/**
 * Retorna todos los usuarios (profesores y estudiantes).
 */
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
        carnet
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

  // Mapeamos estudiantes
  const updatedDataE = dataE.map(u => ({
    ...u,
    Profesor: null
  }));

  // Mapeamos profesores
  const updatedDataP = dataP.map(u => ({
    ...u,
    Estudiante: null
  }));

  return [...updatedDataE, ...updatedDataP];
}

/**
 * Elimina un usuario (y en cascada su registro en Profesor/Estudiante si la FK está configurada con ON DELETE CASCADE)
 */
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

/**
 * Edición de usuario desde la gestión (similar a updateUserInfo).
 */
export async function editUserGestion(user) {
  try {
    if (!validarCorreo(user.correo)) {
      throw new Error("El correo no cumple con un formato válido");
    }
    const result = await validarCorreoExistente(user.correo, user.id);
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado.");
    }

    // 1. Actualizamos en Usuario
    const { error } = await supabase
      .from("Usuario")
      .update({
        nombre: user.nombre,
        correo: user.correo,
        contrasena: user.contraseña,  // Nota: en DB es "contrasena" sin ñ, ajústalo
        sede: user.sede,
        telefono: user.telefono
      })
      .eq("id", user.id);

    if (error) {
      throw new Error("No se pudo editar la información del usuario.");
    }

    // 2. Si es profesor (rol=2)
    if (user.rol === 2) {
      // Actualiza profesor si es necesario
      const { error: error2 } = await supabase
        .from("Profesor")
        .update({
          // ejemplo de un campo extra si lo tuvieras:
          // categoria_id: user.categoria_id
        })
        .eq("id_usuario", user.id);

      if (error2) {
        throw new Error("No se pudo editar la información del profesor.");
      }
    } 
    // 3. Si es estudiante (rol=3)
    else {
      if (!validateInfo(user.carnet, user.telefono, user.correo, "", false)) {
        throw new Error("Datos no válidos para el estudiante.");
      }
      const { error: errorEst } = await supabase
        .from("Estudiante")
        .update({
          carnet: user.carnet,
          cedula: user.cedula
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
