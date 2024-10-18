import supabase from "../model/supabase";
import Estudiante from "./estudiante";

const ESTADOS_ANTEPROYECTO = {
    APROBADO: "Aprobado",
    REPROBADO: "Reprobado"
}

const consultaAnteproyectos = () => {
    return supabase
        .from("anteproyectos")
        .select("id, nombreEmpresa, estado, estudiante:estudiantes(id, nombre, usuario:usuarios(sede))");
}

/**
 * 
 * @param {*} rawAnteproyectos 
 * @returns {Anteproyecto[]}
 */
const transformacionAnteproyectos = rawAnteproyectos => {
    return rawAnteproyectos.map(a => new Anteproyecto(
        a.id,
        a.nombreEmpresa,
        a.estado,
        new Estudiante(a.estudiante?.id, a.estudiante?.nombre, a.estudiante?.usuario.sede)
    ));
}

class Anteproyecto {
    id;
    nombre;
    /** @type {Estudiante} */
    estudiante;
    /** @type {Anteproyecto[]} */
    anteproyectosAnteriores = [];

    constructor(id, nombre, estado, estudiante) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
        this.estudiante = estudiante;
    }

    static async obtenerTodos() {
        const { data } = await consultaAnteproyectos();
        return transformacionAnteproyectos(data);
    }

    static async obtenerAsignables() {
        const { data } = await consultaAnteproyectos()
            .eq("estado", ESTADOS_ANTEPROYECTO.APROBADO)
            .is("idEncargado", null);
        const anteproyectos = transformacionAnteproyectos(data);
        // Se almacenan los proyectos repetidos de cada estudiante
        for(let anteproyecto of anteproyectos) {
            const { data:repetidos } = await consultaAnteproyectos()
                .eq("idEstudiante", anteproyecto.estudiante.id)
                .eq("");
            anteproyecto.anteproyectosAnteriores = transformacionAnteproyectos(repetidos);
        }
        return anteproyectos;
    }
}

export default Anteproyecto;