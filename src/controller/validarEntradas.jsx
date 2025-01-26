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
  const carnetRegex = /^[0-9]{10}$/;
  const telRegex = /^(\+?506\s?)?[2-9]\d{7}$/;

  if (!carnetRegex.test(carnet)) {
    throw new Error(
      "El carnet no cumple con un formato válido (debe tener 10 dígitos)."
    );
  } 
  else if (!telRegex.test(tel)) {
    throw new Error(
      "El número de teléfono no cumple con un formato válido. Debe ser 8 dígitos, con o sin prefijo +506."
    );
  } 
  else if (!validarCorreo(email)) {
    throw new Error(
      "El correo no cumple con un formato válido, asegúrate de que sea @estudiantec.cr o @itcr.ac.cr."
    );
  } 
  else if (checkPass) {
    // Usamos la nueva función con checks parciales
    const errorPass = validarContraseñaDetallada(password);
    if (errorPass) {
      throw new Error(errorPass); 
    }
  }
  
  return true; // Si llega aquí, todo está OK
}

/**
 * Hace una validación "paso a paso" en vez de un único Regex,
 * y retorna un string con el mensaje de error (o "" si todo bien).
 */
export function validarContraseñaDetallada(contraseña) {
  if (!contraseña || contraseña.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (!/[a-z]/.test(contraseña)) {
    return "La contraseña debe tener al menos una letra minúscula.";
  }
  if (!/[A-Z]/.test(contraseña)) {
    return "La contraseña debe tener al menos una letra mayúscula.";
  }
  if (!/[0-9]/.test(contraseña)) {
    return "La contraseña debe tener al menos un dígito (0-9).";
  }
  if (!/[@$!%*?&.]/.test(contraseña)) {
    return "La contraseña debe tener al menos un carácter especial (@, $, !, %, *, ?, & o .).";
  }
  // Si pasó todos los checks, retornamos vacío (sin error).
  return "";
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
 * @returns {boolean} true si NO está duplicado (se puede usar), false si sí hay duplicado.
 */
export async function validarCorreoExistente(correo, id) {
  const { data, error } = await supabase
    .from("Usuario")
    .select("id, correo")
    .eq("correo", correo)
    .single();

  // Si no hay datos, significa que no existe ese correo → se puede usar
  if (!data || error) {
    return true;
  }

  // Si existe un usuario con el mismo correo y el ID difiere, hay duplicado
  if (data.id !== id) {
    // Caso especial: si id === "" y data.correo !== correo, etc.
    return !!(id === "" && data.correo !== correo);
  }

  // Si data.id === id, es el mismo usuario → no es duplicado
  return true;
}

/**
 * Valida el formato de teléfono permitiendo 8 dígitos o +506 seguido de 8 dígitos.
 */
export function validarTelefono(phone) {
  if (!phone) return false;
  phone = phone.trim();
  // ^(\+506\d{8}|\d{8})$
  // Esto permite +506 y 8 dígitos continuos, o sólo 8 dígitos
  const regex = /^(\+506\d{8}|\d{8})$/;
  return regex.test(phone);
}

// Exportamos la función principal por defecto
export default validateInfo;
