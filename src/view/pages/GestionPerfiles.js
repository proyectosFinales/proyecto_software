import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/GestionPerfiles.css";
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock, FaFileAlt, FaMapMarked } from 'react-icons/fa';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { getAllUsers, gestionUserInfo, delUser, editUserGestion } from "../../controller/userInfo";
import Modal from "../components/Modal";

const GestionPerfiles = () => {
  const [users, setUsers] = useState([]);
  const [editableUser, setEditableUser] = useState({});
  const [checkedUsers, setCheckedUsers] = useState(new Set());
  const [modal, setModal] = useState(false);

  const navigate = useNavigate();

  const handleUserClick = async (id) => {
    try {
      const data = await gestionUserInfo(id);

      setEditableUser({
        id: id,
        correo: data.correo,
        contraseña: data.contraseña,
        rol: data.rol,
        sede: data.sede,
        ...(data.rol === '2' && { nombre: data.profesor.nombre }),
        ...(data.rol === '3' && {
          nombre: data.estudiante.nombre,
          carnet: data.estudiante.carnet,
          telefono: data.estudiante.telefono,
          ...(data.estudiante.estado.length !== 0 && {
            estado: data.estudiante.estado.at(-1).estado,
          }),
          ...(data.estudiante.estado.length === 0 && {
            estado: "-",
          }),
        }),
      });
    } catch (error) {
      alert("El usuario presente no está registrado, por favor eliminelo o bien agreguelo a la plataforma seleccionando la casilla y presionando el botón 'Agregar usuario'.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (userId) => {
    setCheckedUsers((prevState) => {
      const updatedCheckedUsers = new Set(prevState);
      if (updatedCheckedUsers.has(userId)) {
        updatedCheckedUsers.delete(userId);
      } else {
        updatedCheckedUsers.add(userId);
      }
      return updatedCheckedUsers;
    });
  };

  const handleDeleteUsers = async () => {
    try {
      const usersToDelete = new Set(checkedUsers);

      if (editableUser.id) {
        usersToDelete.add(editableUser.id);
      }

      for (const userId of usersToDelete) {
        await delUser(userId);
      }

      const updatedUsers = users.filter((user) => !usersToDelete.has(user.id));

      setUsers(updatedUsers);
      setCheckedUsers(new Set());
      setEditableUser({});
    } catch (error) {
      console.error('Error al eliminar el usuario:', error.message);
    }
  };

  const handleUserEdit = async () => {
    try {
      await editUserGestion(editableUser);
      alert("El usuario ha sido modificado con éxito.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUserAdd = async () => {
    try {
      navigate("/gestion-perfiles/agregar-usuario");
    } catch (error) {
      console.error("Error al editar el usuario: ", error.message);
    }
  };

  const handleNavigate = () => {
    navigate("/menuCoordinador");
  };

  useEffect(() => {
    const getAllUsersInfo = async () => {
      try {
        const data = await getAllUsers();
        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Error al obtener la información del usuario:', error.message);
      }
    };

    getAllUsersInfo();
  }, []);


  return (
    <div className="gestion-container">
      <Header title={"Gestión de perfiles"} />
      <div className="content">
        <button onClick={handleNavigate} className="btn-volver-menu">
          Volver
        </button>
        <div className="gestion-perfiles">
          <div className="users-list">
            <ul>
              {users.length > 0 ? (
                users.map((user, index) => {
                  return (
                    <li
                      key={user.id || index}
                      className={index % 2 === 0 ? "even-row" : "odd-row"}
                    >
                      <span
                        className="user-name"
                        onClick={() => handleUserClick(user.id)}
                      >
                        {user.rol === "2"
                          ? user.profesor.nombre
                          : user.estudiante.nombre || "Usuario no registrado"}
                      </span>
                      <input
                        type="checkbox"
                        className="user-checkbox"
                        checked={checkedUsers.has(user.id)}
                        onChange={() => handleCheckboxChange(user.id)}
                      />
                    </li>
                  );
                })
              ) : (
                <p>No hay usuarios disponibles.</p>
              )}
            </ul>
          </div>

          <div className="info-container">
            <div className="user-info">
              <h2>Información del usuario</h2>
              {editableUser.rol === '2' ? (
                <>
                  <label>
                    Nombre
                    <div className="input-container-gestion">
                    <FaUser className="icon-gestion" />
                      <input
                        type="text"
                        name="nombre"
                        className="input-field-gestion"
                        value={editableUser.nombre || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                  <label>
                    Correo electrónico
                    <div className="input-container-gestion">
                    <FaEnvelope className="icon-gestion" />
                      <input
                        type="email"
                        name="correo"
                        className="input-field-gestion"
                        value={editableUser.correo || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                  <label>
                    Contraseña
                    <div className="input-container-gestion">
                    <FaLock className="icon-registro" />
                      <input
                        type="text"
                        name="contraseña"
                        className="input-field-gestion"
                        value={editableUser.contraseña || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Nombre
                    <div className="input-container-gestion">
                    <FaUser className="icon-gestion" />
                      <input
                        type="text"
                        name="nombre"
                        className="input-field-gestion"
                        value={editableUser.nombre || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                  <label>
                    Carnet
                    <div className="input-container-gestion">
                    <FaIdCard className="icon-gestion" />
                      <input
                        type="text"
                        name="carnet"
                        className="input-field-gestion"
                        value={editableUser.carnet || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                  <label>
                    Correo electrónico
                    <div className="input-container-gestion">
                    <FaEnvelope className="icon-gestion" />
                      <input
                        type="email"
                        name="correo"
                        className="input-field-gestion"
                        value={editableUser.correo || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                  <label>
                    Teléfono
                    <div className="input-container-gestion">
                    <FaPhone className="icon-gestion" />
                      <input
                        type="text"
                        name="telefono"
                        className="input-field-gestion"
                        value={editableUser.telefono || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                  <label>
                    Contraseña
                    <div className="input-container-gestion">
                    <FaLock className="icon-registro" />
                      <input
                        type="text"
                        name="contraseña"
                        className="input-field-gestion"
                        value={editableUser.contraseña || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                  <label>
                    Sede
                    <div className="input-container-gestion">
                    <FaMapMarked className="icon-sede" />
                      <select
                        name="sede"
                        className="sede-dropdown"
                        value={editableUser.sede}
                        onChange={handleInputChange}
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
                  </label>
                  <label>
                    Estado
                    <div className="input-container-gestion">
                    <FaFileAlt className="icon-gestion" />
                      <input
                        type="text"
                        name="estado"
                        className="input-field-gestion"
                        value={editableUser.estado || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </label>
                </>
              )}
            </div>

            <div className="actions">
              <button className="btn-delete" onClick={() => setModal(true)}>Borrar usuario(s)</button>
              <button className="btn-edit" onClick={handleUserEdit}>Editar usuario</button>
              <button className="btn-add-user" onClick={handleUserAdd}>Agregar usuario</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Modal show={modal} onClose={() => setModal(false)} className="modal confirm-delete-modal">
        <h2>¿Deseas eliminar todos los usuarios seleccionados?</h2>
        <p>
          Al confirmar la eliminación, se borrarán tanto el usuario mostrado como los usuarios seleccionados.
          Debe tener en cuenta que una vez que se eliminen, estos NO SE PUEDEN RECUPERAR. Se recomienda
          revisar que los usuarios a eliminar son los deseados antes de proceder.
        </p>
        <p>¿Desea proceder con la eliminación de los usuarios seleccionados?</p>

        <div className="modal-actions">
          <button className="delModalBtn btnCancelar" onClick={() => setModal(false)}>
            Cancelar
          </button>
          <button className="delModalBtn btnConfirmar" onClick={() => {
            handleDeleteUsers();
            setModal(false);
          }}>
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GestionPerfiles;
