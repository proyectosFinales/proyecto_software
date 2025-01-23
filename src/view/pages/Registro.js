import React, { useState } from 'react';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock, FaMapMarked } from 'react-icons/fa';
import { signUpNewUser } from '../../controller/Signup';
import { useNavigate } from 'react-router-dom';

/**
 * Registro.jsx
 * 
 * Permite crear un nuevo usuario con rol=3 (estudiante).
 * Llama a `signUpNewUser(fullName, carnet, number, email, password, sede)`
 * Ajustado a tu `Signup.js` del controlador.
 */
const Registro = () => {
  const [fullName, setFullName] = useState('');
  const [carnet, setCarnet] = useState('');
  const [number, setNumber] = useState('');  // teléfono
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sede, setSede] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // Dependiendo de tu firma en signUpNewUser, 
      // podrías tener que pasar "" para la cédula, p.ej:
      // signUpNewUser(fullName, carnet, "", number, email, password, sede)
      // si tu DB la requiere. 
      // De momento, asumimos la firma actual: signUpNewUser(fullName, carnet, number, email, password, sede)
      await signUpNewUser(fullName, carnet, number, email, password, sede);

      alert('Usuario registrado con éxito.');
      navigate('/');
    } catch (error) {
      alert(error.message || error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 justify-center items-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 space-y-6">

        <h2 className="text-2xl font-bold mb-6 text-center">Registro</h2>

        <div className="flex items-center border-b border-gray-300 py-2 mb-4">
          <FaUser className="text-gray-500 mx-2" />
          <input
            type="text"
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            placeholder="Nombre Completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="flex items-center border-b border-gray-300 py-2 mb-4">
          <FaIdCard className="text-gray-500 mx-2" />
          <input
            type="number"
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            placeholder="Carné de institución"
            value={carnet}
            onChange={(e) => setCarnet(e.target.value)}
          />
        </div>

        <div className="flex items-center border-b border-gray-300 py-2 mb-4">
          <FaPhone className="text-gray-500 mx-2" />
          <input
            type="tel"
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            placeholder="Teléfono"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>

        <div className="flex items-center border-b border-gray-300 py-2 mb-4">
          <FaEnvelope className="text-gray-500 mx-2" />
          <input
            type="email"
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            placeholder="Correo de la institución"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex items-center border-b border-gray-300 py-2 mb-4">
          <FaLock className="text-gray-500 mx-2" />
          <input
            type="password"
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center border-b border-gray-300 py-2 mb-4">
          <FaMapMarked className="text-gray-500 mx-2" />
          <select
            name="sede"
            className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
            value={sede}
            onChange={(e) => setSede(e.target.value)}
            required
          >
            <option value="">Seleccione una sede</option>
            <option value="Central Cartago">Central Cartago</option>
            <option value="Local San José">Local San José</option>
            <option value="Local San Carlos">Local San Carlos</option>
            <option value="Limón">Centro Académico de Limón</option>
            <option value="Alajuela">Centro Académico de Alajuela</option>
          </select>
        </div>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={handleSubmit}
        >
          Registrarse
        </button>

        <div className="flex items-center justify-between text-sm">
          <span>¿Ya tienes cuenta?</span>
          <a href="/" className="text-blue-600 hover:underline">
            Iniciar sesión
          </a>
        </div>

        <div className="mt-4 text-center text-xs text-gray-600">
          Instituto Tecnológico de Costa Rica
        </div>
      </div>
    </div>
  );
};

export default Registro;
