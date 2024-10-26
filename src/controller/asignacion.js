import * as XLSX from "xlsx";
import Anteproyecto from "./anteproyecto";
import Profesor from "./profesor";

/**
 * Función que realiza la distribución de los anteproyectos entre los profesores
 * @param {Anteproyecto[]} anteproyectos 
 * @param {Profesor[]} profesores 
 */
const asignarAnteproyectosAProfesores = (anteproyectos, profesores) => {
    return new Promise(resolve => {
        const asignados = [];
        const noasignados = []
        let indiceProfesor = 0;
        // Iteramos anteproyectos uno a uno con profesores para lograr una asignación nivelada
        anteproyectos.forEach(anteproyecto => {
            for(let i=0; i<profesores.length; i++) {
                const profesor = profesores[indiceProfesor];
                // Iterar circularmente a profesores
                indiceProfesor = indiceProfesor == profesores.length - 1 ? 0 : indiceProfesor + 1;
                
                if(esAsignable(anteproyecto, profesor)) {
                    anteproyecto.encargado = profesor;
                    asignados.push(anteproyecto);
                    return;
                }
            }
            noasignados.push(anteproyecto);
        });
        resolve({asignados, noasignados});
    });
}

/**
 * Confirma si un anteproyecto es asignable a un profesor
 * @param {Anteproyecto} anteproyecto 
 * @param {Profesor} profesor 
 */
const esAsignable = (anteproyecto, profesor) => {
    // Se comprueba disponibilidad del profesor
    if(profesor.cantidadProyectos === 0) return false;
    // Sede
    if(anteproyecto.estudiante.sede !== profesor.sede) return false;
    // Repitente con el mismo profesor
    if(anteproyecto.anteproyectosPerdidos.find(ap => ap.encargado.id === profesor.id)) return false;
    return true;
}

/**
 * Genera un reporte de excel con los profesores y sus proyectos asignados
 * @param {Profesor[]} profesores 
 */
const generarReporteAsignaciones = profesores => {
    const datosAexportar = profesores.map(profesor => {
        return profesor.anteproyectos.map(anteproyecto => {
            return {
                "Profesor": profesor.nombre,
                "Empresa": anteproyecto.nombreEmpresa,
                "Estudiante": anteproyecto.estudiante.nombre,
                "Carnet": anteproyecto.estudiante.carnet,
                "Telefono": anteproyecto.estudiante.telefono,
            };
        });
    }).flat();

    const worksheet = XLSX.utils.json_to_sheet(datosAexportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asignaciones");
    XLSX.writeFile(workbook, "Reporte Asignaciones.xlsx");
}

export { asignarAnteproyectosAProfesores, generarReporteAsignaciones };