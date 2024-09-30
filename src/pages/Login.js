import React from "react";
import { Link } from 'react-router-dom';
import "../styles/Login.css"; // Importamos el archivo CSS para los estilos
import { FaUser, FaLock } from "react-icons/fa";

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar sesión</h2>
        
        <div className="input-container">
          <FaUser className="icon" />
          <input type="email" className="input-field" placeholder="Correo electrónico" />
        </div>

        <div className="input-container">
          <FaLock className="icon" />
          <input type="password" className="input-field" placeholder="Contraseña" />
        </div>
        
        <button className="btn-login">Iniciar Sesión</button>

        <div className="forgot-password">
          <a href="#">Olvidé mi contraseña</a>
        </div>
        
        {/* Cambia este botón a un enlace */}
        <Link to="/registro" className="btn-register">
          Registrarse
        </Link>
      </div>

      <footer className="login-footer">
        Instituto Tecnológico de Costa Rica
      </footer>
    </div>
  );
};

export default Login;
