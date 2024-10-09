import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wuqbfddlwitkszlakvmj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1cWJmZGRsd2l0a3N6bGFrdm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3Nzg0MjgsImV4cCI6MjA0MjM1NDQyOH0.1C7P4EffAD_SBFke5MWEmKkzAnJYSkez43U4rS66D3s';
const supabase = createClient(supabaseUrl, supabaseKey);



export async function signIn(email, password) {
    const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('Correo', email)
        .eq('Contraseña', password)
        .single(); // Obtiene un solo registro que coincida con los criterios

    if (error) {
        throw new Error(error.message);
    }

    // Verifica si se encontró el usuario
    if (!data) {
        throw new Error('Credenciales inválidas.'); // No se encontró el usuario
    }

    return data;
}
