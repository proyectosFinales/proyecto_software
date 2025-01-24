import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AgregarUsuario.css';
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
    <div className="agregar-usuario-container">
       {rol === 2 ? <HeaderProfesor/> :
        <HeaderEstudiante/>}
      <div
        className="form-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
          }}
        >
          <button
            className="btn-back-addUser"
            onClick={() => navigate('/bitacoras')}
            style={{ marginLeft: '10px' }}
          >
            Volver
          </button>
          <h2 style={{ textAlign: 'center', margin: '0 auto', flex: 1 }}>
            Entrada
          </h2>
        </div>

        {/* Formulario */}
        <form className="form-addUser" style={{ width: '75%' }}>
          {/* Puntos Analizados */}
          <label>Puntos Analizados:</label>
          <div className="input-container-add">
            <textarea
              name="puntosAnalizados"
              className="input-field"
              value={entrada.puntosAnalizados}
              onChange={handleInputChange}
              rows="3"
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

          {/* Asuntos Pendientes */}
          <label>Asuntos Pendientes:</label>
          <div className="input-container-add">
            <textarea
              name="asuntosPendientes"
              className="input-field"
              value={entrada.asuntosPendientes}
              onChange={handleInputChange}
              rows="3"
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

          {/* Observaciones */}
          <label>Observaciones:</label>
          <div className="input-container-add">
            <textarea
              name="observaciones"
              className="input-field"
              value={entrada.observaciones}
              onChange={handleInputChange}
              rows="3"
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

          {/* Botón Guardar */}
          <div
            className="buttons"
            style={{ marginTop: '20px', textAlign: 'center' }}
          >
            <button type="button" onClick={handleGuardarEntrada}>
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
