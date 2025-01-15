import { React, useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/CambioContraseña.css";
import { FaLock } from "react-icons/fa";
import { validarToken, cambiarContraseña } from "../../controller/Recovery";
import { validarContraseñaDetallada } from "../../controller/validarEntradas"
import "../styles/ErrorCambioContraseña.css";
import "../styles/CargandoCambioContraseña.css";
import Footer from '../components/Footer';

const CambioContraseña = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const checkToken = async () => {
      try {
        const data = await validarToken(token);
        setId(data.id);
      } catch (error) {
        setId(null);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [token]);

  const handlePasswordChange = () => {

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");
      return;
    }

    if (validarContraseñaDetallada(newPassword)) {
      cambiarContraseña(id, newPassword);
      alert("La constraseña fue cambiada exitósamente. Por favor, inicia sesión con las nuevas credenciales.");
      navigate("/");
    } else {
      console.log(newPassword);
      alert("La contraseña no es válida, debe contener al menos 8 caracteres \
y que mínimo contenga:\n- 1 minúscula\n- 1 mayúscula\n- 1 número\n- 1 caracter especial");
    }

    return;
  };


  if (loading) {
    return (
      <div className="loading-container">
        <h2>Validando el token...</h2>
        <Footer />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Token inválido o no encontrado.</h2>
          <p>Por favor, verifica el enlace enviado a tu correo.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="change-container">
      <button className="btn-back" onClick={() => navigate("/")}>
        Volver
      </button>

      <div className="change-box">
        <h2>Nueva contraseña</h2>
        <p>Debe contener al menos una mayúscula, una minúscula, un carácter especial y un dígito.</p>

        <div className="input-container-contra">
          <FaLock className="icon-contra" />
          <input
            type="password"
            className="input-field"
            placeholder="Nueva Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="input-container-contra">
          <FaLock className="icon-contra" />
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