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
  });

  const navigate = useNavigate();

  const handleTipoUsuarioChange = (tipo) => {
    setTipoUsuario(tipo);
    // Limpia los campos al cambiar el tipo de usuario
    setUsuario({
      nombre: '',
      carnet: '',
      numero: '',
      correo: '',
      contraseña: '',
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

    try {
      if (tipoUsuario === "profesor") {
        await registroProfesor(nuevoUsuario.nombre, nuevoUsuario.correo, nuevoUsuario.contraseña)
        alert('Profesor agregado con éxito.');
      } else {
        await signUpNewUser(nuevoUsuario.nombre, nuevoUsuario.carnet, nuevoUsuario.numero, nuevoUsuario.correo, nuevoUsuario.contraseña);
        alert('Estudiante agregado con éxito.');
      }
      navigate('/gestion-perfiles');
    } catch (error) {
      alert(error);
    }

    setUsuario({
      nombre: '',
      carnet: '',
      numero: '',
      correo: '',
      contrasena: '',
    });
  };

  const handleLimpiarEntradas = () => {
    setUsuario({
      nombre: '',
      carnet: '',
      numero: '',
      correo: '',
      contrasena: '',
    });
  };

  return (
    <div className="agregar-usuario-container">
      <Header />
      <div className="form-container">
        <h2>Agregar Usuario</h2>
        <div className="tabs">
          <button onClick={() => handleTipoUsuarioChange('estudiante')} className={tipoUsuario === 'estudiante' ? 'active' : ''}>
            Estudiante
          </button>
          <button onClick={() => handleTipoUsuarioChange('profesor')} className={tipoUsuario === 'profesor' ? 'active' : ''}>
            Profesor
          </button>
        </div>

        <form>
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
            type="password"
            name="contraseña"
            value={usuario.contraseña}
            onChange={handleInputChange}
            required
          />

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
