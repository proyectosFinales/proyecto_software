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

export { asignarAnteproyectosAProfesores };