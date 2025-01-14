import * as XLSX from "xlsx";
import Anteproyecto from "./anteproyecto";
import Profesor from "./profesor";

/**
 * Función que realiza la distribución de los anteproyectos entre los profesores
 * @param {Anteproyecto[]} anteproyectos 
 * @param {Profesor[]} profesores 
 */
export const asignarAnteproyectosAProfesores = (anteproyectos, profesores) => {
  return new Promise(resolve => {
    const asignados = [];
    const noasignados = [];
    let indiceProfesor = 0;
    
    // Iteramos anteproyectos uno a uno con profesores para lograr una asignación nivelada
    anteproyectos.forEach(anteproyecto => {
      let asignado = false;
      const totalProfesores = profesores.length;

      // Intentamos asignar con un ciclo circular de profesores
      for (let i = 0; i < totalProfesores; i++) {
        const profesor = profesores[indiceProfesor];
        indiceProfesor = (indiceProfesor === totalProfesores - 1) ? 0 : indiceProfesor + 1;

        if (esAsignable(anteproyecto, profesor)) {
          anteproyecto.encargado = profesor;
          asignados.push(anteproyecto);
          asignado = true;
          break;
        }
      }

      if (!asignado) {
        noasignados.push(anteproyecto);
      }
    });

    resolve({ asignados, noasignados });
  });
};

/**
 * Confirma si un anteproyecto es asignable a un profesor.
 * Ejemplo: 
 *   - Se comprueba que el profesor tenga "espacio" en cantidad_estudiantes
 *   - La sede coincida (Usuario.sede)
 *   - No sea el mismo profesor que tuvo en un anteproyecto anterior "Perdido"
 */
const esAsignable = (anteproyecto, profesor) => {
  // Verifica si el profesor aún tiene cupo (cantidad_estudiantes) en la nueva BD
  if (profesor.cantidadEstudiantes >= 10) return false; 
  // Sede
  if (anteproyecto.estudiante.sede !== profesor.sede) return false;
  // Repitente con el mismo profesor
  if (anteproyecto.anteproyectosPerdidos.find(ap => ap.encargado && ap.encargado.profesor_id === profesor.profesor_id)) {
    return false;
  }
  return true;
};

/**
 * Genera un reporte de Excel con los profesores y sus proyectos asignados
 */
export const generarReporteAsignaciones = profesores => {
  const datosAexportar = profesores.map(profesor => {
    return profesor.anteproyectos.map(anteproyecto => {
      return {
        "Profesor": profesor.nombre,
        "Empresa": anteproyecto.nombreEmpresa,
        "Estudiante": anteproyecto.estudiante.nombre,
        "Correo": anteproyecto.estudiante.correo,
        "Carnet": anteproyecto.estudiante.carnet,
        "Telefono": anteproyecto.estudiante.telefono,
      };
    });
  }).flat();

  const worksheet = XLSX.utils.json_to_sheet(datosAexportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Asignaciones");
  XLSX.writeFile(workbook, "Reporte_Asignaciones.xlsx");
};
