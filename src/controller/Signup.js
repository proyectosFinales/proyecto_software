import supabase from "../model/supabase";
import validateInfo, { validarContraseñaDetallada, validarCorreo, validarCorreoExistente } from "./validarEntradas";
import sendMail from "../controller/Email";
import { fetchSemestreActual } from "../controller/Semestre";

export async function signUpNewUser(fullName, carnet, tel, email, password, sede, provincia, canton, distrito) {
  try {
    const result = await validarCorreoExistente(email, "");
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado.");
    }

    validateInfo(carnet, tel, email, password);

    // Insertar primero en "Usuario"
    const { data: userData, error: userError } = await supabase
      .from('Usuario')
      .insert([
        {
          nombre: fullName,
          correo: email,
          contrasena: password,
          rol: 3, // Estudiante
          sede: sede,
          telefono: tel,
          provincia: provincia,
          canton: canton,
          distrito: distrito
        }
      ])
      .select();

    if (userError) {
      throw new Error(userError.message);
    }

    const usuarioID = userData[0].id;

    try {
      const semestreId = await fetchSemestreActual();
      const { error: studentError } = await supabase
        .from('Estudiante')
        .insert([
          {
            id_usuario: usuarioID,
            carnet: carnet,
            estado: 'en progreso',
            semestre_id: semestreId
          }
        ]);

      if (studentError) {
        await supabase.from('Usuario').delete().eq('id', usuarioID);
        throw new Error(studentError.message);
      }
    } catch (error) {
      throw new Error(error.message);
    }

    return userData;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Registro de profesor (RFN1).
 * En la nueva BD, la tabla Profesor se relaciona con Usuario. 
 */
export async function registroProfesor(nombre, correo, contrasena, sede, telefono, provincia, canton, distrito) {
  try {
    console.log("Validando correo:", correo);
    
    // Validación de correo más flexible para profesores (cualquier email válido)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const esValido = emailRegex.test(correo);
    console.log("¿Es válido?", esValido);
    
    if (!esValido) {
      throw new Error("El correo no cumple con un formato válido.");
    } 

    // Obtener semestre y año actual
    const fecha = new Date();
    const añoActual = fecha.getFullYear();
    const mesActual = fecha.getMonth() + 1; // 0-11, por eso +1
    const semestreActual = mesActual <= 7 ? 1 : 2;

    // Calcular siguiente semestre
    let semestreSiguiente, añoSiguiente;
    if (semestreActual === 1) {
      semestreSiguiente = 2;
      añoSiguiente = añoActual;
    } else {
      semestreSiguiente = 1;
      añoSiguiente = añoActual + 1;
    }

    // Verificar si el correo ya existe
    const { data: usuarioExistente, error: errorUsuario } = await supabase
      .from('Usuario')
      .select('id, Profesor(profesor_id)')
      .eq('correo', correo)
      .single();

    if (usuarioExistente && !errorUsuario) {
      // Usuario ya existe, verificar si tiene asignaciones para los semestres
      const profesorId = usuarioExistente.Profesor[0]?.profesor_id;
      
      if (profesorId) {
        // Verificar asignaciones existentes
        const { data: asignacionesExistentes } = await supabase
          .from('AsignacionesProfesor')
          .select('semestre, año')
          .eq('idProfesor', profesorId)
          .in('semestre', [semestreActual, semestreSiguiente])
          .in('año', [añoActual, añoSiguiente]);

        const existeActual = asignacionesExistentes?.some(
          a => a.semestre === semestreActual && a.año === añoActual
        );
        const existeSiguiente = asignacionesExistentes?.some(
          a => a.semestre === semestreSiguiente && a.año === añoSiguiente
        );

        // Insertar solo las que no existen
        const asignacionesPorInsertar = [];
        
        if (!existeActual) {
          asignacionesPorInsertar.push({
            idProfesor: profesorId,
            semestre: semestreActual,
            año: añoActual,
            disponibilidad: 0,
            asignados: 0
          });
        }
        
        if (!existeSiguiente) {
          asignacionesPorInsertar.push({
            idProfesor: profesorId,
            semestre: semestreSiguiente,
            año: añoSiguiente,
            disponibilidad: 0,
            asignados: 0
          });
        }

        if (asignacionesPorInsertar.length > 0) {
          const { error: errorAsignacion } = await supabase
            .from('AsignacionesProfesor')
            .insert(asignacionesPorInsertar);

          if (errorAsignacion) {
            throw new Error(errorAsignacion.message);
          }
        }

        return true; // Profesor actualizado con nuevas asignaciones
      } else {
        throw new Error("El correo ya está registrado pero no tiene un perfil de profesor.");
      }
    }

    // Si no existe, crear nuevo usuario y profesor
    const { data, error } = await supabase
      .from('Usuario')
      .insert([
        {
          nombre,
          correo,
          contrasena,
          rol: 2, // Profesor
          sede,
          telefono,
          provincia,
          canton,
          distrito
        }
      ])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    const usuarioID = data[0].id;

    // 2. Insertar en Profesor
    const { data: profesorData, error: error1 } = await supabase
      .from('Profesor')
      .insert([
        {
          id_usuario: usuarioID
        }
      ])
      .select('profesor_id');

    if (error1) {
      throw new Error(error1.message);
    }

    const profesorId = profesorData[0].profesor_id;

    console.log("Profesor creado con ID:", profesorId);
    console.log("Insertando asignaciones para:");
    console.log("- Semestre actual:", semestreActual, "Año:", añoActual);
    console.log("- Semestre siguiente:", semestreSiguiente, "Año:", añoSiguiente);

    // 3. Insertar en AsignacionesProfesor para semestre actual y siguiente
    const { data: asignacionesData, error: error2 } = await supabase
      .from('AsignacionesProfesor')
      .insert([
        {
          idProfesor: profesorId,
          semestre: semestreActual,
          año: añoActual,
          disponibilidad: 0,
          asignados: 0
        },
        {
          idProfesor: profesorId,
          semestre: semestreSiguiente,
          año: añoSiguiente,
          disponibilidad: 0,
          asignados: 0
        }
      ])
      .select();

    if (error2) {
      console.error("Error al insertar asignaciones:", error2);
      throw new Error(error2.message);
    }

    console.log("Asignaciones creadas exitosamente:", asignacionesData);

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
}

export function generarContraseña(longitud = 12) {
  const caracteresMinusculas = 'abcdefghijklmnopqrstuvwxyz';
  const caracteresMayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digitos = '0123456789';
  const caracteresEspeciales = '!@#$%&*?.';
  const todosCaracteres = caracteresMinusculas + caracteresMayusculas + digitos + caracteresEspeciales;

  let contraseña = '';
  contraseña += caracteresMinusculas.charAt(Math.floor(Math.random() * caracteresMinusculas.length));
  contraseña += caracteresMayusculas.charAt(Math.floor(Math.random() * caracteresMayusculas.length));
  contraseña += digitos.charAt(Math.floor(Math.random() * digitos.length));
  contraseña += caracteresEspeciales.charAt(Math.floor(Math.random() * caracteresEspeciales.length));

  for (let i = 4; i < longitud; i++) {
    const indiceAleatorio = Math.floor(Math.random() * todosCaracteres.length);
    contraseña += todosCaracteres.charAt(indiceAleatorio);
  }

  // Mezclar la contraseña para evitar patrones predecibles
  contraseña = contraseña.split('').sort(() => 0.5 - Math.random()).join('');

  return contraseña;
}

export const sendMailToNewUser = async (to, password) => {
  const mensaje = "Buenas,\n" +
    "Usted ha sido registrado en la plataforma de proyectos finales.\n" +
    `Usuario: ${to}\n` +
    `Contraseña ${password}\n\n` +
    "\nInstituto Tecnológico de Costar Rica,\n" +
    "Escuela de Producción Industrial.";
  sendMail(to, "Acceso a plataforma Proyectos Finales", mensaje);
};