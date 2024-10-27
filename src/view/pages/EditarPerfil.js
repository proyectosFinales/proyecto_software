import { React, useState, useEffect } from "react";
import "../styles/EditarPerfil.css"
import Footer from "../components/Footer"
import { getUserInfo, updateUserInfo } from "../../controller/userInfo";
import { useNavigate } from "react-router-dom";
import HeaderCoordinador from "../components/HeaderCoordinador"
import HeaderProfesor from "../components/HeaderProfesor"
import HeaderEstudiante from "../components/HeaderEstudiante"

const EditarPerfil = () => {

  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const id = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSave = () => {
    try {
      updateUserInfo(userData);
      alert("Se ha modificado la información con éxito.");
      handleCancel();
    } catch (error) {
      alert(error);
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

        if (data.estudiante === null && data.profesor === null) {
          setUserData({
            id: id,
            correo: data.correo,
            contraseña: data.contraseña,
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
        console.error('Error al obtener la información del usuario:', error.message);
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
      {(userData.estudiante === null || userData.profesor === null)  && (alert(""))}
    <div className="center-container">
      <div className="edit-user-container">
        <div className="edit-user-info">
          <h2>Editar Información</h2>
          {(userData.rol === "2" || userData.rol === "3") && (
            <label>
              Nombre
              <input
                type="text"
                name="nombre"
                value={userData.nombre || ""}
                onChange={handleChange}
              />
            </label>
          )}

          {userData.rol === "3" && (
            <label>
              Carnet
              <input
                type="text"
                name="carnet"
                value={userData.carnet || ""}
                onChange={handleChange}
              />
            </label>
          )}

          {userData.rol === "3" && (
            <label>
              Teléfono
              <input
                type="text"
                name="telefono"
                value={userData.telefono || ""}
                onChange={handleChange}
              />
            </label>
          )}

          {(userData.rol === "1" || userData.rol === "2" || userData.rol === "3") && (
            <>
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
                Contraseña
                <input
                  type="text"
                  name="contraseña"
                  value={userData.contraseña}
                  onChange={handleChange}
                />
              </label>
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
