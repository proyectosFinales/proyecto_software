import Usuario from "./usuario";

class Estudiante extends Usuario {
    carnet;
    telefono;
    
    constructor(id, nombre, sede, correo, carnet, telefono) {
        super(id, nombre, sede, correo);
        this.carnet = carnet;
        this.telefono = telefono;
    }

    static from(obj) {
        if(!obj) return null;
        return new Estudiante(obj.id, obj.nombre, obj.usuario.sede, obj.usuario.correo, obj.carnet, obj.telefono);
    }
}

export default Estudiante;