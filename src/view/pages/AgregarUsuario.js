/**
 * AgregarUsuario.jsx
 * Permite agregar estudiantes o profesores manualmente.
 * Llama a signUpNewUser(...) o registroProfesor(...).
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock, FaMapMarked } from 'react-icons/fa';
import '../styles/AgregarUsuario.css';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import { signUpNewUser, registroProfesor, generarContraseña, sendMailToNewUser } from '../../controller/Signup';

const AgregarUsuario = () => {
  const [tipoUsuario, setTipoUsuario] = useState('estudiante');
  const [usuario, setUsuario] = useState({
    nombre: '',
    carnet: '',
    numero: '',
    correo: '',
    contraseña: generarContraseña(),
    sede: ''
  });

  const navigate = useNavigate();

  const handleTipoUsuarioChange = (tipo) => {
    setTipoUsuario(tipo);
    handleLimpiarEntradas();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAgregarUsuario = async () => {
    try {
      const nuevoUsuario = { ...usuario, tipo: tipoUsuario };
      console.log(nuevoUsuario);

      if (tipoUsuario === "profesor") {
        // registroProfesor(nombre, correo, contraseña, sede, telefono)
        await registroProfesor(
          nuevoUsuario.nombre,
          nuevoUsuario.correo,
          nuevoUsuario.contraseña,
          nuevoUsuario.sede,
          nuevoUsuario.numero // usaremos "numero" como teléfono
        );
        alert('Profesor agregado con éxito.');
      } else {
        // signUpNewUser(fullName, carnet, cedula, tel, email, password, sede)
        // Usamos "" como cedula si no se pide en el form
        await signUpNewUser(
          nuevoUsuario.nombre,
          nuevoUsuario.carnet,
          nuevoUsuario.numero,  // usaremos "numero" como teléfono
          nuevoUsuario.correo,
          nuevoUsuario.sede
        );
        alert('Estudiante agregado con éxito.');
      }
      sendMailToNewUser(nuevoUsuario.correo, nuevoUsuario.contraseña);
      navigate('/gestion-perfiles');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLimpiarEntradas = () => {
    setUsuario((prev) => ({
      nombre: '',
      carnet: '',
      numero: '',
      correo: '',
      contraseña: prev.contraseña,
      sede: ''
    }));
  };

  return (
    <div className="agregar-usuario-container">
      <Header />
      <div className="form-container">
        <button
          className="btn-back-addUser"
          onClick={() => navigate("/gestion-perfiles")}
        >
          Volver
        </button>
        <h2>Agregar Usuario</h2>
        <div className="tabs">
          <button
            onClick={() => handleTipoUsuarioChange('estudiante')}
            className={tipoUsuario === 'estudiante' ? 'active' : ''}
          >
            Estudiante
          </button>
          <button
            onClick={() => handleTipoUsuarioChange('profesor')}
            className={tipoUsuario === 'profesor' ? 'active' : ''}
          >
            Profesor
          </button>
        </div>

        <form className="form-addUser">
          <label>Nombre:</label>
          <div className="input-container-add">
            <FaUser className="icon-add" />
            <input
              type="text"
              name="nombre"
              className="input-field"
              value={usuario.nombre}
              onChange={handleInputChange}
              required
            />
          </div>

          {tipoUsuario === 'estudiante' && (
            <>
              <label>Carnet:</label>
              <div className="input-container-add">
                <FaIdCard className="icon-add" />
                <input
                  type="text"
                  name="carnet"
                  className="input-field"
                  value={usuario.carnet}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <label>Número (teléfono):</label>
              <div className="input-container-add">
                <FaPhone className="icon-add" />
                <input
                  type="text"
                  name="numero"
                  className="input-field"
                  value={usuario.numero}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {tipoUsuario === 'profesor' && (
            <>
              <label>Número (teléfono):</label>
              <div className="input-container-add">
                <FaPhone className="icon-add" />
                <input
                  type="text"
                  name="numero"
                  className="input-field"
                  value={usuario.numero}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <label>Correo:</label>
          <div className="input-container-add">
            <FaEnvelope className="icon-add" />
            <input
              type="email"
              name="correo"
              className="input-field"
              value={usuario.correo}
              onChange={handleInputChange}
              required
            />
          </div>

          <label>Seleccione una sede:</label>
          <div className="input-container-add">
            <FaMapMarked className="icon-sede" />
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
          </div>

          <div className="buttons">
            <button type="button" onClick={handleLimpiarEntradas}>
              Limpiar
            </button>
            <button type="button" onClick={handleAgregarUsuario}>
              Agregar Usuario
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AgregarUsuario;
