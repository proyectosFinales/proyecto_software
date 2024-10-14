import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/RecuperarContraseña.css";
import { FaEnvelope } from "react-icons/fa";
import Footer from '../components/Footer';

const RecuperarContraseña = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRecovery = () => {
    // Aquí puedes implementar la lógica para enviar la solicitud de recuperación
    console.log("Solicitud enviada para el correo:", email);
    // Mostrar mensaje de éxito o redirigir al usuario según sea necesario
  };

  return (
    <div className="recover-container">
      <button className="btn-back" onClick={() => navigate("/login")}>
        Volver
      </button>

      <div className="recover-box">
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo electrónico registrado en la plataforma para enviar una solicitud de recuperación de contraseña.</p>

        <div className="input-container">
          <FaEnvelope className="icon" />
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
