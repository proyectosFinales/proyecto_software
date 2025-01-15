import supabase from "../model/supabase";
import validateInfo, { validarCorreo, validarContraseña, validarCorreoEstudiante, validarCorreoExistente } from "./validarEntradas";

/**
 * Obtiene info de un usuario, incluyendo si es profesor o estudiante.
 */
export async function getUserInfo(id) {
  const { data, error } = await supabase
    .from('Usuario')
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
        cedula
      )
    `)
    .eq('id', id)
    .single();

  if (!data || error) {
    throw new Error("Hubo un problema al consultar datos de usuario.");
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

  if (userData.rol === 2) {
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
  } else if (userData.rol === 3) {
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
          carnet
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
    .from('Usuario')
    .select('rol')
    .eq('id', id)
    .single();

  if (!data || error) {
    throw new Error("No se ha iniciado sesión.");
  }

  return data;
}

export async function updateUserInfo(userData) {
  try {
    if (!validarCorreo(userData.correo)) {
      throw new Error("El correo no cumple con un formato válido.");
    } else if (!validarContraseña(userData.contrasena)) {
      throw new Error("La contraseña no es válida, debe contener al menos 8 caracteres...");
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
      .from('Usuario')
      .upsert({
        id: userData.id,
        nombre: userData.nombre,
        correo: userData.correo,
        contrasena: userData.contrasena,
        sede: userData.sede,
        telefono: userData.telefono
      })
      .eq('id', userData.id);

    if (error) {
      throw new Error('Error al actualizar el usuario: ' + error.message);
    }

    // 2. Si es profesor:
    if (userData.rol === 2) {
      const { error: errorProf } = await supabase
        .from('Profesor')
        .upsert({
          id_usuario: userData.id,
          // si ya existía, se actualizará
          // Si manejas nombre duplicado aquí, 
          // agrégalo con un campo adicional en la tabla Profesor
        })
        .eq('id_usuario', userData.id);

      if (errorProf) {
        throw new Error("Error al actualizar el profesor: " + errorProf.message);
      }

    // 3. Si es estudiante:
    } else if (userData.rol === 3) {
      // Validaciones
      validateInfo(userData.carnet, userData.telefono, userData.correo, userData.contrasena, "", false);
      validarCorreoEstudiante(userData.correo);

      const { error: errorEst } = await supabase
        .from('Estudiante')
        .upsert({
          id_usuario: userData.id,
          carnet: userData.carnet,
          cedula: userData.cedula
        })
        .eq('id_usuario', userData.id);

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
    .from('Usuario')
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
    .from('Usuario')
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

export async function delUser(id) {
  // Al borrar un usuario, se debería borrar en cascada Estudiante/Profesor
  // según la FK con ON DELETE CASCADE. Si no lo tienes, hazlo manual.
  const { error } = await supabase
    .from('Usuario')
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

/**
 * Edición de usuario desde la gestión (simil a updateUserInfo).
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
      .from('Usuario')
      .update({
        nombre: user.nombre,
        correo: user.correo,
        contrasena: user.contrasena,
        sede: user.sede,
        telefono: user.telefono
      })
      .eq("id", user.id);

    if (error) {
      throw new Error("No se pudo editar la información del usuario.");
    }

    // 2. Si es profesor
    if (user.rol === 2) {
      // Actualiza profesor si es necesario
      // p.e. la categoría, etc.
      const { error: error2 } = await supabase
        .from('Profesor')
        .update({
          // ejemplo de un campo extra:
          // categoria_id: user.categoria_id
        })
        .eq("id_usuario", user.id);

      if (error2) {
        throw new Error("No se pudo editar la información del profesor.");
      }
    } else {
      // 3. Si es estudiante
      if (!validateInfo(user.carnet, user.telefono, user.correo, "", false)) {
        throw new Error("Datos no válidos para el estudiante.");
      }
      const { error: errorEst } = await supabase
        .from('Estudiante')
        .update({
          carnet: user.carnet,
          cedula: user.cedula
        })
        .eq("id_usuario", user.id);

      if (errorEst) {
        throw new Error("No se pudo editar la información del estudiante.");
      }

      // Si quisieras actualizar el estado de su anteproyecto, 
      // ajústalo en la tabla "Anteproyecto" -> 'estado'
    }
  } catch (error) {
    throw new Error(error.message);
  }
  return;
}
