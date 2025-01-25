import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderProfesor from '../components/HeaderProfesor';
import HeaderEstudiante from '../components/HeaderEstudiante';
import Footer from '../components/Footer';
import supabase from '../../model/supabase';

const AgregarEntrada = () => {
  const [entrada, setEntrada] = useState({
    puntosAnalizados: '',
    asuntosPendientes: '',
    observaciones: '',
  });

  const navigate = useNavigate();
  const location = useLocation();

  const getQueryParams = (query) => {
    return Object.fromEntries(new URLSearchParams(query));
  };

  const queryParams = getQueryParams(location.search);
  const bitacoraId = queryParams.id;
  const usuarioId = sessionStorage.getItem('token');
  const [rol, setRol] = useState(0);

  useEffect(() => {
    const fetchRol = async () => {
      try {
        // Obtener el rol del usuario
        const { data: rolUsuario, error: rolError } = await supabase
        .from('Usuario')
        .select('rol')
        .eq('id', usuarioId)
        .single();

      if (rolError || !rolUsuario) {
        throw new Error('Error al obtener el rol del usuario');
      }

      setRol(rolUsuario.rol);
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error.message);
      }
    };

    fetchRol();
  }, [usuarioId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntrada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardarEntrada = async () => {
    console.log('Guardar entrada');
    try {
      // Convertimos las entradas en un array y luego en string
      const contenido = JSON.stringify([
        entrada.puntosAnalizados,
        entrada.asuntosPendientes,
        entrada.observaciones,
      ]);

      const { error } = await supabase
        .from('Entrada')
        .insert([
          {
            bitacora_id: bitacoraId,
            contenido: contenido,
            fecha: new Date().toISOString(),
            aprobada_prof: false,
            aprobada_est: false,
          },
        ])
        .select();

      if (error) {
        throw new Error('Error al agregar la entrada');
      }

      navigate('/bitacoras');
    } catch (error) {
      console.error('Error al crear la entrada:', error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {rol === 2 ? <HeaderProfesor title="Agregar Entrada" /> :
        <HeaderEstudiante title="Agregar Entrada" />}
      <div className="flex-grow flex flex-col items-center p-6">
        <form className="w-full max-w-lg bg-white p-6 rounded shadow space-y-4">
          <h2 className="text-xl font-semibold mb-2">Nueva Entrada</h2>
          <div className="flex flex-col">
            <label className="mb-1">Puntos Analizados</label>
            <textarea
              name="puntosAnalizados"
              className="border border-gray-300 rounded px-3 py-2"
              value={entrada.puntosAnalizados}
              onChange={handleInputChange}
              rows="4"
              style={{
                resize: 'none',
                width: '100%',
                height: 'auto',
                overflow: 'hidden',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Asuntos Pendientes</label>
            <textarea
              name="asuntosPendientes"
              className="border border-gray-300 rounded px-3 py-2"
              value={entrada.asuntosPendientes}
              onChange={handleInputChange}
              rows="4"
              style={{
                resize: 'none',
                width: '100%',
                height: 'auto',
                overflow: 'hidden',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1">Observaciones</label>
            <textarea
              name="observaciones"
              className="border border-gray-300 rounded px-3 py-2"
              value={entrada.observaciones}
              onChange={handleInputChange}
              rows="4"
              style={{
                resize: 'none',
                width: '100%',
                height: 'auto',
                overflow: 'hidden',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={handleGuardarEntrada}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AgregarEntrada;
