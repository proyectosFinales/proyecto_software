import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/Login.css"; // Importamos el archivo CSS para los estilos
import { signIn } from '../components/Signin';
import { FaUser, FaLock } from "react-icons/fa";
import Footer from '../components/Footer'

const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();


  const handleSubmit = async () => {
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      alert('Las credenciales no coinciden con ningún usuario. \nPor favor inténtelo de nuevo.');
      console.error(error);
    }
  };

  const toRegister = async () => {
    navigate("/registro");
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar sesión</h2>

        <div className="input-container">
          <FaUser className="icon" />
          <input type="email" className="input-field" placeholder="Correo electrónico" value={email}
            onChange={(e) => setEmail(e.target.value)}/>
        </div>

        <div className="input-container">
          <FaLock className="icon" />
          <input type="password" className="input-field" placeholder="Contraseña" value={password}
            onChange={(e) => setPassword(e.target.value)}/>
        </div>

        <button className="btn-login" onClick={handleSubmit}>Iniciar Sesión</button>

        <div className="forgot-password">
          <a href="#">Olvidé mi contraseña</a>
        </div>
        <button className="btn-register" onClick={toRegister}>Registrarse</button>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
