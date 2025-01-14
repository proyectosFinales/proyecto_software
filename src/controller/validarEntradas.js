/**
 * validarEntradas.js
 * 
 * Archivo que contiene funciones de validación:
 * - Verificación de carnet, teléfono, correo y contraseña.
 * - Verificación de que un correo no exista ya en la tabla Usuario.
 */

import supabase from "../model/supabase";

/**
 * Valida varios campos para registro/actualización de un estudiante:
 *  - Formato de carnet (10 dígitos)
 *  - Teléfono (8 dígitos, permitiendo prefijo +506 opcionalmente)
 *  - Correo (de institución ITCR)
 *  - Contraseña (mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo)
 * @param {string} carnet - Carnet del estudiante (ej. "2019123456")
 * @param {string} tel - Teléfono (ej. "+50688888888" o "88888888")
 * @param {string} email - Correo (ej. "nombre@estudiantec.cr")
 * @param {string} password - Contraseña a validar
 * @param {boolean} checkPass - true para validar la contraseña, false para omitir
 */
export function validateInfo(carnet, tel, email, password, checkPass = true) {
  /**
   * Regex para 10 dígitos (puede ajustar a 8–10 dígitos si deseas mayor flexibilidad).
   */
  const carnetRegex = /^[0-9]{10}$/;

  /**
   * Regex para número de teléfono de Costa Rica (8 dígitos)
   * con opción a incluir prefijo "+506 ". Por ejemplo:
   *   +506 88888888
   *   88888888
   */
  const telRegex = /^(\+?506\s?)?[2-9]\d{7}$/;

  if (!carnetRegex.test(carnet)) {
    throw new Error(
      "El carnet no cumple con un formato válido (debe tener 10 dígitos)."
    );
  } else if (!telRegex.test(tel)) {
    throw new Error(
      "El número de teléfono no cumple con un formato válido. Asegúrese de que sean 8 dígitos, con o sin prefijo +506."
    );
  } else if (!validarCorreo(email)) {
    throw new Error(
      "El correo no cumple con un formato válido, asegúrese de ingresar su correo institucional (@estudiantec.cr o @itcr.ac.cr)."
    );
  } else if (!validarContraseña(password) && checkPass) {
    throw new Error(
      "La contraseña no es válida, debe contener al menos 8 caracteres y que mínimo contenga:\n" +
        "- 1 minúscula\n" +
        "- 1 mayúscula\n" +
        "- 1 número\n" +
        "- 1 caracter especial (@, $, !, %, *, ?, & o .)"
    );
  } else {
    return true;
  }
}

/**
 * Verifica que la contraseña tenga:
 *  - al menos 8 caracteres,
 *  - una minúscula,
 *  - una mayúscula,
 *  - un dígito,
 *  - un carácter especial (@$!%*?&.)
 */
export function validarContraseña(contraseña) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
  return passwordRegex.test(contraseña);
}

/**
 * Valida que un correo sea de la institución: 
 *   - dominio "estudiantec.cr" 
 *   - o dominio "itcr.ac.cr"
 */
export function validarCorreo(correo) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(estudiantec\.cr|itcr\.ac\.cr)$/;
  return emailRegex.test(correo);
}

/**
 * Valida específicamente que el correo sea de estudiante, es decir, "estudiantec.cr".
 * @param {string} correo 
 */
export function validarCorreoEstudiante(correo) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@estudiantec\.cr$/;
  if (!emailRegex.test(correo)) {
    throw new Error(
      "El correo de estudiante no cumple con el formato (@estudiantec.cr)."
    );
  }
}

/**
 * Verifica si un correo ya existe en la tabla "Usuario".
 * @param {string} correo 
 * @param {string} id - ID del usuario actual (para editar) o "" (para crear)
 * @returns {boolean} true si NO hay problema (no existe correo duplicado), false si está duplicado.
 */
export async function validarCorreoExistente(correo, id) {
  // Importante: en la nueva BD, la tabla se llama "Usuario", no "usuarios"
  const { data, error } = await supabase
    .from("Usuario")
    .select("id, correo")
    .eq("correo", correo)
    .single();

  // Si no hay datos, significa que no existe ese correo en la BD → se puede usar
  if (!data || error) {
    return true;
  }

  // Si existe un usuario con el mismo correo y el ID difiere, hay duplicado
  if (data.id !== id) {
    // Caso especial: si id === "" y data.correo !== correo, lo validamos, etc.
    if (id === "" && data.correo !== correo) {
      return true;
    }
    return false;
  }

  // Si data.id === id, es el mismo usuario → no es duplicado
  return true;
}

// Exportamos la función principal por defecto
export default validateInfo;
