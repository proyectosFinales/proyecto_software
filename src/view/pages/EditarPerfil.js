import { React, useState, useEffect } from "react";
import "../styles/EditarPerfil.css"
import Footer from "../components/Footer"
import { getUserInfo, updateUserInfo } from "../../controller/userInfo";
import { useNavigate } from "react-router-dom";

var id = "1"

const EditarPerfil = () => {

  const [userData, setUserData] = useState({
    id: 0,
    nombre: "",
    carne: 0,
    correo: "",
    telefono: 0,
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSave = () => {
    updateUserInfo(userData);
    alert("Se ha modificado la información con éxito.");
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/")
  };

  useEffect(() => {
    const obtenerInfoUsuario = async () => {
      try {
        const data = await getUserInfo(id);
        setUserData({
          id: data.id,
          nombre: data.Nombre,
          carne: data.Carné,
          correo: data.Correo,
          telefono: data.Telefono,
          password: data.Contraseña,
        });
      } catch (error) {
        console.error('Error al obtener la información del usuario:', error.message);
      }
    };

    if (id) {
      obtenerInfoUsuario();
    }
  }, [id]);

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
            Contraseña
            <input
              type="text"
              name="password"
              value={userData.password}
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
      <Footer />
    </div>
  );
};

export default EditarPerfil;
