import supabase from "../model/supabase";
import Estudiante from "./estudiante";

class Anteproyecto {
    id;
    nombre;
    estudiante;

    constructor(id, nombre, estudiante) {
        this.id = id;
        this.nombre = nombre;
        this.estudiante = estudiante;
    }

    static async obtenerTodos() {
        const { data } = await supabase
            .from("anteproyectos")
            .select("id, nombre, estudiante:estudiantes(id, usuario:usuarios(nombre))");
        const anteproyectos = data.map(a => new Anteproyecto(
            a.id,
            a.nombre,
            new Estudiante(a.estudiante?.id, a.estudiante?.usuario?.nombre)
        ));
        return anteproyectos;
    }
}

export default Anteproyecto;