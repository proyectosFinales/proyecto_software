// ==================== GestionPerfiles.jsx ====================

import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock, FaFileAlt, FaMapMarked, FaSearch } from 'react-icons/fa';
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
  const [filter, setFilter] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

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
        rol: data.rol.toString(),  // Aseguramos string
        sede: data.sede,
        nombre: data.nombre,
        telefono: data.telefono,
        ...(data.rol == 3 && {
          carnet: data.estudiante[0].carnet,
          estado: data.estudiante[0].estado
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
        console.log('Eliminando usuario:', userId);
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

  useEffect(() => {
    setFilteredUsers(users.filter(user => {
      if (filter === 'profesores') return user.rol === 2;
      if (filter === 'estudiantes') return user.rol === 3;
      return true;
    }).filter(user => 
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.estudiante?.[0].carnet && user.estudiante?.[0].carnet.toLowerCase().includes(searchTerm.toLowerCase()))
    ));

  }, [users, filter, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="Gestión de Perfiles" />

      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <button
            onClick={handleNavigate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver
          </button>
          {/* Filter & search */}
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <select
              value={filter}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded px-3 py-1"
            >
              <option value="">Todos</option>
              <option value="profesor">Profesores</option>
              <option value="estudiante">Estudiantes</option>
            </select>

            <div className="relative">
              <FaSearch className="absolute left-2 top-2 text-gray-400" />
              <input
                className="pl-8 pr-3 py-1 border border-gray-300 rounded"
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        {/* User list */}
        <div className="overflow-x-auto border border-gray-300 rounded shadow-sm">
          <table className="table-auto w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Rol</th>
                <th className="px-4 py-2">Correo</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-none">
                  <td className="px-4 py-2">{user.id}</td>
                  <td className="px-4 py-2">{user.nombre}</td>
                  <td className="px-4 py-2">{user.rol}</td>
                  <td className="px-4 py-2">{user.correo}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleUserClick(user.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleCheckboxChange(user.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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

      <Footer />
    </div>
  );
};

export default GestionPerfiles;