import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/GestionPerfiles.css";
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador'
import { getAllUsers, gestionUserInfo } from "../../controller/userInfo";

const GestionPerfiles = () => {
  const [users, setUsers] = useState([]);
  const [editableUser, setEditableUser] = useState({});
  const [checkedUsers, setCheckedUsers] = useState(new Set());

  const navigate = useNavigate();

  const handleUserClick = async (id) => {
    try {
      const data = await gestionUserInfo(id);

      setEditableUser({
        correo: data.correo,
        rol: data.rol,
        ...(data.rol === '2' && { nombre: data.profesor.nombre }),
        ...(data.rol === '3' && { 
          nombre: data.estudiante.nombre,
          carnet: data.estudiante.carnet,
          telefono: data.estudiante.telefono,
          estado: data.estudiante.estado,
        })
      });

    } catch (error) {
      console.error('Error al obtener la información del usuario:', error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (userId) => {
    setCheckedUsers(prevState => {
      const updatedCheckedUsers = new Set(prevState);
      if (updatedCheckedUsers.has(userId)) {
        updatedCheckedUsers.delete(userId);
      } else {
        updatedCheckedUsers.add(userId);
      }
      return updatedCheckedUsers;
    });
  };

  const handleNavigate = () => {
    navigate("/");
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
  }, [users]);



  return (
    <div className="gestion-container">
      <Header title={"Gestión de perfiles"}/>
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
                      onClick={() => handleUserClick(user.id)}
                    >
                      <span className="user-name">
                        {user.rol === "2"
                          ? user.profesor.nombre
                          : user.estudiante.nombre}
                      </span>
                      <input type="checkbox" className="user-checkbox" />
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
                    <input
                      type="text"
                      name="nombre"
                      value={editableUser.nombre || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Correo electrónico
                    <input
                      type="email"
                      name="correo"
                      value={editableUser.correo || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Nombre
                    <input
                      type="text"
                      name="nombre"
                      value={editableUser.nombre || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Carnet
                    <input
                      type="text"
                      name="carnet"
                      value={editableUser.carnet || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Correo electrónico
                    <input
                      type="email"
                      name="correo"
                      value={editableUser.correo || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Teléfono
                    <input
                      type="text"
                      name="telefono"
                      value={editableUser.telefono || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Estado
                    <input
                      type="text"
                      name="estado"
                      value={editableUser.estado || ''}
                      onChange={handleInputChange}
                    />
                  </label>
                </>
              )}
            </div>
  
            <div className="actions">
              <button className="btn-delete">Borrar usuario(s)</button>
              <button className="btn-edit">Editar usuario</button>
            </div>
          </div>
        </div>
      </div>
  
      <Footer />
    </div>
  );
  
  

};

export default GestionPerfiles;
