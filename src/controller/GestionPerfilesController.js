
import supabase from '../model/supabase';

/**
 * Funcion que pide la informacion de los profesores a la BD.
 * @returns La info de los profesores, de la tabla Profesor y la tabla Usuario.
 */
export async function fetchProfesores() {
    try {
        const { data, error } = await supabase
        .from('Profesor')
        .select(`
            id_usuario,
            cantidad_estudiantes,
            estudiantes_libres,
            Usuario:id_usuario (
                nombre,
                correo,
                sede,
                telefono,
                provincia,
                canton,
                distrito
            )
        `);
        return {data, error}
    } catch (error) {
        alert("Error al pedir la info de los profesores: ", error)
        console.log("Error al pedir la info de los profesores: ", error );
    }
};

/**
 * Funcion que pide la informacion de los estudiantes a la BD.
 * @returns La info de los estudiantes, de la tabla Estudiante y la tabla Usuario.
 */
export async function fetchEstudiantes() {
    try {
        const { data, error } = await supabase
        .from('Estudiante')
        .select(`
            estudiante_id,
            id_usuario,
            carnet,
            asesor,
            estado,
            semestre_id,
            situacion_laboral,
            anio_ingreso,
            Usuario:id_usuario (
                nombre,
                correo,
                sede,
                telefono,
                provincia,
                canton,
                distrito
            ),
            Profesor:asesor (
                Usuario:id_usuario(
                    nombre
                )
            ),
            Semestre:semestre_id (
                nombre,
                fecha_inicio,
                fecha_fin,
                calendario_id
            )
        `);
        return {data, error}
    } catch (error) {
        alert("Error al pedir la info de los estudiantes: ", error)
        console.log("Error al pedir la info de los estudiantes: ", error );
    }
};