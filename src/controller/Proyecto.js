// ==================== Proyecto.js ====================

import supabase from "../model/supabase";

/**
 * Clase Proyecto
 * Representa un proyecto aprobado que puede ser asignado a un profesor
 */
class Proyecto {
  /**
   * ID único del proyecto
   * @type {string}
   */
  id;

  /**
   * Estado del proyecto
   * @type {string}
   */
  estado;

  /**
   * ID del anteproyecto asociado
   * @type {string}
   */
  anteproyecto_id;

  /**
   * ID del estudiante
   * @type {string}
   */
  estudiante_id;

  /**
   * ID del profesor asignado (NULL si no está asignado)
   * @type {string | null}
   */
  profesor_id;

  /**
   * Constructor del Proyecto
   * @param {string} id
   * @param {string} estado
   * @param {string} anteproyecto_id
   * @param {string} estudiante_id
   * @param {string | null} profesor_id
   */
  constructor(
    id,
    estado,
    anteproyecto_id,
    estudiante_id,
    profesor_id = null
  ) {
    this.id = id;
    this.estado = estado;
    this.anteproyecto_id = anteproyecto_id;
    this.estudiante_id = estudiante_id;
    this.profesor_id = profesor_id;
  }

  /**
   * Obtiene la CANTIDAD de proyectos sin profesor asignado
   * Busca en tabla Proyecto donde profesor_id IS NULL
   * @returns {Promise<number>}
   */
  static async obtenerCantidadProyectossinProfesor() {
    try {
      const { count, error } = await supabase
        .from("Proyecto")
        .select("id", { count: "exact", head: true })
        .is("profesor_id", null);

      if (error) {
        console.error("Error contando proyectos sin profesor:", error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error("Error en obtenerCantidadProyectossinProfesor:", error);
      return 0;
    }
  }

  /**
   * Obtiene TODOS los proyectos que NO tienen profesor asignado
   * @returns {Promise<Proyecto[]>}
   */
  static async obtenerProyectossinProfesor() {
    try {
      const { data, error } = await supabase
        .from("Proyecto")
        .select("id, estado, anteproyecto_id, estudiante_id, profesor_id")
        .is("profesor_id", null);

      if (error) {
        console.error("Error obteniendo proyectos sin profesor:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(p => new Proyecto(
        p.id,
        p.estado,
        p.anteproyecto_id,
        p.estudiante_id,
        p.profesor_id
      ));
    } catch (error) {
      console.error("Error en obtenerProyectossinProfesor:", error);
      throw error;
    }
  }

  /**
   * Obtiene todos los proyectos asignados a un profesor
   * @param {string} profesor_id
   * @returns {Promise<Proyecto[]>}
   */
  static async obtenerProyectosProfesor(profesor_id) {
    try {
      const { data, error } = await supabase
        .from("Proyecto")
        .select("id, estado, anteproyecto_id, estudiante_id, profesor_id")
        .eq("profesor_id", profesor_id);

      if (error) {
        console.error("Error obteniendo proyectos del profesor:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data.map(p => new Proyecto(
        p.id,
        p.estado,
        p.anteproyecto_id,
        p.estudiante_id,
        p.profesor_id
      ));
    } catch (error) {
      console.error("Error en obtenerProyectosProfesor:", error);
      throw error;
    }
  }

  /**
   * Asigna un proyecto a un profesor
   * @param {string} profesor_id
   * @returns {Promise<boolean>}
   */
  async asignarProfesor(profesor_id) {
    try {
      const { error } = await supabase
        .from("Proyecto")
        .update({ profesor_id })
        .eq("id", this.id);

      if (error) {
        console.error("Error asignando profesor:", error);
        return false;
      }

      this.profesor_id = profesor_id;
      return true;
    } catch (error) {
      console.error("Error en asignarProfesor:", error);
      return false;
    }
  }

  /**
   * Desasigna el profesor de un proyecto
   * @returns {Promise<boolean>}
   */
  async desasignarProfesor() {
    try {
      const { error } = await supabase
        .from("Proyecto")
        .update({ profesor_id: null })
        .eq("id", this.id);

      if (error) {
        console.error("Error desasignando profesor:", error);
        return false;
      }

      this.profesor_id = null;
      return true;
    } catch (error) {
      console.error("Error en desasignarProfesor:", error);
      return false;
    }
  }

  /**
   * Actualiza el estado del proyecto
   * @param {string} nuevoEstado
   * @returns {Promise<boolean>}
   */
  async actualizarEstado(nuevoEstado) {
    // Actualiza el estado en la base de datos
    try {
      const { error } = await supabase
        .from("Proyecto")
        .update({ estado: nuevoEstado }) // Usa el nuevo estado
        .eq("id", this.id);

      if (error) {
        console.error("Error actualizando estado:", error);
        return false;
      }

      this.estado = nuevoEstado; // Actualiza el estado en la instancia local
      return true;
    } catch (error) {
      console.error("Error en actualizarEstado:", error);
      return false;
    }
  }
}

export default Proyecto;
