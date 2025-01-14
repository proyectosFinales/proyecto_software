class Usuario {
    constructor(id, nombre, sede, correo) {
      this.id = id;
      this.nombre = nombre;
      this.sede = sede;
      this.correo = correo;
    }
  
    static from(obj) {
      if (!obj) return null;
      return new Usuario(
        obj.id,
        obj.nombre,
        obj.sede,
        obj.correo
      );
    }
  }
  
  export default Usuario;