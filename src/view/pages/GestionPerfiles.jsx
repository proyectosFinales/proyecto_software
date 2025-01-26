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
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editableUser, setEditableUser] = useState({});
  const [checkedUsers, setCheckedUsers] = useState(new Set());
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  /**
   * Al dar clic en un usuario de la lista, se carga su info detallada
   */
  const handleUserClick = async (id) => {
    try {
      const data = await gestionUserInfo(id);
      // data: { id, correo, contrasena, rol, sede, nombre, telefono, estudiante: [...] }

      setEditableUser({
        id: data.id,
        correo: data.correo,
        rol: data.rol.toString(),
        sede: data.sede,
        nombre: data.nombre,
        telefono: data.telefono,
        // Sólo si es estudiante (rol=3) y viene data.estudiante[] con algo
        ...(data.rol === 3 && data.estudiante && data.estudiante.length > 0 && {
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
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Marcar/desmarcar un usuario en la lista para su eliminación
   */
  const handleCheckboxChange = (userId) => {
    setCheckedUsers((prev) => {
      const updated = new Set(prev);
      if (updated.has(userId)) {
        updated.delete(userId);
      } else {
        updated.add(userId);
      }
      return updated;
    });
  };

  /**
   * Eliminar usuarios seleccionados y/o el usuario en edición
   */
  const handleDeleteUsers = async () => {
    try {
      const usersToDelete = new Set(checkedUsers);
      // Incluimos también el usuario editable actual
      if (editableUser.id) {
        usersToDelete.add(editableUser.id);
      }
      for (const userId of usersToDelete) {
        await delUser(userId);
      }
      const updatedUsers = users.filter((u) => !usersToDelete.has(u.id));
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setCheckedUsers(new Set());
      setEditableUser({});
    } catch (error) {
      console.error('Error al eliminar usuario(s):', error.message);
      alert("Hubo un error al eliminar los usuarios.");
    }
  };

  /**
   * Editar (guardar) cambios en 'editableUser'
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
   * Manejador de filtros
   */
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  /**
   * Manejador de búsqueda
   */
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  /**
   * Al montar, obtener la lista de usuarios
   */
  useEffect(() => {
    const getAllUsersInfo = async () => {
      try {
        const response = await getAllUsers();
        if (response) {
          setUsers(response);
          setFilteredUsers(response);
        }
      } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
      }
    };
    getAllUsersInfo();
  }, []);

  /**
   * Filtrar + búsqueda
   */
  useEffect(() => {
    let temp = [...users];

    // Filtro por rol (profesores=2, estudiantes=3)
    if (filter === 'profesores') {
      temp = temp.filter((u) => u.rol === 2);
    } else if (filter === 'estudiantes') {
      temp = temp.filter((u) => u.rol === 3);
    }

    // Búsqueda por nombre, correo o carnet
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      temp = temp.filter((u) => {
        const matchesName = u.nombre.toLowerCase().includes(lowerSearch);
        const matchesEmail = u.correo.toLowerCase().includes(lowerSearch);
        const hasCarnet = u.estudiante?.[0]?.carnet?.toLowerCase()?.includes(lowerSearch);
        return matchesName || matchesEmail || hasCarnet;
      });
    }

    setFilteredUsers(temp);
  }, [filter, searchTerm, users]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Gestión de Perfiles" />

      <main className="flex-grow p-6 pb-28">
        {/* Top Controls: Volver, Filtro, Búsqueda */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <button
            onClick={handleNavigate}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 w-full md:w-auto"
          >
            Volver
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <select
              value={filter}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded bg-white w-full sm:w-auto"
            >
              <option value="">Todos</option>
              <option value="profesores">Profesores</option>
              <option value="estudiantes">Estudiantes</option>
            </select>

            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="border rounded pl-10 pr-3 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main content: user list & user details */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Lista de usuarios */}
          <div className="md:w-1/3 bg-white p-4 rounded shadow-md">
            <h3 className="text-lg font-bold mb-4">Lista de Usuarios</h3>
            {filteredUsers.length > 0 ? (
              <ul className="space-y-2">
                {filteredUsers.map((user, index) => (
                  <li
                    key={user.id || index}
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <span>{user.nombre}</span>
                    <input
                      type="checkbox"
                      checked={checkedUsers.has(user.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(user.id);
                      }}
                      className="h-4 w-4"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No hay usuarios disponibles.</p>
            )}
          </div>

          {/* Información del usuario editable */}
          <div className="md:w-2/3 bg-white p-4 rounded shadow-md">
            <h3 className="text-lg font-bold mb-4">Información del usuario</h3>

            {/* Profesor (rol=2) */}
            {editableUser.rol === '2' && (
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  Nombre:
                  <div className="relative mt-1">
                    <FaUser className="absolute top-2.5 left-2 text-gray-400" />
                    <input
                      type="text"
                      name="nombre"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.nombre || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </label>

                <label className="block">
                  Correo electrónico:
                  <div className="relative mt-1">
                    <FaEnvelope className="absolute top-2.5 left-2 text-gray-400" />
                    <input
                      type="email"
                      name="correo"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.correo || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </label>

                <label className="block">
                  Teléfono:
                  <div className="relative mt-1">
                    <FaPhone className="absolute top-2.5 left-2 text-gray-400" />
                    <input
                      type="text"
                      name="telefono"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.telefono || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </label>

                <label className="block">
                  Sede:
                  <div className="relative mt-1">
                    <FaMapMarked className="absolute top-2.5 left-2 text-gray-400" />
                    <select
                      name="sede"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.sede || ''}
                      onChange={handleInputChange}
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
              </div>
            )}

            {/* Estudiante (rol=3) */}
            {editableUser.rol === '3' && (
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  Nombre:
                  <div className="relative mt-1">
                    <FaUser className="absolute top-2.5 left-2 text-gray-400" />
                    <input
                      type="text"
                      name="nombre"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.nombre || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </label>

                <label className="block">
                  Carnet:
                  <div className="relative mt-1">
                    <FaIdCard className="absolute top-2.5 left-2 text-gray-400" />
                    <input
                      type="text"
                      name="carnet"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.carnet || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </label>

                <label className="block">
                  Correo electrónico:
                  <div className="relative mt-1">
                    <FaEnvelope className="absolute top-2.5 left-2 text-gray-400" />
                    <input
                      type="email"
                      name="correo"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.correo || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </label>

                <label className="block">
                  Teléfono:
                  <div className="relative mt-1">
                    <FaPhone className="absolute top-2.5 left-2 text-gray-400" />
                    <input
                      type="text"
                      name="telefono"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.telefono || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </label>

                <label className="block">
                  Sede:
                  <div className="relative mt-1">
                    <FaMapMarked className="absolute top-2.5 left-2 text-gray-400" />
                    <select
                      name="sede"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.sede || ''}
                      onChange={handleInputChange}
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

                <label className="block">
                  Estado:
                  <div className="relative mt-1">
                    <FaFileAlt className="absolute top-2.5 left-2 text-gray-400" />
                    <select
                      name="estado"
                      className="pl-8 pr-3 py-2 border rounded w-full focus:outline-none"
                      value={editableUser.estado || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccione un estado</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="defensa">Defensa</option>
                      <option value="en progreso">En progreso</option>
                      <option value="reprobado">Reprobado</option>
                      <option value="retirado">Retirado</option>
                    </select>
                  </div>
                </label>
              </div>
            )}

            {/* Botones de acción */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => setModal(true)}
              >
                Borrar usuario(s)
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleUserEdit}
              >
                Editar usuario
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleUserAdd}
              >
                Agregar usuario
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal para confirmación de eliminación */}
      <Modal
        show={modal}
        onClose={() => setModal(false)}
      >
        <div className="p-4">
          <h2 className="text-lg font-bold mb-2">
            ¿Deseas eliminar todos los usuarios seleccionados?
          </h2>
          <p className="mb-4 text-sm">
            Al confirmar, se borrarán tanto el usuario mostrado 
            como los usuarios seleccionados. Esta acción es irreversible.
          </p>
          <p className="mb-6 text-sm">
            ¿Desea proceder con la eliminación de los usuarios seleccionados?
          </p>

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => setModal(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => {
                handleDeleteUsers();
                setModal(false);
              }}
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionPerfiles;