import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from "react-icons/fa";
import Footer from '../components/Footer';
import sendRecovery from "../../controller/Recovery";

/**
 * RecuperarContraseña.jsx
 * 
 * Permite al usuario ingresar su correo y solicitar un mail de recuperación.
 * Llama a `sendRecovery(email)` que internamente hará 
 * `from('Usuario').select(...)` en tu controlador.
 */
const RecuperarContraseña = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleRecovery = async () => {
    try {
      await sendRecovery(email);
      alert(`Se envió la solicitud al correo electrónico: ${email}`);
      navigate("/");
    } catch (error) {
      alert(error.message || error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 justify-center items-center p-4 relative">
      <button
        className="absolute top-4 left-4 bg-blue-700 text-white px-3 py-2 rounded hover:bg-blue-800"
        onClick={() => navigate("/")}
      >
        Volver
      </button>

      <div className="w-full max-w-sm bg-white shadow-md rounded p-6 space-y-4">
        <h1 className="text-xl font-bold text-center">Recuperar Contraseña</h1>
        <div className="flex items-center border-b border-gray-300 py-2 mb-4">
          <FaEnvelope className="text-gray-500 mx-2" />
          <input
            type="email"
            className="appearance-none bg-transparent border-none w-full text-gray-700 py-1 px-2 leading-tight focus:outline-none"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={handleRecovery}
        >
          Enviar Solicitud
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default RecuperarContraseña;
