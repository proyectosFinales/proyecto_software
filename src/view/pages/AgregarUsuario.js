import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AgregarUsuario.css';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import { signUpNewUser, registroProfesor } from '../../controller/Signup';

const AgregarUsuario = () => {
  const [tipoUsuario, setTipoUsuario] = useState('estudiante'); // Por defecto, se selecciona "estudiante"
  const [usuario, setUsuario] = useState({
    nombre: '',
    carnet: '',
    numero: '',
    correo: '',
    contraseña: '',
    sede: ''
  });

  const navigate = useNavigate();

  const handleTipoUsuarioChange = (tipo) => {
    setTipoUsuario(tipo);
    setUsuario({
      nombre: '',
      carnet: '',
      numero: '',
      correo: '',
      contraseña: '',
      sede: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAgregarUsuario = async () => {

    const nuevoUsuario = {
      ...usuario,
      tipo: tipoUsuario,
    };

    if (tipoUsuario === "profesor") {
      try {
        await registroProfesor(nuevoUsuario.nombre, nuevoUsuario.correo, nuevoUsuario.contraseña, nuevoUsuario.sede)
        alert('Profesor agregado con éxito.');
        navigate('/gestion-perfiles');
      } catch (error) {
        alert(error.message);
      }
    } else {
      try {
        await signUpNewUser(nuevoUsuario.nombre, nuevoUsuario.carnet, nuevoUsuario.numero, nuevoUsuario.correo, nuevoUsuario.contraseña, nuevoUsuario.sede);
        alert('Estudiante agregado con éxito.');
        navigate('/gestion-perfiles');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleLimpiarEntradas = () => {
    setUsuario({
      nombre: '',
      carnet: '',
      numero: '',
      correo: '',
      contrasena: '',
      sede: ''
    });
  };

  return (
    <div className="agregar-usuario-container">
      <Header />
      <div className="form-container">
        <button className="btn-back-addUser" onClick={() => navigate("/gestion-perfiles")}>
          Volver
        </button>
        <h2>Agregar Usuario</h2>
        <div className="tabs">
          <button onClick={() => handleTipoUsuarioChange('estudiante')} className={tipoUsuario === 'estudiante' ? 'active' : ''}>
            Estudiante
          </button>
          <button onClick={() => handleTipoUsuarioChange('profesor')} className={tipoUsuario === 'profesor' ? 'active' : ''}>
            Profesor
          </button>
        </div>

        <form className="form-addUser">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={usuario.nombre}
            onChange={handleInputChange}
            required
          />

          {tipoUsuario === 'estudiante' && (
            <>
              <label>Carnet:</label>
              <input
                type="text"
                name="carnet"
                value={usuario.carnet}
                onChange={handleInputChange}
                required
              />

              <label>Número:</label>
              <input
                type="text"
                name="numero"
                value={usuario.numero}
                onChange={handleInputChange}
                required
              />
            </>
          )}

          <label>Correo:</label>
          <input
            type="email"
            name="correo"
            value={usuario.correo}
            onChange={handleInputChange}
            required
          />

          <label>Contraseña:</label>
          <input
            type="text"
            name="contraseña"
            value={usuario.contraseña}
            onChange={handleInputChange}
            required
          />

          <label>Seleccione una sede:</label>
          <select
            name="sede"
            className="sede-dropdown"
            value={usuario.sede}
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

          <div className="buttons">
            <button type="button" onClick={handleLimpiarEntradas}>Limpiar</button>
            <button type="button" onClick={handleAgregarUsuario}>Agregar Usuario</button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AgregarUsuario;
