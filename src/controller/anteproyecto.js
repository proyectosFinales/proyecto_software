import supabase from "../model/supabase";
import Estudiante from "./estudiante";
import Profesor from "./profesor";

/** 
 * Posibles estados (extendidos) en la nueva BD:
 * 'Pendiente', 'Aprobado', 'Reprobado', 'Defensa', 'Finalizado', 'Perdido'
 * Ajusta según tu ENUM 'Estado' o crea un mapeo si difiere.
 */
export const ESTADOS_ANTEPROYECTO = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  REPROBADO: "Reprobado",
  DEFENSA: "Defensa",
  FINALIZADO: "Finalizado",
  PERDIDO: "Perdido"
};

/**
 * Consulta principal de anteproyectos, uniendo con Estudiante, Usuario y Empresa.
 * Nota: La información del "profesor asesor" puede ser o no el que está en 
 * la tabla Estudiante.asesor (opcional). Ajusta según tu caso.
 */
const consultaAnteproyectos = () => {
  return supabase
    .from("Anteproyecto")
    .select(`
      id,
      estado,
      comentario,
      contexto,
      justificacion,
      sintomas,
      impacto,
      actividad,
      fecha_creacion,
      ultima_modificacion,

      -- Relación con Estudiante:
      Estudiante:estudiante_id (
        estudiante_id,
        carnet,
        cedula,
        asesor, 
        Usuario:id_usuario (
          id,
          nombre,
          correo,
          sede,
          telefono
        )
      ),

      -- Relación con Empresa
      Empresa:empresa_id (
        id,
        nombre,
        tipo,
        provincia,
        canton,
        distrito
      )
    `);
};

/**
 * Clase Anteproyecto
 */
class Anteproyecto {
  id;
  nombreEmpresa;    // Manejado a través de Empresa en la nueva BD
  estudiante;       // Objeto Estudiante
  encargado;        // Objeto Profesor (si corresponde)
  anteproyectosPerdidos = [];

  constructor(
    id, nombreEmpresa, estado, 
    tipoEmpresa, actividadEmpresa, distritoEmpresa, cantonEmpresa, provinciaEmpresa,
    nombreAsesor, puestoAsesor, telefonoContacto, correoContacto,
    nombreHR, telefonoHR, correoHR,
    contexto, justificacion, sintomas, impacto, nombreDepartamento, tipoProyecto, observaciones,
    estudiante, encargado
  ) {
    this.id = id;
    this.nombreEmpresa = nombreEmpresa;
    this.estado = estado;
    this.tipoEmpresa = tipoEmpresa;
    this.actividadEmpresa = actividadEmpresa;
    this.distritoEmpresa = distritoEmpresa;
    this.cantonEmpresa = cantonEmpresa;
    this.provinciaEmpresa = provinciaEmpresa;
    this.nombreAsesor = nombreAsesor;
    this.puestoAsesor = puestoAsesor;
    this.telefonoContacto = telefonoContacto;
    this.correoContacto = correoContacto;
    this.nombreHR = nombreHR;
    this.telefonoHR = telefonoHR;
    this.correoHR = correoHR;
    this.contexto = contexto;
    this.justificacion = justificacion;
    this.sintomas = sintomas;
    this.impacto = impacto;
    this.nombreDepartamento = nombreDepartamento;
    this.tipoProyecto = tipoProyecto;
    this.observaciones = observaciones;
    this.estudiante = estudiante;
    this.encargado = encargado;
  }

  static from(obj) {
    if (!obj) return null;
    
    // La "empresa" real se obtiene de obj.Empresa
    let nombreEmpresa = obj?.Empresa?.nombre ?? "";
    let tipoEmpresa = obj?.Empresa?.tipo ?? "";
    let distritoEmpresa = obj?.Empresa?.distrito ?? "";
    let cantonEmpresa = obj?.Empresa?.canton ?? "";
    let provinciaEmpresa = obj?.Empresa?.provincia ?? "";

    // De momento, no tenemos un "encargado" directo en Anteproyecto en la nueva BD,
    // sí un "asesor" en Estudiante, el cual es un uuid que referencia Profesor.profesor_id.
    let encargado = null; 
    // Podrías hacer aquí una búsqueda extra en Profesor si lo deseas, 
    // o si manejas un campo "profesor_id" dentro de Anteproyecto, ajústalo.

    const anteproyecto = new Anteproyecto(
      obj.id,
      nombreEmpresa,
      obj.estado,
      tipoEmpresa,
      obj.actividad,
      distritoEmpresa,
      cantonEmpresa,
      provinciaEmpresa,
      // El resto de campos de contacto NO están en la nueva BD directamente,
      // podrías guardarlos en "ContactoEmpresa" o "AnteproyectoContacto".
      // Aquí se muestra cómo "placeholder".
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      obj.contexto,
      obj.justificacion,
      obj.sintomas,
      obj.impacto,
      "Desconocido",         // nombreDepartamento (no se maneja en la nueva BD, agrégalo si gustas)
      "Desconocido",         // tipoProyecto
      obj.comentario || "",  // observaciones
      Estudiante.from(obj.Estudiante),
      encargado
    );
    
    return anteproyecto;
  }

  /**
   * Obtiene TODOS los anteproyectos registrados.
   */
  static async obtenerTodos() {
    const { data, error } = await consultaAnteproyectos();
    if (error) {
      console.error("Error al obtener anteproyectos:", error);
      return [];
    }
    return data.map(ap => Anteproyecto.from(ap));
  }

  /**
   * Obtiene anteproyectos asignables (ejemplo de filtrado).
   * Adapta a tu lógica real. Aquí filtramos donde estado = 'Aprobado' 
   * y no tengan asesor (en la nueva BD).
   */
  static async obtenerAsignables() {
    const { data, error } = await supabase
      .from("Anteproyecto")
      .select(`
        id,
        estado,
        contexto,
        justificacion,
        sintomas,
        impacto,
        actividad,
        Empresa:empresa_id (
          id,
          nombre
        ),
        Estudiante:estudiante_id (
          estudiante_id,
          carnet,
          Usuario:id_usuario (
            id,
            nombre,
            correo,
            sede
          )
        )
      `)
      .eq("estado", ESTADOS_ANTEPROYECTO.APROBADO);

    if (error) {
      console.error("Error obteniendo anteproyectos asignables:", error);
      return [];
    }

    // Filtramos en JS los que no tengan profesor asesor (Estudiante.asesor = null)
    const anteproyectos = data
      .filter(ap => !ap.Estudiante?.asesor)
      .map(ap => Anteproyecto.from(ap));

    // Ejemplo: "proyectos perdidos" para cada estudiante
    for (let anteproyecto of anteproyectos) {
      // Buscamos anteproyectos con estado "Perdido" de ese estudiante
      const { data: perdidos, error: error2 } = await supabase
        .from("Anteproyecto")
        .select(`
          id,
          estado,
          Empresa:empresa_id (
            id,
            nombre
          ),
          Estudiante:estudiante_id (
            estudiante_id,
            Usuario:id_usuario (
              id,
              nombre
            )
          )
        `)
        .eq("estado", ESTADOS_ANTEPROYECTO.PERDIDO)
        .eq("estudiante_id", anteproyecto.estudiante.estudiante_id);

      if (!error2 && perdidos?.length) {
        anteproyecto.anteproyectosPerdidos = perdidos.map(ap => Anteproyecto.from(ap));
      }
    }

    return anteproyectos;
  }

  /**
   * Guardar la "asignación" de un anteproyecto a un profesor.
   * En la nueva BD, si quieres asignar un profesor al anteproyecto directamente,
   * necesitas un campo en la tabla "Anteproyecto" o "Proyecto". 
   * Por ejemplo, si usas la tabla "Proyecto" para la relación final, ajústalo.
   */
  async guardarAsignacion() {
    // Como ejemplo, se asume que "estudiante.asesor" en la tabla Estudiante 
    // se actualiza con el profesor asignado (encargado).
    if (!this.encargado) return;

    return new Promise(async (resolve, reject) => {
      const { error } = await supabase
        .from("Estudiante")
        .update({ asesor: this.encargado.profesor_id }) // la clave primaria en Profesor
        .eq("estudiante_id", this.estudiante.estudiante_id);

      if (error) {
        console.error("Error al guardar asignación:", error);
        reject(error);
      } else {
        resolve(true);
      }
    });
  }

  static async cambiarEstado(anteproyecto, newEstado) {
    const oldEstado = anteproyecto.estado;
    // the same logic from handleEstadoChange, but placed here
    // 1) update Anteproyecto
    // 2) if (old != 'Aprobado' && new == 'Aprobado') => insert Proyecto
    // 3) if (old == 'Aprobado' && new != 'Aprobado') => remove Proyecto + bitácoras + entradas
  }
}

export default Anteproyecto;
