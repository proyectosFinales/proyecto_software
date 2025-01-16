import supabase from "../model/supabase";
import validateInfo, { validarContraseñaDetallada, validarCorreo, validarCorreoExistente } from "./validarEntradas";
import sendMail from "../controller/Email";

export async function signUpNewUser(fullName, carnet, tel, email, password, sede) {
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
          telefono: tel
        }
      ])
      .select();

    if (userError) {
      throw new Error(userError.message);
    }
    
    const usuarioID = userData[0].id;

    // Ahora insertamos en "Estudiante"
    const { error: studentError } = await supabase
      .from('Estudiante')
      .insert([
        {
          id_usuario: usuarioID,
          carnet: carnet,
          estado: 'en progreso'
        }
      ]);

    if (studentError) {
      throw new Error(studentError.message);
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
export async function registroProfesor(nombre, correo, contrasena, sede, telefono) {
  try {
    if (!validarCorreo(correo)) {
      throw new Error("El correo no cumple con un formato válido.");
    } 

    const result = await validarCorreoExistente(correo, "");
    if (!result) {
      throw new Error("El correo ingresado ya se encuentra registrado.");
    }

    // 1. Insertar en Usuario
    const { data, error } = await supabase
      .from('Usuario')
      .insert([
        {
          nombre,
          correo,
          contrasena,
          rol: 2, // Profesor
          sede,
          telefono
        }
      ])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    const usuarioID = data[0].id;

    // 2. Insertar en Profesor
    const { error: error1 } = await supabase
      .from('Profesor')
      .insert([
        {
          id_usuario: usuarioID
          // Si quieres manejar 'categoria_id', agrégalo:
          // categoria_id: X
        }
      ]);

    if (error1) {
      throw new Error(error1.message);
    }

    return true;
  } catch (error) {
    throw new Error(error.message);
  }
}

export function generarContraseña(longitud = 12) {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
  let contraseña = '';
  for (let i = 0; i < longitud; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    contraseña += caracteres.charAt(indiceAleatorio);
  }
  return contraseña;
}

export const sendMailToNewUser = async (to, password) => {
  const mensaje = "Buenas,\n" +
    "Usted ha sido registrado en la plataforma de proyectos finales.\n" +
    `Usuario: ${to}\n` +
    `Contraseña ${password}\n\n` +
    "\nInstituto Tecnológico de Costar Rica,\n" +
    "Escuela de Producción Industrial.";
  console.log(mensaje);
  sendMail(to, "Acceso a plataforma Proyectos Finales", mensaje);
};