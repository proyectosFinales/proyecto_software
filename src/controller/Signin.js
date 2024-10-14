import supabase from "../model/supabase"

export async function signIn(email, password) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('correo', email)
        .eq('contraseña', password)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    // Verifica si se encontró el usuario
    if (!data) {
        throw new Error('Credenciales inválidas.');
    }

    return data;
}
