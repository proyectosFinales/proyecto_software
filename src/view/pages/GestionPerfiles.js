import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/GestionPerfiles.css";
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock, FaFileAlt, FaMapMarked } from 'react-icons/fa';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { getAllUsers, gestionUserInfo, delUser, editUserGestion } from "../../controller/userInfo";
import Modal from "../components/Modal";

/**
 * GestionPerfiles.jsx
 * Permite al coordinador listar usuarios (estudiantes/profesores),
 * ver su información (rol, correo, etc.) y editarlos o eliminarlos.
 */
const GestionPerfiles = () => {
  const [users, setUsers] = useState([]);
  const [editableUser, setEditableUser] = useState({});
  const [checkedUsers, setCheckedUsers] = useState(new Set());
  const [modal, setModal] = useState(false);

  const navigate = useNavigate();

  /**
   * Al dar clic en un usuario de la lista, se carga su info detallada
   * usando la función gestionUserInfo(id).
   */
  const handleUserClick = async (id) => {
    try {
      const data = await gestionUserInfo(id); 
      // data: { id, correo, contrasena, rol, sede, profesor:{...}, estudiante:{...} }

      setEditableUser({
        id: id,
        correo: data.correo,
        contraseña: data.contrasena,
        rol: data.rol.toString(),  // Aseguramos string
        sede: data.sede,
        nombre: data.nombre,
        telefono: data.telefono,
        ...(data.rol == 3 && {
          carnet: data.estudiante[0].carnet
        })
      });
    } catch (error) {
      alert(
        "El usuario presente no está registrado correctamente. " +
        "Por favor, elimínelo del sistema (marque su casilla y presione 'Eliminar usuario(s)')."
      );
    }
  };

  /**
   * Manejador para modificar 'editableUser'
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  /**
   * Marcar/desmarcar un usuario en la lista para su eliminación
   */
  const handleCheckboxChange = (userId) => {
    setCheckedUsers((prevState) => {
      const updated = new Set(prevState);
      if (updated.has(userId)) {
        updated.delete(userId);
      } else {
        updated.add(userId);
      }
      return updated;
    });
  };

  /**
   * Eliminar usuarios seleccionados en la lista y/o el usuario en edición
   */
  const handleDeleteUsers = async () => {
    try {
      const usersToDelete = new Set(checkedUsers);

      // Si tenemos un usuario cargado en edición, también lo incluimos
      if (editableUser.id) {
        usersToDelete.add(editableUser.id);
      }

      // Eliminar cada uno
      for (const userId of usersToDelete) {
        await delUser(userId);
      }

      // Actualizar la lista local
      const updatedUsers = users.filter((u) => !usersToDelete.has(u.id));
      setUsers(updatedUsers);
      setCheckedUsers(new Set());
      setEditableUser({});
    } catch (error) {
      console.error('Error al eliminar usuario(s):', error.message);
      alert("Hubo un error al eliminar los usuarios.");
    }
  };

  /**
   * Editar (guardar) los cambios hechos a 'editableUser'
   */
  const handleUserEdit = async () => {
    try {
      await editUserGestion(editableUser);
      alert("El usuario se modificó con éxito.");
    } catch (error) {
      alert(error.message);
    }
  };

  /**
   * Navegar a la pantalla para agregar un nuevo usuario
   */
  const handleUserAdd = () => {
    navigate("/gestion-perfiles/agregar-usuario");
  };

  /**
   * Volver a menú coordinador
   */
  const handleNavigate = () => {
    navigate("/menuCoordinador");
  };

  /**
   * Al montar, obtener la lista de usuarios
   */
  useEffect(() => {
    const getAllUsersInfo = async () => {
      try {
        const data = await getAllUsers();
        if (data) setUsers(data);
      } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
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
          {/* Lista de usuarios */}
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
                        {user.nombre}
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

          {/* Información del usuario editable */}
          <div className="info-container">
            <div className="user-info">
              <h2>Información del usuario</h2>

              {/* Profesor (rol = 2) */}
              {editableUser.rol === '2' && (
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

                  <label>
                    Sede
                    <div className="input-container-gestion">
                      <FaMapMarked className="icon-sede" />
                      <select
                        name="sede"
                        className="sede-dropdown"
                        value={editableUser.sede || ''}
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
                </>
              )}

              {/* Estudiante (rol = 3) */}
              {editableUser.rol === '3' && (
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
                        value={editableUser.sede || ''}
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

              {/* Rol 1 (Coordinador) no tiene secciones en el snippet,
                  pero si llegase un user con rol=1, no habría 'profesor' ni 'estudiante' 
                  e igual se podría mostrar correo/sede/contraseña. */}

            </div>
            <div className="actions">
              <button className="btn-delete" onClick={() => setModal(true)}>
                Borrar usuario(s)
              </button>
              <button className="btn-edit" onClick={handleUserEdit}>
                Editar usuario
              </button>
              <button className="btn-add-user" onClick={handleUserAdd}>
                Agregar usuario
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <Modal
        show={modal}
        onClose={() => setModal(false)}
        className="modal confirm-delete-modal"
      >
        <h2>¿Deseas eliminar todos los usuarios seleccionados?</h2>
        <p>
          Al confirmar, se borrarán tanto el usuario mostrado como los usuarios 
          seleccionados. Esta acción es irreversible.
        </p>
        <p>¿Desea proceder con la eliminación de los usuarios seleccionados?</p>

        <div className="modal-actions">
          <button className="delModalBtn btnCancelar" onClick={() => setModal(false)}>
            Cancelar
          </button>
          <button
            className="delModalBtn btnConfirmar"
            onClick={() => {
              handleDeleteUsers();
              setModal(false);
            }}
          >
            Confirmar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GestionPerfiles;
