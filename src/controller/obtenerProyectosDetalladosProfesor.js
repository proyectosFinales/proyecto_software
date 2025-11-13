import supabase from "../model/supabase";

/**
 * Obtiene todos los proyectos asignados a un profesor, con info de estudiante y empresa
 * @param {string} profesor_id
 * @returns {Promise<Array<{id, estudiante: {nombre}, empresa: {nombre}}>>}
 */
export async function obtenerProyectosDetalladosProfesor(profesor_id) {
  try {
    const { data, error } = await supabase
      .from("Proyecto")
      .select(`id, estado, anteproyecto_id, estudiante_id, profesor_id,
        Estudiante:estudiante_id (Usuario:id_usuario (nombre)),
        Anteproyecto:anteproyecto_id (Empresa:empresa_id (nombre))
      `)
      .eq("profesor_id", profesor_id);

    if (error) {
      console.error("Error obteniendo proyectos detallados del profesor:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(p => ({
      id: p.id,
      estudiante: { nombre: p.Estudiante?.Usuario?.nombre || "" },
      empresa: { nombre: p.Anteproyecto?.Empresa?.nombre || "" }
    }));
  } catch (error) {
    console.error("Error en obtenerProyectosDetalladosProfesor:", error);
    throw error;
  }
}
