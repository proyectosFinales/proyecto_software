import supabase from "../model/supabase";
import Usuario from "./usuario";

class Profesor extends Usuario {
    nombre;
    cantidadProyectos;
    original = {};

    constructor(id, nombre, sede, cantidadProyectos) {
        super(id, nombre, sede);
        this.cantidadProyectos = cantidadProyectos;
        this.original.cantidadProyectos = cantidadProyectos;
    }

    static async obtenerTodos() {
        const { data } = await supabase
            .from("profesores")
            .select("id, nombre, cantidadProyectos, usuario:usuarios(sede)");
        return data.map(p => new Profesor(p.id, p.nombre, p.usuario.sede, p.cantidadProyectos));
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