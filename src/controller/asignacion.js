import Anteproyecto from "./anteproyecto";
import Profesor from "./profesor";

/**
 * Función que realiza la distribución de los anteproyectos entre los profesores
 * @param {Anteproyecto[]} anteproyectos 
 * @param {Profesor[]} profesores 
 */
const asignarAnteproyectosAProfesores = (anteproyectos, profesores) => {
    return new Promise(resolve => {
        anteproyectos.forEach(anteproyecto => {
            profesores.forEach(profesor => {
                // Se comprueba disponibilidad del profesor
                if(profesor.cantidadProyectos === 0) return;
                // Sede
                if(anteproyecto.estudiante.sede !== profesor.sede) return;
                // Repitente
            });
        });
        // Repitente
    });
}

export { asignarAnteproyectosAProfesores };