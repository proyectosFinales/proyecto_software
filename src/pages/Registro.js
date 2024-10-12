import { React, useState } from 'react';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock } from 'react-icons/fa';
import '../styles/Registro.css'; // Asegúrate de crear este archivo CSS
import { signUpNewUser } from './components/Signup';
import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const [fullName, setFullName] = useState('');
  const [carnet, setCarnet] = useState('');
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await signUpNewUser(fullName, carnet, number, email, password); // Llama a la función desde el servicio
      alert('Usuario registrado con éxito.');
      navigate('/login');
    } catch (error) {
      alert('Falló el registro de usuario. \nPor favor inténtelo de nuevo.');
      console.error(error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro de Usuario</h2>

        <div className="input-container">
          <FaUser className="icon" />
          <input type="text" className="input-field" placeholder="Nombre completo" value={fullName}
            onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="input-container">
          <FaIdCard className="icon" />
          <input type="number" className="input-field" placeholder="Carné de institución" value={carnet}
            onChange={(e) => setCarnet(e.target.value)} />
        </div>

        <div className="input-container">
          <FaPhone className="icon" />
          <input type="tel" className="input-field" placeholder="Teléfono" value={number}
            onChange={(e) => setNumber(e.target.value)} />
        </div>

        <div className="input-container">
          <FaEnvelope className="icon" />
          <input type="email" className="input-field" placeholder="Correo electrónico" value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-container">
          <FaLock className="icon" />
          <input type="password" className="input-field" placeholder="Contraseña" value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn-register" onClick={handleSubmit}>Registrarse</button>

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
