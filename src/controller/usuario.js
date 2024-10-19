class Usuario {
    constructor(id, nombre, sede){
        this.id = id;
        this.nombre = nombre;
        this.sede = sede;
    }

    static from (obj) {
        if(obj == null) return null;
        return new Usuario(obj.id, obj.nombre, obj.usuario.sede);
    }
}

export default Usuario;