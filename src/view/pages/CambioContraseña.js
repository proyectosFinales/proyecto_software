import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/CambioContraseña.css";
import { FaLock } from "react-icons/fa";
import Footer from '../components/Footer';

const CambioContraseña = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");
      return;
    }
    // Lógica para cambiar la contraseña (ej: llamada a la API)
    console.log("Contraseña cambiada exitosamente");
    // Redirigir a la pantalla de login u otra página
    navigate("/login");
  };

  return (
    <div className="change-container">
      <button className="btn-back" onClick={() => navigate("/login")}>
        Volver
      </button>

      <div className="change-box">
        <h2>Nueva contraseña</h2>
        <p>Debe contener al menos una mayúscula, una minúscula, un caractér especial y un dígito.</p>

        <div className="input-container">
          <FaLock className="icon" />
          <input
            type="password"
            className="input-field"
            placeholder="Nueva Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="input-container">
          <FaLock className="icon" />
          <input
            type="password"
            className="input-field"
            placeholder="Confirmar Contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button className="btn-send" onClick={handlePasswordChange}>
          Cambiar Contraseña
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default CambioContraseña;
