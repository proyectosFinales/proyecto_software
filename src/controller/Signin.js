import supabase from "../model/supabase";

export async function signIn(email, password) {
  const { data, error } = await supabase
    .from('Usuario')
    .select('*')
    .eq('correo', email)
    .eq('contrasena', password)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Credenciales inválidas.');
  }

  return data; // data contendrá { id, nombre, correo, rol, ...}
}
