import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/GestionPerfiles.css";
import Footer from '../components/Footer';
import Header from '../components/Header'
import { getAllUsers, getUserInfo } from "../../controller/userInfo";

const GestionPerfiles = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});

  const navigate = useNavigate();

  const handleUserClick = async (id) => {
    try {
      const data = await getUserInfo(id);
      console.log(data);
      setSelectedUser({
        nombre: data.nombre,
        carne: data.carnet,
        correo: data.correo,
        telefono: data.telefono,
        estado: data.estado,
      });
    } catch (error) {
      console.error('Error al obtener la información del usuario:', error.message);
    }
  };

  const handleNavigate = () => {
    navigate("/"); // Redirige al menú principal
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
      <Header/>
      <div className="content">
      <button onClick={handleNavigate} className="btn-volver-menu">
      Volver
      </button>

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
                    <span className="user-name">{user.nombre}</span> {/* Muestra el nombre del usuario */}
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
              <h2>Información del usuario</h2>
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
