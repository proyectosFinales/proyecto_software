import supabase from "../model/supabase";
import Estudiante from "./estudiante";
import Profesor from "./profesor";

const ESTADOS_ANTEPROYECTO = {
    PENDIENTE: "Pendiente",
    APROBADO: "Aprobado",
    REPROBADO: "Reprobado",
    FINALIZADO: "Finalizado",
    PERDIDO: "Perdido"
};

const consultaAnteproyectos = () => {
    return supabase
        .from("anteproyectos")
        .select(`
            id,
            nombreEmpresa,
            estado,
            estudiante:estudiantes(id, nombre, usuario:usuarios(sede)),
            encargado:profesores(id, nombre, usuario:usuarios(sede))
        `);
}

class Anteproyecto {
    id;
    nombre;
    /** @type {Estudiante} */
    estudiante;
    /** @type {Profesor} */
    encargado;
    /** @type {Anteproyecto[]} */
    anteproyectosPerdidos = [];

    constructor(id, nombre, estado, estudiante, encargado) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
        this.estudiante = estudiante;
        this.encargado = encargado;
    }

    static from(obj) {
        return new Anteproyecto(
            obj.id,
            obj.nombreEmpresa,
            obj.estado,
            Estudiante.from(obj.estudiante),
            Profesor.from(obj.encargado)
        )
    }

    static async obtenerTodos() {
        const { data } = await consultaAnteproyectos();
        return data.map(ap => Anteproyecto.from(ap));
    }

    static async obtenerAsignables() {
        const { data } = await consultaAnteproyectos()
            .eq("estado", ESTADOS_ANTEPROYECTO.APROBADO)
            .is("idEncargado", null);
        const anteproyectos = data.map(ap => Anteproyecto.from(ap));
        // Se almacenan los proyectos perdidos de cada estudiante
        for(let anteproyecto of anteproyectos) {
            const { data:perdidos } = await consultaAnteproyectos()
                .eq("idEstudiante", anteproyecto.estudiante.id)
                .eq("estado", ESTADOS_ANTEPROYECTO.PERDIDO);
            anteproyecto.anteproyectosPerdidos = perdidos.map(ap => Anteproyecto.from(ap));
        }
        return anteproyectos;
    }
}

export default Anteproyecto;