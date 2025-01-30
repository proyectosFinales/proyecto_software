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

    if (!validarContraseñaDetallada(newPassword)) {
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
    <div className="flex flex-col min-h-screen bg-gray-100 justify-center items-center p-4">
      {loading ? (
        <h2 className="text-center text-xl text-gray-700">Cargando...</h2>
      ) : id ? (
        <div className="w-full max-w-md bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-xl font-bold text-center">Cambiar Contraseña</h2>
          <p>Debe contener al menos una mayúscula, una minúscula, un carácter especial y un dígito.</p>

          <div className="flex items-center border-b border-gray-300 py-2">
            <FaLock className="text-gray-500 mx-2" />
            <input
              type="password"
              className="appearance-none bg-transparent border-none w-full text-gray-700 py-1 px-2 leading-tight focus:outline-none"
              placeholder="Nueva Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center border-b border-gray-300 py-2">
            <FaLock className="text-gray-500 mx-2" />
            <input
              type="password"
              className="appearance-none bg-transparent border-none w-full text-gray-700 py-1 px-2 leading-tight focus:outline-none"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={handlePasswordChange}
          >
            Cambiar Contraseña
          </button>
        </div>
      ) : (
        <div className="text-center bg-red-500 text-white p-4 rounded shadow-md">
          Error al validar token
        </div>
      )}
      <Footer />
    </div>
  );
};

export default CambioContraseña;