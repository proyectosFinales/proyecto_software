import supabase from "../model/supabase";
import bcrypt from "bcryptjs";

export async function signIn(email, password) {
  const { data, error } = await supabase
    .from('Usuario')
    .select('*')
    .eq('correo', email)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Credenciales inválidas.');
  }

  const coincide = await bcrypt.compare(password, data.contrasena).catch(() => false);

  if (!coincide) {
    throw new Error('Credenciales inválidas.');
  }

  return data; // data contendrá { id, nombre, correo, rol, ...}
}

/**
 * 
 * @param {*} userID id del usuario logueado en la plataforma.
 * @returns algunos de los atributos existentes en la BD.
 * @example data = {
 *   estudiante_id: string,
 *   estado: string,
 *   carnet: string,
 *   asesor: string
 * }
 */
export async function getStudent(userID){
  const { data, error } = await supabase
    .from('Estudiante')
    .select(`
      estudiante_id,
      estado,
      carnet,
      asesor
    `)
    .eq('id_usuario', userID)
    .single();

  if (error) {
    const customError = new Error(error.message);
    customError.code = error.code;
    throw customError;
  }
  return data;
}
