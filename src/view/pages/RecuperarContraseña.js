import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/RecuperarContraseña.css";
import { FaEnvelope } from "react-icons/fa";
import Footer from '../components/Footer';
import sendRecovery from "../../controller/Recovery";

const RecuperarContraseña = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRecovery = () => {
    try {
      sendRecovery(email);
      alert(`Se envió la solicitud al correo electrónico: ${email}`);
      navigate("/");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="recover-container">
      <button className="btn-back" onClick={() => navigate("/")}>
        Volver
      </button>

      <div className="recover-box">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo electrónico registrado en la plataforma para enviar una solicitud de recuperación de contraseña.</p>

        <div className="input-container-recuperar">
          <FaEnvelope className="icon-recuperar" />
          <input
            type="email"
            className="input-field"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button className="btn-send" onClick={handleRecovery}>
          Enviar Solicitud
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default RecuperarContraseña;
