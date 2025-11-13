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
   * Disponibilidad de espacios (de AsignacionesProfesor.disponibilidad)
   * @type {number}
   */
  disponibilidad;

  /**
   * Proyectos asignados (de AsignacionesProfesor.asignados)
   * @type {number}
   */
  proyectosAsignados;

  /**
   * Semestre de la asignación (de AsignacionesProfesor.semestre)
   * @type {number}
   */
  semestre;

  /**
   * Año de la asignación (de AsignacionesProfesor.año)
   * @type {number}
   */
  año;

  /**
   * Categoría del profesor
   * @type {string}
   */
  categoria;

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
   * Constructor del Profesor
   * @param {string} profesor_id        - PK en la tabla Profesor
   * @param {string} id_usuario         - ID de la tabla Usuario
   * @param {string} nombre             - Nombre del profesor
   * @param {string} sede               - Sede proveniente de Usuario.sede
   * @param {number} disponibilidad     - Disponibilidad de AsignacionesProfesor
   * @param {number} proyectosAsignados - Proyectos asignados de AsignacionesProfesor
   * @param {string} categoria          - Categoría del profesor
   * @param {Anteproyecto[]} anteproyectos - Lista de anteproyectos asociados (opcional)
   */
  constructor(profesor_id, id_usuario, nombre, sede, disponibilidad, proyectosAsignados, categoria, semestre, año, anteproyectos = []) {
    super(id_usuario, nombre, sede);
    this.profesor_id = profesor_id;
    this.disponibilidad = disponibilidad ?? 0;
    this.proyectosAsignados = proyectosAsignados ?? 0;
    this.categoria = categoria;
    this.semestre = semestre ?? null;
    this.año = año ?? null;
    this.anteproyectos = anteproyectos;
    this.original.disponibilidad = this.disponibilidad;
    this.original.proyectosAsignados = this.proyectosAsignados;
  }

  /**
   * Crea una instancia de Profesor a partir de un objeto
   * proveniente de Supabase (JOIN con AsignacionesProfesor y Usuario).
   * @param {Object} obj
   * Ejemplo:
   * {
   *   profesor_id: "...",
   *   disponibilidad: 5,
   *   asignados: 2,
   *   categoria_id: "...",
   *   id: "...",
   *   nombre: "...",
   *   sede: "...",
   *   correo: "..."
   * }
   * @returns {Profesor}
   */
  static from(obj) {
    if (!obj) return null;

    // Si traes anteproyectos anidados
    let antepros = [];
    if (obj.anteproyectos && Array.isArray(obj.anteproyectos)) {
      antepros = obj.anteproyectos.map(ap => Anteproyecto.from(ap));
    }

    return new Profesor(
      obj.profesor_id,
      obj.id,
      obj.nombre || "",
      obj.sede || "",
      obj.disponibilidad ?? 0,
      obj.asignados ?? 0,
      obj.categoria_nombre || null,
      obj.semestre ?? null,
      obj.año ?? null,
      antepros
    );
  }

  /**
   * Obtiene un profesor específico con todos sus datos incluyendo disponibilidad y asignados
   * @param {string} profesor_id 
   * @returns {Profesor | null}
   */
  static async fromID(profesor_id) {
    try {
      // Query 1: Obtenemos el profesor con usuario y categoría
      const { data: profesorData, error: errorProfesor } = await supabase
        .from("Profesor")
        .select(`
          profesor_id,
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
        `)
        .eq("profesor_id", profesor_id)
        .single();

      if (errorProfesor || !profesorData) {
        console.error("Error recuperando profesor:", errorProfesor);
        return null;
      }

      // Query 2: Obtenemos los datos de asignación
      const { data: asignacionData, error: errorAsignacion } = await supabase
        .from("AsignacionesProfesor")
        .select("disponibilidad, asignados, semestre, año")
        .eq("idProfesor", profesor_id)
        .single();

      if (errorAsignacion) {
        console.warn("No se encontraron asignaciones para el profesor:", profesor_id);
      }

      // Combinamos los datos
      const disponibilidad = asignacionData?.disponibilidad ?? 0;
      const asignados = asignacionData?.asignados ?? 0;
      const semestre = asignacionData?.semestre ?? null;
      const año = asignacionData?.año ?? null;

      return new Profesor(
        profesorData.profesor_id,
        profesorData.Usuario?.id,
        profesorData.Usuario?.nombre || "",
        profesorData.Usuario?.sede || "",
        disponibilidad,
        asignados,
        profesorData.Categoria?.nombre || null,
        semestre,
        año
      );
    } catch (error) {
      console.error("Error en fromID:", error);
      return null;
    }
  }

  /**
   * Obtiene TODOS los profesores con sus datos de disponibilidad y proyectos asignados.
   * Ejecuta el SQL equivalente a:
   * SELECT p.profesor_id, ap.disponibilidad, ap.asignados, p.categoria_id, u.id, u.nombre, u.sede, u.correo
   * FROM "Profesor" p
   * JOIN "AsignacionesProfesor" ap ON p.profesor_id = ap."idProfesor"
   * JOIN "Usuario" u ON u.id = p.id_usuario
   *
   * @returns {Promise<Profesor[]>}
   */
  static async obtenerTodos() {
    try {
      // Query 1: Obtenemos todos los profesores con usuario y categoría
      const { data: profesores, error: errorProfesores } = await supabase
        .from("Profesor")
        .select(`
          profesor_id,
          categoria_id,
          Usuario:id_usuario (
            id,
            nombre,
            sede,
            correo,
            canton
          ),
          Categoria:categoria_id (
            nombre
          )
        `);

      if (errorProfesores) {
        console.error("Error obteniendo profesores:", errorProfesores);
        throw errorProfesores;
      }

      if (!profesores || profesores.length === 0) {
        return [];
      }

      // Query 2: Obtenemos TODAS las asignaciones
      const { data: asignaciones, error: errorAsignaciones } = await supabase
        .from("AsignacionesProfesor")
        .select("idProfesor, disponibilidad, asignados, semestre, año");

      if (errorAsignaciones) {
        console.error("Error obteniendo asignaciones:", errorAsignaciones);
        throw errorAsignaciones;
      }

      // Creamos un mapa para búsqueda rápida: idProfesor -> {disponibilidad, asignados, semestre, año}
      const mapaAsignaciones = new Map();
      if (asignaciones && asignaciones.length > 0) {
        asignaciones.forEach(asignacion => {
          mapaAsignaciones.set(asignacion.idProfesor, {
            disponibilidad: asignacion.disponibilidad,
            asignados: asignacion.asignados,
            semestre: asignacion.semestre,
            año: asignacion.año
          });
        });
      }

      // Combinamos los datos: profesores + asignaciones
      return profesores.map(profesor => {
        const asignacion = mapaAsignaciones.get(profesor.profesor_id) || { disponibilidad: 0, asignados: 0, semestre: null, año: null };
        const instancia = new Profesor(
          profesor.profesor_id,
          profesor.Usuario?.id,
          profesor.Usuario?.nombre || "",
          profesor.Usuario?.sede || "",
          asignacion.disponibilidad,
          asignacion.asignados,
          profesor.Categoria?.nombre || null,
          asignacion.semestre,
          asignacion.año
        );
        // Attach Usuario as a property for filtering (if needed)
        instancia.Usuario = profesor.Usuario;
        return instancia;
      });
    } catch (error) {
      console.error("Error en obtenerTodos:", error);
      throw error;
    }
  }

  static async obtenerEncargados() {
    return await Profesor.obtenerTodos();
  }

  /**
   * Actualiza la disponibilidad en la tabla AsignacionesProfesor
   * (antes actualizaba cantidad_estudiantes, ahora actualiza disponibilidad)
   */
  async actualizarCantidadEstudiantes() {
    console.log(this.disponibilidad)
    if (this.original.disponibilidad === this.disponibilidad) {
      return Promise.resolve();
    }

    if (this.disponibilidad < this.proyectosAsignados) {
      this.disponibilidad = this.disponibilidad +1;
      return Promise.resolve();
    }

    try {
      const { error } = await supabase
        .from("AsignacionesProfesor")
        .update({ disponibilidad: this.disponibilidad })
        .eq("idProfesor", this.profesor_id);

      if (error) {
        return Promise.reject(error.message);
      }

      this.original.disponibilidad = this.disponibilidad;
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error.message);
    }
  }

  /**
   * Obtiene los profesores que tienen espacios disponibles
   * Es decir: donde disponibilidad > proyectosAsignados
   * Los datos se obtienen de la tabla AsignacionesProfesor
   * @returns {Promise<Array>}
   */
  static async obtenerProfesoresConEstudiantesLibres() {
    try {
      // Obtenemos TODAS las asignaciones
      const { data: asignaciones, error } = await supabase
        .from("AsignacionesProfesor")
        .select("idProfesor, disponibilidad, asignados");

      if (error) {
        throw error;
      }

      if (!asignaciones || asignaciones.length === 0) {
        return [];
      }

      // Filtramos: disponibilidad > asignados
      return asignaciones
        .filter(a => a.disponibilidad > a.asignados)
        .map(a => ({
          profesor_id: a.idProfesor,
          disponibilidad: a.disponibilidad,
          proyectosAsignados: a.asignados,
          espaciosLibres: a.disponibilidad - a.asignados
        }));
    } catch (error) {
      console.error("Error en obtenerProfesoresConEstudiantesLibres:", error);
      throw error;
    }
  }
}

export default Profesor;