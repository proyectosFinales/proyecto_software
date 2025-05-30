import { React, useState, useEffect } from "react";
import "../styles/EditarPerfil.css"
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock, FaMapMarked } from 'react-icons/fa';
import Footer from "../components/Footer"
import { getUserInfo, updateUserInfo } from "../../controller/userInfo";
import { useNavigate } from "react-router-dom";
import HeaderCoordinador from "../components/HeaderCoordinador"
import HeaderProfesor from "../components/HeaderProfesor"
import HeaderEstudiante from "../components/HeaderEstudiante"

const EditarPerfil = () => {

  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const id = sessionStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    
    try {
      await updateUserInfo(userData);
      alert("Usuario modificado con éxito.");
      handleCancel();
    } catch (error) {
      alert(error.message);
    }

  };

  const handleCancel = () => {
    if (userData.rol === "1") {
      navigate("/menuCoordinador");
    } else if (userData.rol === "2") {
      navigate("/menuProfesor");
    } else if (userData.rol === "3") {
      navigate("/menuEstudiante");
    }
  };

  useEffect(() => {
    const obtenerInfoUsuario = async () => {
      try {
        const data = await getUserInfo(id);

        if (data.estudiante === null && data.profesor === null && data.rol !== "1") {
          setUserData({
            id: id,
            correo: data.correo,
            contraseña: data.contraseña,
            sede: data.sede,
            rol: data.rol,
            ...(data.rol === "2" && {
              profesor: {
                nombre: ""
              }
            }),
            ...(data.rol === "3" && {
              estudiante: {
                nombre: "",
                carnet: "",
                telefono: ""
              }
            })
          });
          alert("Este usuario tiene información incompleta. Por favor actualice su información en las entradas correspondientes.");
        } else {
          setUserData({
            id: id,
            correo: data.correo,
            contraseña: data.contraseña,
            sede: data.sede,
            rol: data.rol,
            ...(data.rol === "2" && {
              nombre: data.profesor.nombre || ""
            }),
            ...(data.rol === "3" && {
              nombre: data.estudiante.nombre || "",
              carnet: data.estudiante.carnet || "",
              telefono: data.estudiante.telefono || ""
            })
          });
        }
      } catch (error) {
        alert(error.message);
      }
    };

    if (id) {
      obtenerInfoUsuario();
    }
  }, []);

  return (
    <>
      {userData.rol === "1" && <HeaderCoordinador title={"Editar Perfil"} />}
      {userData.rol === "2" && <HeaderProfesor title={"Editar Perfil"} />}
      {userData.rol === "3" && <HeaderEstudiante title={"Editar Perfil"} />}
      {(userData.estudiante === null || userData.profesor === null) && (alert(""))}
      <div className="center-container">
        <div className="edit-user-container">
          <div className="edit-user-info">
            <h2>Editar Información</h2>
            {(userData.rol === "2" || userData.rol === "3") && (
              <label>
                Nombre
                <div className="input-container-editar">
                <FaUser className="icon-editar" />
                <input
                  type="text"
                  name="nombre"
                  className="input-field-editar"
                  value={userData.nombre || ""}
                  onChange={handleChange}
                />
                </div>
              </label>
            )}

            {userData.rol === "3" && (
              <label>
                Carnet
                <div className="input-container-editar">
                <FaIdCard className="icon-editar" />
                <input
                  type="text"
                  name="carnet"
                  className="input-field-editar"
                  value={userData.carnet || ""}
                  onChange={handleChange}
                />
                </div>
              </label>
            )}

            {userData.rol === "3" && (
              <label>
                Teléfono
                <div className="input-container-editar">
                <FaPhone className="icon-editar" />
                <input
                  type="text"
                  name="telefono"
                  className="input-field-editar"
                  value={userData.telefono || ""}
                  onChange={handleChange}
                />
                </div>
              </label>
            )}

            {(userData.rol === "1" || userData.rol === "2" || userData.rol === "3") && (
              <>
                <label>
                  Correo electrónico
                  <div className="input-container-editar">
                  <FaEnvelope className="icon-editar" />
                  <input
                    type="email"
                    name="correo"
                    className="input-field-editar"
                    value={userData.correo}
                    onChange={handleChange}
                  />
                  </div>
                </label>
                <label>
                  Contraseña
                  <div className="input-container-editar">
                  <FaLock className="icon-editar" />
                  <input
                    type="text"
                    name="contraseña"
                    className="input-field-editar"
                    value={userData.contraseña}
                    onChange={handleChange}
                  />
                  </div>
                </label>
                <label>Seleccione una sede:</label>
                <div className="input-container-editar">
                <FaMapMarked className="icon-sede" />
                <select
                  name="sede"
                  className="sede-dropdown"
                  value={userData.sede}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una sede</option>
                  <option value="Central Cartago">Central Cartago</option>
                  <option value="Local San José">Local San José</option>
                  <option value="Local San Carlos">Local San Carlos</option>
                  <option value="Limón">Centro Académico de Limón</option>
                  <option value="Alajuela">Centro Académico de Alajuela</option>
                </select>
                </div>
              </>
            )}
          </div>

          <div className="edit-actions">
            <button className="btn-cancel" onClick={handleCancel}>
              Cancelar
            </button>
            <button className="btn-save" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default EditarPerfil;
