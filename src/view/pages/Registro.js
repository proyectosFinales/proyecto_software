import React, { useState } from 'react';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock, FaMapMarked } from 'react-icons/fa';
import '../styles/Registro.css';
import { signUpNewUser } from '../../controller/Signup';
import { useNavigate } from 'react-router-dom';

/**
 * Registro.jsx
 * 
 * Permite crear un nuevo usuario con rol=3 (estudiante).
 * Llama a `signUpNewUser(fullName, carnet, number, email, password, sede)`
 * Ajustado a tu `Signup.js` del controlador.
 */
const Registro = () => {
  const [fullName, setFullName] = useState('');
  const [carnet, setCarnet] = useState('');
  const [number, setNumber] = useState('');  // teléfono
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sede, setSede] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // Dependiendo de tu firma en signUpNewUser, 
      // podrías tener que pasar "" para la cédula, p.ej:
      // signUpNewUser(fullName, carnet, "", number, email, password, sede)
      // si tu DB la requiere. 
      // De momento, asumimos la firma actual: signUpNewUser(fullName, carnet, number, email, password, sede)
      await signUpNewUser(fullName, carnet, number, email, password, sede);

      alert('Usuario registrado con éxito.');
      navigate('/');
    } catch (error) {
      alert(error.message || error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro de Usuario</h2>

        <div className="input-container-registro">
          <FaUser className="icon-registro" />
          <input
            type="text"
            className="input-field"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="input-container-registro">
          <FaIdCard className="icon-registro" />
          <input
            type="number"
            className="input-field"
            placeholder="Carné de institución"
            value={carnet}
            onChange={(e) => setCarnet(e.target.value)}
          />
        </div>

        <div className="input-container-registro">
          <FaPhone className="icon-registro" />
          <input
            type="tel"
            className="input-field"
            placeholder="Teléfono"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>

        <div className="input-container-registro">
          <FaEnvelope className="icon-registro" />
          <input
            type="email"
            className="input-field"
            placeholder="Correo de la institución"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-container-registro">
          <FaLock className="icon-registro" />
          <input
            type="password"
            className="input-field"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-container-registro">
          <FaMapMarked className="icon-sede" />
          <select
            name="sede"
            className="sede-dropdown"
            value={sede}
            onChange={(e) => setSede(e.target.value)}
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

        <button className="btn-register" onClick={handleSubmit}>
          Registrarse
        </button>

        <div className="footer-links">
          <span>¿Ya tienes cuenta?</span>
          <a href="/">Iniciar sesión</a>
        </div>
      </div>

      <div className="register-footer">
        Instituto Tecnológico de Costa Rica
      </div>
    </div>
  );
};

export default Registro;
