/**
 * estudiante.js
 * 
 * Clase que modela la entidad Estudiante,
 * la cual extiende de Usuario.
 */

import Usuario from "./usuario";
import supabase from "../model/supabase";

class Estudiante extends Usuario {
  /**
   * Clave primaria de la tabla Estudiante en la BD
   * @type {string} 
   */
  estudiante_id;

  /**
   * Carnet del estudiante (ej. "2019123456")
   * @type {string}
   */
  carnet;

  /**
   * Teléfono podría almacenarse en Usuario o en Estudiante 
   * dependiendo de tu BD. Aquí se asume que "telefono" se guardó en Usuario.
   * @type {string}
   */
  telefono;

  /**
   * Situación laboral del estudiante (Enum en la BD) (nuevo)
   * @type {string}
   */
  situacion_laboral;

  /**
   * Año de ingreso (Integer) (nuevo)
   * @type {number}
   */
  anio_ingreso;


  /**
   * @param {string} estudiante_id - PK en la tabla Estudiante
   * @param {string} id_usuario    - PK de la tabla Usuario (FK en Estudiante)
   * @param {string} nombre        - Nombre del Usuario
   * @param {string} sede          - Sede del Usuario
   * @param {string} correo        - Correo del Usuario
   * @param {string} carnet        - Carnet del Estudiante
   * @param {string} telefono      - Teléfono (si lo guardas en Usuario, lo traerás de ahí)
   * @param {string} situacion_laboral - (nuevo, ya comenté arriba que hace)
   * @param {number} anio_ingreso      - (nuevo)
   */
  constructor(estudiante_id, id_usuario, nombre, sede, correo, carnet, telefono, situacion_laboral, anio_ingreso) {
    super(id_usuario, nombre, sede, correo);
    this.estudiante_id = estudiante_id;
    this.carnet = carnet;
    this.telefono = telefono;
    this.situacion_laboral = situacion_laboral;
    this.anio_ingreso = anio_ingreso;
  }

  /**
   * Construye un Estudiante a partir de un objeto
   * proveniente de Supabase o un join anidado.
   * @param {Object} obj
   * Ejemplo:
   * {
   *   estudiante_id: "...",
   *   carnet: "...",
   *   Usuario: {
   *     id: "...",
   *     nombre: "...",
   *     sede: "...",
   *     correo: "...",
   *     telefono: "..."
   *   }
   * }
   * @returns {Estudiante} Instancia de la clase
   */
  static from(obj) {
    if (!obj) return null;
    
    // En la nueva BD, "Estudiante" = { estudiante_id, id_usuario, carnet, cedula, asesor }
    // y la relación con "Usuario" es { id, nombre, sede, correo, telefono }.
    const usuario = obj.Usuario || obj.usuario;

    return new Estudiante(
      obj.estudiante_id,
      usuario?.id,           // ID de Usuario
      usuario?.nombre || "", // Nombre del Usuario
      usuario?.sede || "",
      usuario?.correo || "",
      obj.carnet || "",
      usuario?.telefono || "",
      obj.situacion_laboral, // (nuevo)
      obj.anio_ingreso       // (nuevo)
    );
  }

  static async obtenerTodos() {
    const { data, error } = await supabase
      .from("Estudiante")
      .select(`
        estudiante_id,
        estado,
        carnet,
        asesor,
        semestre_id,
        situacion_laboral, -- (nuevo)
        anio_ingreso,      -- (nuevo)
        Usuario:id_usuario (
          id,
          nombre,
          sede,
          correo
        )
      `);
    
    if (error) {
      throw error; 
    }
    return data;
  }

}

export default Estudiante;
