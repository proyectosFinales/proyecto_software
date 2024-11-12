import supabase from "../model/supabase";
import Anteproyecto from "./anteproyecto";
import Usuario from "./usuario";

class Profesor extends Usuario {
    nombre;
    cantidadProyectos;
    /** @type {Anteproyecto[]} */
    anteproyectos = [];
    original = {};

    constructor(id, nombre, sede, cantidadProyectos, anteproyectos) {
        super(id, nombre, sede);
        this.cantidadProyectos = cantidadProyectos;
        this.anteproyectos = anteproyectos;
        this.original.cantidadProyectos = cantidadProyectos;
    }

    static from(obj) {
        if(!(obj ?? false)) return null;
        return new Profesor(
            obj.id, obj.nombre, obj.usuario.sede, obj.cantidadProyectos,
            obj.anteproyectos ? obj.anteproyectos.map(ap => Anteproyecto.from(ap)) : []
        );
    }

    static async fromID(id) {
        const { data } = await supabase
            .from("profesores")
            .select(`
                id, nombre, cantidadProyectos,
                usuario:usuarios(sede),
                anteproyectos(
                    id, nombreEmpresa, estado, tipoEmpresa, actividadEmpresa, distritoEmpresa, cantonEmpresa,
                    provinciaEmpresa, nombreAsesor, puestoAsesor, telefonoContacto, correoContacto, nombreHR,
                    telefonoHR, correoHR, contexto, justificacion, sintomas, impacto, nombreDepartamento,
                    tipoProyecto, observaciones,
                    estudiante:estudiantes(id, nombre, usuario:usuarios(sede, correo), carnet, telefono)
                )
            `)
            .eq("id", id);
        return Profesor.from(data[0]);
    }

    static async obtenerTodos() {
        const { data } = await supabase
            .from("profesores")
            .select("id, nombre, cantidadProyectos, usuario:usuarios(sede)");
        return data.map(p => new Profesor(p.id, p.nombre, p.usuario.sede, p.cantidadProyectos));
    }

    static async obtenerEncargados() {
        const { data } = await supabase
            .from("profesores")
            .select(`
                id, nombre, cantidadProyectos,
                usuario:usuarios(sede),
                anteproyectos(
                    id, nombreEmpresa,
                    estudiante:estudiantes(id, nombre, usuario:usuarios(sede, correo), carnet, telefono)
                )
            `);
        return data.map(p => Profesor.from(p));
    }

    async actualizarCantidadProyectos() {
        if(this.original.cantidadProyectos !== this.cantidadProyectos) {
            const { error } = await supabase
                .from("profesores")
                .update({ cantidadProyectos: this.cantidadProyectos })
                .eq("id", this.id);
            if(error) return Promise.reject(error.message);
        }
        return Promise.resolve();
    }
}

export default Profesor;