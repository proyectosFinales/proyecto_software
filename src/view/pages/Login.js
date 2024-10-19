import { React, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/Login.css";
import { signIn } from '../../controller/Signin';
import { FaUser, FaLock } from "react-icons/fa";
import Footer from '../components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  // Función para manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await signIn(email, password);
      const uToken = data.id;
      localStorage.setItem("token", uToken);
      if (data.rol === 1) {
        navigate('/');
      } else if (data.rol === 2) {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (error) {
      alert('Las credenciales no coinciden con ningún usuario. \nPor favor inténtelo de nuevo.');
    }
  };

  const toRegister = async () => {
    navigate("/registro");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar sesión</h2>

        {/* Formulario que envuelve los campos de entrada */}
        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <FaUser className="icon" />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-container">
            <FaLock className="icon" />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button className="btn-login" type="submit">
            Iniciar Sesión
          </button>
        </form>

        <div className="forgot-password">
          <a href="#">Olvidé mi contraseña</a>
        </div>

        <button className="btn-register" onClick={toRegister}>
          Registrarse
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
