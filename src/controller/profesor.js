import supabase from "../model/supabase";
import Usuario from "./usuario";

class Profesor extends Usuario {
    nombre;
    cantidadProyectos;
    original = {};

    constructor(id, nombre, cantidadProyectos) {
        super(id, nombre);
        this.cantidadProyectos = cantidadProyectos;
        this.original.cantidadProyectos = cantidadProyectos;
    }

    static async obtenerTodos() {
        const { data } = await supabase
            .from("profesores")
            .select("id, cantidadProyectos, usuario:usuarios(id, nombre)");
        return data.map(p => new Profesor(p.usuario.id, p.usuario.nombre, p.cantidadProyectos));
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