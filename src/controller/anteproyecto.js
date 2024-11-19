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

    constructor(id, nombreEmpresa, estado, tipoEmpresa, actividadEmpresa, distritoEmpresa, cantonEmpresa, provinciaEmpresa, nombreAsesor, puestoAsesor, telefonoContacto, correoContacto, nombreHR, telefonoHR, correoHR, contexto, justificacion, sintomas, impacto, nombreDepartamento, tipoProyecto, observaciones, estudiante, encargado) {
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
        const anteproyecto = new Anteproyecto(
            obj.id,
            obj.nombreEmpresa,
            obj.estado,
            obj.tipoEmpresa,
            obj.actividadEmpresa,
            obj.distritoEmpresa,
            obj.cantonEmpresa,
            obj.provinciaEmpresa,
            obj.nombreAsesor,
            obj.puestoAsesor,
            obj.telefonoContacto,
            obj.correoContacto,
            obj.nombreHR,
            obj.telefonoHR,
            obj.correoHR,
            obj.contexto,
            obj.justificacion,
            obj.sintomas,
            obj.impacto,
            obj.nombreDepartamento,
            obj.tipoProyecto,
            obj.observaciones,
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