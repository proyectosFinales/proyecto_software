import { React, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Footer from '../components/Footer';
import { signIn } from '../../controller/Signin';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await signIn(email, password);
      const uToken = data.id;
      sessionStorage.setItem("token", uToken);
      if (data.rol === '1') {
        navigate('/MenuCoordinador');
      } else if (data.rol === '2') {
        navigate('/MenuProfesor');
      } else {
        navigate('/MenuEstudiante');
      }
    } catch (error) {
      alert('Las credenciales no coinciden con ningún usuario. \nPor favor inténtelo de nuevo.');
    }
  };

  const toRegister = async () => {
    navigate("/registro");
  };

  const toRecovery = async () => {
    navigate("/recuperar-contraseña");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="w-full bg-white shadow-md py-6 px-4">
        <h1 className="text-3xl font-bold text-black text-center font-[Montserrat]">
          Sistema de Gestión de Trabajo Final de Graduación
        </h1>
        <h2 className="text-xl text-black text-center mt-2 font-[Montserrat]">
          Escuela de Ingeniería en Producción Industrial
        </h2>
      </div>
      <div className="flex-grow flex flex-col justify-center items-center p-4">
        <form
          className="w-full max-w-sm bg-white shadow-md rounded px-8 pt-6 pb-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center border-b border-gray-300 py-2">
            <FaUser className="text-gray-500 mx-2" />
            <input
              type="email"
              className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center border-b border-gray-300 py-2">
            <FaLock className="text-gray-500 mx-2" />
            <input
              type={showPassword ? "text" : "password"}
              className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="text-gray-500 mx-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            type="submit"
          >
            Iniciar Sesión
          </button>
          <button
            className="w-full bg-gray-100 text-blue-600 py-2 rounded border border-blue-400 hover:bg-gray-200"
            onClick={toRegister}
          >
            Registrarse
          </button>
          <div
            className="text-sm text-blue-600 hover:underline cursor-pointer text-right"
            onClick={toRecovery}
          >
            Olvidé mi contraseña
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
