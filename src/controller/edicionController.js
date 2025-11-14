
import supabase from '../model/supabase';

/**
 * Solicita la información cierta información de un estudiante.
 * @param {*} estudianteID el ID de un estudiante.
 * @returns La info de la consulta hacia la BD.
 */
export const obtenerEstudiante = async (estudianteID) => {
    const { data, error } = await supabase
        .from("Estudiante")
        .select(`
        carnet,
        Usuario:id_usuario (
            nombre,
            correo
        )
        `)
        .eq("estudiante_id", estudianteID);
    if (error) {
        console.log("Error al pedir la info de EST: ", error);
        throw error; 
    }
    return data;
};