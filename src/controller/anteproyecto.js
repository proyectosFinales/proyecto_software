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
            encargado:profesores(id, nombre, cantidadProyectos, usuario:usuarios(sede))
        `);
}

class Anteproyecto {
    id;
    nombreEmpresa;
    /** @type {Estudiante} */
    estudiante;
    /** @type {Profesor} */
    encargado;
    /** @type {Anteproyecto[]} */
    anteproyectosPerdidos = [];

    constructor(id, nombreEmpresa, estado, estudiante, encargado) {
        this.id = id;
        this.nombreEmpresa = nombreEmpresa;
        this.estado = estado;
        this.estudiante = estudiante;
        this.encargado = encargado;
    }

    static from(obj) {
        const anteproyecto = new Anteproyecto(
            obj.id,
            obj.nombreEmpresa,
            obj.estado,
            Estudiante.from(obj.estudiante),
            Profesor.from(obj.encargado)
        )
        return anteproyecto;
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
                .eq("estado", ESTADOS_ANTEPROYECTO.PERDIDO)
                .not("idEncargado", 'is', null); // Se descartan los que no tienen profesor
            anteproyecto.anteproyectosPerdidos = perdidos.map(ap => Anteproyecto.from(ap));
        }
        return anteproyectos;
    }

    async guardarAsignacion() {
        return new Promise(async (resolve, reject) => {
            const { data, error } = await supabase
                .from("anteproyectos")
                .update({idEncargado: this.encargado ? this.encargado.id : null})
                .eq("id", this.id)
                .select();
            if(error) reject();
            else resolve();
        });
    }
}

export default Anteproyecto;