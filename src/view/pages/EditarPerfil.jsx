import { React, useState, useEffect } from "react";
import "../styles/EditarPerfil.css";
import Select from "react-select";
import { 
  FaUser, 
  FaIdCard, 
  FaPhone, 
  FaEnvelope, 
  FaLock, 
  FaMapMarked, 
  FaUsers,    // Para mostrar cantidad de estudiantes (ejemplo)
  FaShieldAlt // Para mostrar rol (ejemplo)
} from 'react-icons/fa';
import Footer from "../components/Footer";
import { getUserInfo, updateUserInfo } from "../../controller/userInfo";
import { useNavigate } from "react-router-dom";
import HeaderCoordinador from "../components/HeaderCoordinador";
import HeaderProfesor from "../components/HeaderProfesor";
import HeaderEstudiante from "../components/HeaderEstudiante";
import { fetchCategorias } from "../../controller/Categoria";

const EditarPerfil = () => {
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const id = sessionStorage.getItem("token");
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      // IMPORTANTE: no modificar el rol en el upsert
      // si quieres evitar que se cambie. 
      // O sea, tu back puede ignorar userData.rol.

      await updateUserInfo({...userData, categoria_id: selectedCategoria.value});
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
        // data vendrá con { 
        //   id, correo, contrasena, rol, sede, telefono, nombre,
        //   Profesor: { profesor_id, cantidad_estudiantes },
        //   Estudiante: { estudiante_id, carnet, asesor, estado }, 
        // }

        // Construimos userData para el front
        // Nota: 'rol' siempre en string para compararlo fácilmente
        const baseData = {
          id: data.id,
          rol: data.rol?.toString(),
          correo: data.correo,
          contrasena: data.contrasena,
          sede: data.sede,
          telefono: data.telefono,
          nombre: data.nombre
        };

        // Si es profesor
        if (data.rol == 2 && data.Profesor) {
          baseData.profesor_id = data.Profesor[0].profesor_id;
          baseData.cantidad_estudiantes = data.Profesor[0].cantidad_estudiantes ?? 0;
          setSelectedCategoria({value: data.Profesor[0].categoria_id, label: data.Profesor[0].Categoria.nombre});
        }

        // Si es estudiante
        if (data.rol == 3 && data.Estudiante) {
          baseData.estudiante_id = data.Estudiante.estudiante_id;
          baseData.carnet = data.Estudiante.carnet || "";
          baseData.asesor = data.Estudiante.asesor || "";
          baseData.estado = data.Estudiante.estado || "";
        }

        setUserData(baseData);
      } catch (error) {
        alert(error.message);
      }
    };
    
    if (id) {
      obtenerInfoUsuario();
    }
  }, [id]);

  useEffect(() => {
    fetchCategorias().then(data => {
      const options = data.map(categoria => ({
        value: categoria.categoria_id,
        label: categoria.nombre
      }));
      setCategorias([{value: '', label: "-- Asigna una categoria --"}, ...options]);
    }).catch(console.error);
  }, []);

  // Pequeña función auxiliar: 
  // Mapea rol numérico → nombre textual
  const getRolLabel = (rolNum) => {
    switch (rolNum) {
      case "1": return "Coordinador";
      case "2": return "Profesor";
      case "3": return "Estudiante";
      default: return "Desconocido";
    }
  };

  return (
    <>
      {userData.rol === "1" && <HeaderCoordinador title="Editar Perfil" />}
      {userData.rol === "2" && <HeaderProfesor title="Editar Perfil" />}
      {userData.rol === "3" && <HeaderEstudiante title="Editar Perfil" />}

      <div className="center-container">
        <div className="edit-user-container">
          <div className="edit-user-info">
            <h2>Editar Información</h2>

            {/* Rol (readOnly) */}
            <label>
              Rol (no modificable)
              <div className="input-container-editar">
                <FaShieldAlt className="icon-editar" />
                <input
                  type="text"
                  name="rol"
                  className="input-field-editar"
                  value={getRolLabel(userData.rol) || ""}
                  readOnly
                />
              </div>
            </label>

            {/* Nombre (todos los roles lo pueden editar, excepto si no quieres...) */}
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

            {/* Para todos: Correo electrónico */}
            <label>
              Correo electrónico
              <div className="input-container-editar">
                <FaEnvelope className="icon-editar" />
                <input
                  type="email"
                  name="correo"
                  className="input-field-editar"
                  value={userData.correo || ""}
                  onChange={handleChange}
                />
              </div>
            </label>

            {/* Contraseña */}
            <label>
              Contraseña
              <div className="input-container-editar">
                <FaLock className="icon-editar" />
                <input
                  type="text"
                  name="contrasena"
                  className="input-field-editar"
                  value={userData.contrasena || ""}
                  onChange={handleChange}
                />
              </div>
            </label>

            {/* Sede */}
            <label>Sede</label>
            <div className="input-container-editar">
              <FaMapMarked className="icon-sede" />
              <select
                name="sede"
                className="sede-dropdown"
                value={userData.sede || ""}
                onChange={handleChange}
              >
                <option value="">Seleccione una sede</option>
                <option value="Central Cartago">Central Cartago</option>
                <option value="Local San José">Local San José</option>
                <option value="Local San Carlos">Local San Carlos</option>
                <option value="Limón">Centro Académico de Limón</option>
                <option value="Alajuela">Centro Académico de Alajuela</option>
              </select>
            </div>

            {/* Teléfono */}
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

            {/* Si es PROFESOR (rol=2): mostrar cantidad_estudiantes en modo readOnly */}
            {userData.rol === "2" && (
              <>
                <label>
                  Cantidad de estudiantes asignados
                  <div className="input-container-editar">
                    <FaUsers className="icon-editar" />
                    <input
                      type="number"
                      name="cantidad_estudiantes"
                      className="input-field-editar"
                      value={userData.cantidad_estudiantes || 0}
                      readOnly
                    />
                  </div>
                </label>
                <label>
                  Categoría
                  <Select
                    value={selectedCategoria}
                    onChange={e => setSelectedCategoria(e)}
                    options={categorias}
                    placeholder="Seleccione una categoría"
                    className="mt-2"
                  />
                </label>
              </>
            )}

            {/* Si es ESTUDIANTE (rol=3): mostrar carnet, estado, asesor, etc. */}
            {userData.rol === "3" && (
              <>
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

                {/* Asesor (si quieres que sea editable o no) */}
                <label>
                  Asesor (no modificable)
                  <div className="input-container-editar">
                    <FaUser className="icon-editar" />
                    <input
                      type="text"
                      name="asesor"
                      className="input-field-editar"
                      value={userData.asesor || ""}
                      readOnly
                    />
                  </div>
                </label>

                <label>
                  Estado (no modificable)
                  <div className="input-container-editar">
                    <FaIdCard className="icon-editar" />
                    <input
                      type="text"
                      name="estado"
                      className="input-field-editar"
                      value={userData.estado || ""}
                      readOnly
                    />
                  </div>
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
