/**
 * AgregarUsuario.jsx
 * Permite agregar estudiantes o profesores manualmente.
 * Llama a signUpNewUser(...) o registroProfesor(...).
 * Hace validación para el correo y número de teléfono,
 * mostrando errores apropiados.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaMapMarked
} from 'react-icons/fa';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import {
  signUpNewUser,
  registroProfesor,
  generarContraseña,
  sendMailToNewUser
} from '../../controller/Signup';
import { validarCorreo, validarTelefono } from '../../controller/validarEntradas';

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

  const handleLimpiarEntradas = () => {
    setUsuario((prev) => ({
      // Regenerar la contraseña si deseas, o conservar la anterior
      nombre: '',
      carnet: '',
      numero: '',
      correo: '',
      contraseña: generarContraseña(),
      sede: ''
    }));
  };

  const handleAgregarUsuario = async () => {
    try {
      // Validaciones
      if (!validarCorreo(usuario.correo)) {
        throw new Error("El correo ingresado no es válido. Ej: usuario@ejemplo.com");
      }
      if (!validarTelefono(usuario.numero)) {
        throw new Error("El número de teléfono no es válido. Debe ser 8 dígitos o +506XXXXXXXX.");
      }

      const nuevoUsuario = { ...usuario, tipo: tipoUsuario };

      if (tipoUsuario === 'profesor') {
        // Profesor
        await registroProfesor(
          nuevoUsuario.nombre,
          nuevoUsuario.correo,
          nuevoUsuario.contraseña,
          nuevoUsuario.sede,
          nuevoUsuario.numero
        );
        alert('Profesor agregado con éxito.');
      } else {
        // Estudiante
        await signUpNewUser(
          nuevoUsuario.nombre,
          nuevoUsuario.carnet,
          nuevoUsuario.numero,
          nuevoUsuario.correo,
          nuevoUsuario.contraseña,
          nuevoUsuario.sede
        );
        alert('Estudiante agregado con éxito.');
      }

      // Envía correo con la contraseña nueva
      await sendMailToNewUser(nuevoUsuario.correo, nuevoUsuario.contraseña);

      navigate('/gestion-perfiles');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header (Coordinador) */}
      <Header title="Agregar Usuario" />

      <main className="flex-grow p-4">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-4">
          {/* Botón Volver */}
          <button
            onClick={() => navigate("/gestion-perfiles")}
            className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Volver
          </button>

          <h2 className="text-lg font-bold mb-4">Agregar Usuario</h2>

          {/* Tabs Estudiante/Profesor */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => handleTipoUsuarioChange('estudiante')}
              className={`px-4 py-2 rounded ${
                tipoUsuario === 'estudiante'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Estudiante
            </button>
            <button
              onClick={() => handleTipoUsuarioChange('profesor')}
              className={`px-4 py-2 rounded ${
                tipoUsuario === 'profesor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Profesor
            </button>
          </div>

          {/* Formulario */}
          <form className="grid grid-cols-1 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-gray-700">Nombre:</label>
              <div className="relative mt-1">
                <FaUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="nombre"
                  className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none"
                  placeholder="Nombre completo"
                  value={usuario.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Estudiante */}
            {tipoUsuario === 'estudiante' && (
              <>
                <div>
                  <label className="block text-gray-700">Carnet:</label>
                  <div className="relative mt-1">
                    <FaIdCard className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="carnet"
                      className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none"
                      placeholder="Ej: 2019012345"
                      value={usuario.carnet}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700">Número (teléfono):</label>
                  <div className="relative mt-1">
                    <FaPhone className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="numero"
                      className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none"
                      placeholder="8888-8888"
                      value={usuario.numero}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Profesor */}
            {tipoUsuario === 'profesor' && (
              <div>
                <label className="block text-gray-700">Número (teléfono):</label>
                <div className="relative mt-1">
                  <FaPhone className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="numero"
                    className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none"
                    placeholder="8888-8888"
                    value={usuario.numero}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Correo */}
            <div>
              <label className="block text-gray-700">Correo:</label>
              <div className="relative mt-1">
                <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="correo"
                  className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none"
                  placeholder="correo@ejemplo.com"
                  value={usuario.correo}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Sede */}
            <div>
              <label className="block text-gray-700">Seleccione una sede:</label>
              <div className="relative mt-1">
                <FaMapMarked className="absolute left-3 top-3 text-gray-400" />
                <select
                  name="sede"
                  className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none bg-white"
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
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={handleLimpiarEntradas}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={handleAgregarUsuario}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Agregar Usuario
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgregarUsuario;
