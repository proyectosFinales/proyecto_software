// ==================== profesor.js ====================

import supabase from "../model/supabase";
import Usuario from "./usuario";
import Anteproyecto from "./anteproyecto";  

class Profesor extends Usuario {
  /**
   * Clave primaria de la tabla Profesor
   * @type {string}
   */
  profesor_id;

  /**
   * Cantidad de estudiantes que tiene asignados
   * @type {number}
   */
  cantidadEstudiantes;

  /**
   * Anteproyectos asociados (opcional, se puede obtener vía joins)
   * @type {Anteproyecto[]}
   */
  anteproyectos;

  /**
   * Estado original para verificar cambios en la cantidad de estudiantes
   */
  original = {};

  /**
   * 
   * @param {string} profesor_id        - PK en la tabla Profesor
   * @param {string} id_usuario         - ID de la tabla Usuario
   * @param {string} nombre             - Nombre del profesor (normalmente en Usuario.nombre)
   * @param {string} sede               - Sede proveniente de Usuario.sede
   * @param {number} cantidadEstudiantes - Valor de la columna "cantidad_estudiantes" en la tabla Profesor
   * @param {Anteproyecto[]} anteproyectos - Lista de anteproyectos asociados (opcional)
   */
  constructor(profesor_id, id_usuario, nombre, sede, cantidadEstudiantes, estudiantesLibres, categoria, anteproyectos = []) {
    super(id_usuario, nombre, sede); // Constructor base de Usuario
    this.profesor_id = profesor_id;
    this.cantidadEstudiantes = cantidadEstudiantes ?? 0;
    this.anteproyectos = anteproyectos;
    this.original.cantidadEstudiantes = this.cantidadEstudiantes;
    this.original.estudiantesLibres = estudiantesLibres;
    this.categoria = categoria;
  }

  /**
   * Crea una instancia de Profesor a partir de un objeto
   * proveniente de Supabase (join con Usuario).
   * @param {Object} obj
   * Ejemplo:
   * {
   *   profesor_id: "...",
   *   cantidad_estudiantes: 5,
   *   Usuario: {
   *     id: "...",
   *     nombre: "...",
   *     sede: "...",
   *     correo: "..."
   *   },
   *   anteproyectos: [ ... ] // si el SELECT anida anteproyectos
   * }
   * @returns {Profesor}
   */
  static from(obj) {
    if (!obj) return null;
    const usuario = obj.Usuario || obj.usuario;

    // Si traes anteproyectos anidados
    let antepros = [];
    if (obj.anteproyectos && Array.isArray(obj.anteproyectos)) {
      antepros = obj.anteproyectos.map(ap => Anteproyecto.from(ap));
    }

    return new Profesor(
      obj.profesor_id,
      usuario?.id,
      usuario?.nombre || "",
      usuario?.sede || "",
      obj.cantidad_estudiantes ?? 0,
      obj.estudiantes_libres,
      obj.Categoria ? obj.Categoria.nombre : null,
      antepros
    );
  }

  /**
   * Ejemplo de función estática para obtener un profesor
   * según su PK (profesor_id) y hacer un join con la tabla Usuario.
   * @param {string} profesor_id 
   * @returns {Profesor | null}
   */
  static async fromID(profesor_id) {
    const { data, error } = await supabase
      .from("Profesor")
      .select(`
        profesor_id,
        cantidad_estudiantes,
        estudiantes_libres,
        Usuario:id_usuario (
          id,
          nombre,
          sede,
          correo,
          telefono
        )
      `)
      .eq("profesor_id", profesor_id)
      .single();

    if (error || !data) {
      console.error("Error recuperando profesor:", error);
      return null;
    }
    return Profesor.from(data);
  }

  /**
   * Obtiene todos los profesores básicos sin anidar anteproyectos.
   * @returns {Promise<Profesor[]>}
   */
  static async obtenerTodos() {
    const { data, error } = await supabase
      .from("Profesor")
      .select(`
        profesor_id,
        cantidad_estudiantes,
        estudiantes_libres,
        categoria_id,
        Usuario:id_usuario (
          id,
          nombre,
          sede,
          correo
        ),
        Categoria:categoria_id (
          nombre
        )
      `);
    
    if (error) {
      throw error; 
    }
    return data.map(p => Profesor.from(p));
  }

  static async obtenerEncargados() {
    return await Profesor.obtenerTodos();
  }

  /**
   * Actualiza "cantidad_estudiantes" en la BD
   * si ha cambiado respecto a la original.
   */
  async actualizarCantidadEstudiantes() {
    const nuevosEstudiantesLibres = this.cantidadEstudiantes - (this.original.cantidadEstudiantes - this.original.estudiantesLibres);

    if (nuevosEstudiantesLibres < 0) {
      return Promise.reject("No se puede reducir la cantidad de estudiantes asignados por debajo del número actual.");
    }

    if (this.original.cantidadEstudiantes !== this.cantidadEstudiantes) {
      const { error } = await supabase
        .from("Profesor")
        .update({
          cantidad_estudiantes: this.cantidadEstudiantes,
          estudiantes_libres: nuevosEstudiantesLibres
        })
        .eq("profesor_id", this.profesor_id);

      if (error) {
        return Promise.reject(error.message);
      }
      this.original.cantidadEstudiantes = this.cantidadEstudiantes;
      this.original.estudiantesLibres = nuevosEstudiantesLibres;
    }
    return Promise.resolve();
  }

  /**
   * Obtiene los profesor_id de todos los profesores que tienen estudiantes_libres > 0
   * @returns {Promise<number[]>}
   */
  static async obtenerProfesoresConEstudiantesLibres() {
    const { data, error } = await supabase
      .from("Profesor")
      .select(`profesor_id,
        estudiantes_libres`)
      .gt("estudiantes_libres", 0);

    if (error) {
      throw error;
    }

    return data;
  }
}

export default Profesor;