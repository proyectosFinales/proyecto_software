import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/GestionPerfiles.css";
import Footer from './components/Footer';
import { getAllUsers, getUserInfo } from "./components/userInfo";

const GestionPerfiles = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});


  const handleUserClick = async (id) => {
    try {
      const data = await getUserInfo(id);
      console.log(data);
      setSelectedUser({
        nombre: data.Nombre,
        carne: data.Carné,
        correo: data.Correo,
        telefono: data.Telefono,
        estado: data.Estado,
      });
    } catch (error) {
      console.error('Error al obtener la información del usuario:', error.message);
    }
  };

  useEffect(() => {
    const getAllUsersInfo = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data.data);
        console.log(users);
      } catch (error) {
        console.error('Error al obtener la información del usuario:', error.message);
      }
    };
    getAllUsersInfo();
  }, []);

  return (
    <div className="gestion-container">
      <div className="sidebar">
        <ul>
          <li>Inicio</li>
          <li>Anteproyectos</li>
          <li>Proyectos</li>
          <li>Asignaciones</li>
          <li>Cargar datos</li>
          <li>Citas</li>
          <li>Gestionar perfiles</li>
          <li>Modificar información</li>
        </ul>
      </div>

      <div className="content">
        <h1>Gestión de perfiles</h1>

        <div className="gestion-perfiles">
          <div className="users-list">
            <ul>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <li
                    key={user.id || index}
                    className={index % 2 === 0 ? "even-row" : "odd-row"}
                    onClick={() => handleUserClick(user.id)}  // Ahora se pasa el objeto user completo
                  >
                    <span className="user-name">{user.Nombre}</span> {/* Muestra el nombre del usuario */}
                    <input type="checkbox" className="user-checkbox" />
                  </li>
                ))
              ) : (
                <p>No hay usuarios disponibles.</p>
              )}
            </ul>
          </div>

          <div className="info-container">
            <div className="user-info">
              <h2>Información</h2>
              <label>
                Nombre
                <input type="text" value={selectedUser.nombre || ""} readOnly />
              </label>
              <label>
                Carné
                <input type="text" value={selectedUser.carne || ""} readOnly />
              </label>
              <label>
                Correo electrónico
                <input type="email" value={selectedUser.correo || ""} readOnly />
              </label>
              <label>
                Teléfono
                <input type="text" value={selectedUser.telefono || ""} readOnly />
              </label>
              <label>
                Estado
                <input type="text" value={selectedUser.estado || ""} readOnly />
              </label>
            </div>

            <div className="actions">
              <button className="btn-delete">Borrar usuario</button>
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
