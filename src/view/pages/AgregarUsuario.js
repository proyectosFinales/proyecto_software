/**
 * AgregarUsuario.jsx
 * Permite agregar estudiantes o profesores manualmente.
 * Llama a signUpNewUser(...) o registroProfesor(...).
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaLock, FaMapMarked } from 'react-icons/fa';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import { signUpNewUser, registroProfesor, generarContraseña, sendMailToNewUser } from '../../controller/Signup';

const AgregarUsuario = () => {
  const [tipoUsuario, setTipoUsuario] = useState('estudiante');
  const [usuario, setUsuario] = useState({
    nombre: '',
    carnet: '',
    numero: '',
    correo: '',
    contraseña: generarContraseña(),
    sede: ''
  });

  const navigate = useNavigate();

  const handleTipoUsuarioChange = (tipo) => {
    setTipoUsuario(tipo);
    handleLimpiarEntradas();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAgregarUsuario = async () => {
    try {
      const nuevoUsuario = { ...usuario, tipo: tipoUsuario };

      if (tipoUsuario === "profesor") {
        // registroProfesor(nombre, correo, contraseña, sede, telefono)
        await registroProfesor(
          nuevoUsuario.nombre,
          nuevoUsuario.correo,
          nuevoUsuario.contraseña,
          nuevoUsuario.sede,
          nuevoUsuario.numero // usaremos "numero" como teléfono
        );
        alert('Profesor agregado con éxito.');
      } else {
        // signUpNewUser(fullName, carnet, cedula, tel, email, password, sede)
        // Usamos "" como cedula si no se pide en el form
        await signUpNewUser(
          nuevoUsuario.nombre,
          nuevoUsuario.carnet,
          nuevoUsuario.numero,  // usaremos "numero" como teléfono
          nuevoUsuario.correo,
          nuevoUsuario.sede
        );
        alert('Estudiante agregado con éxito.');
      }
      sendMailToNewUser(nuevoUsuario.correo, nuevoUsuario.contraseña);
      navigate('/gestion-perfiles');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLimpiarEntradas = () => {
    setUsuario((prev) => ({
      nombre: '',
      carnet: '',
      numero: '',
      correo: '',
      contraseña: prev.contraseña,
      sede: ''
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header title="Agregar Usuario" />
      <main className="flex-grow flex items-center justify-center p-6">
        <form className="w-full max-w-md bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-bold">Datos de {tipoUsuario}</h2>
          <div className="flex flex-col mb-3">
            <label className="mb-1 flex items-center">
              <FaUser className="mr-2" />
              Nombre completo
            </label>
            <input
              className="border border-gray-300 rounded px-3 py-2"
              type="text"
              name="nombre"
              value={usuario.nombre}
              onChange={handleInputChange}
              required
            />
          </div>

          {tipoUsuario === 'estudiante' && (
            <>
              <div className="flex flex-col mb-3">
                <label className="mb-1 flex items-center">
                  <FaIdCard className="mr-2" />
                  Carnet
                </label>
                <input
                  className="border border-gray-300 rounded px-3 py-2"
                  type="text"
                  name="carnet"
                  value={usuario.carnet}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex flex-col mb-3">
                <label className="mb-1 flex items-center">
                  <FaPhone className="mr-2" />
                  Número (teléfono)
                </label>
                <input
                  className="border border-gray-300 rounded px-3 py-2"
                  type="text"
                  name="numero"
                  value={usuario.numero}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {tipoUsuario === 'profesor' && (
            <>
              <div className="flex flex-col mb-3">
                <label className="mb-1 flex items-center">
                  <FaPhone className="mr-2" />
                  Número (teléfono)
                </label>
                <input
                  className="border border-gray-300 rounded px-3 py-2"
                  type="text"
                  name="numero"
                  value={usuario.numero}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <div className="flex flex-col mb-3">
            <label className="mb-1 flex items-center">
              <FaEnvelope className="mr-2" />
              Correo
            </label>
            <input
              className="border border-gray-300 rounded px-3 py-2"
              type="email"
              name="correo"
              value={usuario.correo}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex flex-col mb-3">
            <label className="mb-1 flex items-center">
              <FaMapMarked className="mr-2" />
              Seleccione una sede:
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2"
              name="sede"
              value={usuario.sede}
              onChange={handleInputChange}
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

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleLimpiarEntradas}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleAgregarUsuario}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Agregar Usuario
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AgregarUsuario;
