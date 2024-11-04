import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/Login.css";
import { signIn } from '../../controller/Signin';
import { FaUser, FaLock } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Footer from '../components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await signIn(email, password);
      const uToken = data.id;
      sessionStorage.setItem("token", uToken);
      if (data.rol === '1') {
        navigate('/MenuCoordinador');
      } else if (data.rol === '2') {
        navigate('/MenuProfesor');
      } else {
        navigate('/MenuEstudiante');
      }
    } catch (error) {
      alert('Las credenciales no coinciden con ningún usuario. \nPor favor inténtelo de nuevo.');
    }
  };

  const toRegister = async () => {
    navigate("/registro");
  };

  const toRecovery = async () => {
    navigate("/recuperar-contraseña");
  };

  const toggleVistaContra = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-root">
      <div className="title-container">
        <h1>Trabajo final de graduación</h1>
        <h2>Escuela de Producción Industrial</h2>
      </div>
      <div className="login-container">
        <div className="login-box">
          <h2>Iniciar sesión</h2>
          <form className="login-form" onSubmit={handleSubmit}>
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
                type={showPassword ? "text" : "password"}
                className="input-field password-input"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>

            <button className="btn-login" type="submit">
              Iniciar Sesión
            </button>
          </form>

          <div className="forgot-password">
            <a onClick={toRecovery}>Olvidé mi contraseña</a>
          </div>

          <button className="btn-register" onClick={toRegister}>
            Registrarse
          </button>
        </div>

        <Footer />
      </div>
    </div>

  );
};

export default Login;
