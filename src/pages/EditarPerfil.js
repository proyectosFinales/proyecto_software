import { React, useState } from "react";
import "../styles/EditarPerfil.css"
import Footer from "./components/Footer"

const EditarPerfil = () => {
  const [userData, setUserData] = useState({
    nombre: "Ana Catalina Siles",
    carne: "2019527194",
    correo: "anacatsiles@itcr.ac.cr",
    telefono: "84193253",
    estado: "Aprobado",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSave = () => {
    console.log("Información guardada:", userData);
  };

  const handleCancel = () => {
    console.log("Edición cancelada");
  };

  return (
    <div className="center-container">
      <div className="edit-user-container">
        <div className="edit-user-info">
          <h2>Modificar Información</h2>
          <label>
            Nombre
            <input
              type="text"
              name="nombre"
              value={userData.nombre}
              onChange={handleChange}
            />
          </label>
          <label>
            Carné
            <input
              type="text"
              name="carne"
              value={userData.carne}
              onChange={handleChange}
            />
          </label>
          <label>
            Correo electrónico
            <input
              type="email"
              name="correo"
              value={userData.correo}
              onChange={handleChange}
            />
          </label>
          <label>
            Teléfono
            <input
              type="text"
              name="telefono"
              value={userData.telefono}
              onChange={handleChange}
            />
          </label>
          <label>
            Estado
            <input
              type="text"
              name="estado"
              value={userData.estado}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="edit-actions">
          <button className="btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSave}>
            Editar información
          </button>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default EditarPerfil;
