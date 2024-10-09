import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/GestionPerfiles.css";
import Footer from './components/Footer';

const GestionPerfiles = () => {
  const [selectedUser, setSelectedUser] = useState({
    nombre: "Ana Catalina Siles",
    carne: "2019527194",
    correo: "anacatsiles@itcr.ac.cr",
    telefono: "84193253",
    estado: "Aprobado / Reprobado",
  });

  const users = [
    "Ana Catalina Siles",
    "Balaam Brenes",
    "Biljhana Farah",
    "Brayan Lopez",
    "Diogenes Álvarez",
    "Esteban Daniels",
    "Esteban Lemaitre",
    "Fabian Matamoros",
    "Harold Matamoros",
    "Jary Brenes",
    "Johanna Blanco",
    "Johanna Madrigal",
    "Leonel Fonseca",
    "Mario Zeledon",
    "Mauricio Espinoza",
    "Natalia Redondo",
    "Nuria Zeledon",
    "Oscar Boza",
    "Pablo Hernandez",
    "Raul Elizondo",
    "Sebastian Delgado",
  ];

  const handleUserClick = (userName) => {
    // Aquí debes manejar la lógica para cambiar la información del usuario seleccionado
    setSelectedUser({
      ...selectedUser,
      nombre: userName,
    });
  };

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
              {users.map((user, index) => (
                <li key={user} className={index % 2 === 0 ? "even-row" : "odd-row"}
                onClick={() => handleUserClick(user)}>
                  {user}
                </li>
              ))}
            </ul>
          </div>
          <div className="info-container">
            <div className="user-info">
              <h2>Información</h2>
              <label>
                Nombre
                <input type="text" value={selectedUser.nombre} readOnly />
              </label>
              <label>
                Carné
                <input type="text" value={selectedUser.carne} readOnly />
              </label>
              <label>
                Correo electrónico
                <input type="email" value={selectedUser.correo} readOnly />
              </label>
              <label>
                Teléfono
                <input type="text" value={selectedUser.telefono} readOnly />
              </label>
              <label>
                Estado
                <input type="text" value={selectedUser.estado} readOnly />
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
