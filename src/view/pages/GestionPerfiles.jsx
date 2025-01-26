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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Gestión de perfiles" />
      
      <main className="flex-grow p-4">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <button 
            onClick={handleNavigate}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors w-full md:w-auto"
          >
            Volver
          </button>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <select 
              value={filter} 
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded bg-white"
            >
              <option value="">Todos</option>
              <option value="profesores">Profesores</option>
              <option value="estudiantes">Estudiantes</option>
            </select>

            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border rounded pr-10"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Lista de Usuarios</h2>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredUsers.length > 0 ? (
                <ul className="divide-y">
                  {filteredUsers.map((user, index) => (
                    <li 
                      key={user.id || index}
                      className="flex items-center justify-between py-2 hover:bg-gray-50"
                    >
                      <button
                        className="flex-grow text-left px-2 py-1 hover:text-blue-600"
                        onClick={() => handleUserClick(user.id)}
                      >
                        {user.nombre}
                      </button>
                      <input
                        type="checkbox"
                        className="h-5 w-5 text-blue-600 rounded border-gray-300"
                        checked={checkedUsers.has(user.id)}
                        onChange={() => handleCheckboxChange(user.id)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No hay usuarios disponibles.</p>
              )}
            </div>
          </div>

          {/* User Info Form */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Información del Usuario</h2>
            
            <div className="space-y-4">
              {/* Render form fields based on role */}
              {editableUser.rol === '2' && (
                // Professor fields
                <>
                  <FormField
                    label="Nombre"
                    icon={<FaUser className="text-gray-400" />}
                    name="nombre"
                    value={editableUser.nombre || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Correo electrónico"
                    icon={<FaEnvelope className="text-gray-400" />}
                    name="correo"
                    type="email"
                    value={editableUser.correo || ''}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Sede"
                    icon={<FaMapMarked className="text-gray-400" />}
                    name="sede"
                    type="select"
                    value={editableUser.sede || ''}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Seleccione una sede" },
                      { value: "Central Cartago", label: "Central Cartago" },
                      { value: "Local San José", label: "Local San José" },
                      { value: "Local San Carlos", label: "Local San Carlos" },
                      { value: "Limón", label: "Centro Académico de Limón" },
                      { value: "Alajuela", label: "Centro Académico de Alajuela" }
                    ]}
                  />
                </>
              )}

              {editableUser.rol === '3' && (
                // Student fields
                <>
                  {/* ... Similar FormField components for student fields ... */}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Borrar usuario(s)
              </button>
              <button
                onClick={handleUserEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Editar usuario
              </button>
              <button
                onClick={handleUserAdd}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Agregar usuario
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      <Modal show={modal} onClose={() => setModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
          <p className="mb-4">
            Al confirmar, se borrarán tanto el usuario mostrado como los usuarios
            seleccionados. Esta acción es irreversible.
          </p>
          <div className="flex justify-end gap-4">
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

// Helper component for form fields
const FormField = ({ label, icon, name, type = "text", value, onChange, options }) => {
  return (
    <label className="block">
      <span className="text-gray-700">{label}</span>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        {type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>
    </label>
  );
};

export default GestionPerfiles;