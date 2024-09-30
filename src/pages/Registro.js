import React from 'react';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock } from 'react-icons/fa';
import '../styles/Registro.css'; // Asegúrate de crear este archivo CSS

const Registro = () => {
  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro de Usuario</h2>
        
        <div className="input-container">
          <FaUser className="icon" />
          <input type="text" className="input-field" placeholder="Nombre completo" />
        </div>
        
        <div className="input-container">
          <FaIdCard className="icon" />
          <input type="number" className="input-field" placeholder="Carné de institución" />
        </div>
        
        <div className="input-container">
          <FaPhone className="icon" />
          <input type="tel" className="input-field" placeholder="Teléfono" />
        </div>
        
        <div className="input-container">
          <FaEnvelope className="icon" />
          <input type="email" className="input-field" placeholder="Correo electrónico" />
        </div>
        
        <div className="input-container">
          <FaLock className="icon" />
          <input type="password" className="input-field" placeholder="Contraseña" />
        </div>
        
        <button className="btn-register">Registrarse</button>

        <div className="footer-links">
          <span>¿Ya tienes cuenta?</span>
          <a href="/login">Iniciar sesión</a>
        </div>
      </div>

      <div className="register-footer">
        Instituto Tecnológico de Costa Rica
      </div>
    </div>
  );
};

export default Registro;
