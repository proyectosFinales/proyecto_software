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
