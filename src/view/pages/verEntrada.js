/**
 * AgregarUsuario.jsx
 * Permite agregar estudiantes o profesores manualmente.
 * Llama a signUpNewUser(...) o registroProfesor(...).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarked } from 'react-icons/fa';
import '../styles/AgregarUsuario.css';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import supabase from '../../model/supabase';

const Entrada = () => {

    const [entrada, setEntrada] = useState({
      bitacora_id: '',
      fecha: '',
      contenido: '',
      aprobada_prof: false,
      aprobada_est: false,
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
    const entradaId = queryParams.id;
    const esProfesor = queryParams.esProfesor === 'true';

    useEffect(() => {

        const fetchEntrada = async () => {
            console.log(entradaId);
            try {
                const { data, error } = await supabase
                    .from('Entrada')
                    .select(`
                      bitacora_id,
                      fecha,
                      contenido,
                      aprobada_prof,
                      aprobada_est`)
                      .eq('id', entradaId);

                const cont = JSON.parse(data[0].contenido || "{}");

                setEntrada((prev) => ({
                    ...prev,
                    bitacora_id: data[0].bitacora_id,
                    fecha: data[0].fecha,
                    contenido: data[0].contenido,
                    aprobada_prof: data[0].aprobada_prof,
                    aprobada_est: data[0].aprobada_est,
                    puntosAnalizados: cont[0],
                    asuntosPendientes: cont[1],
                    observaciones: cont[2],
                }))

                if (error) {
                    throw new Error(error.message);
                }
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchEntrada();
    
    }, [entradaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntrada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardarBitacora = async () => {
    try {

      // Convertimos las entradas en un array y luego en string
      const cont = JSON.stringify([
        entrada.puntosAnalizados,
        entrada.asuntosPendientes,
        entrada.observaciones,
      ]);

      const { error } = await supabase
        .from('Entrada')
        .update({
          fecha: new Date().toISOString(),
          contenido: cont,
          aprobada_prof: false,
          aprobada_est: false,
        })
        .eq('id', entradaId);
  
      if (error) {
        throw new Error('Error al actualizar la entrada');
      }
  
      navigate('/bitacoras');
    } catch (error) {
      console.error('Error al actualizar la entrada:', error.message);
    }
  };

  const handleAprobarEntrada = async (esProfesor) => {
    // Crear una copia del estado actualizado
    const updatedEntrada = {
      ...entrada,
      aprobada_prof: esProfesor ? true : entrada.aprobada_prof,
      aprobada_est: esProfesor ? entrada.aprobada_est : true,
    };
  
    // Actualizar el estado con la copia local
    setEntrada(updatedEntrada);
  
    // Hacer la llamada a Supabase con la copia actualizada
    try {
      const { error } = await supabase
        .from('Entrada')
        .update({
          fecha: new Date().toISOString(),
          contenido: updatedEntrada.contenido,
          aprobada_prof: updatedEntrada.aprobada_prof,
          aprobada_est: updatedEntrada.aprobada_est,
        })
        .eq('id', entradaId);
  
      if (error) {
        throw new Error('Error al actualizar la entrada');
      }
  
      navigate('/bitacoras');
    } catch (error) {
      console.error('Error al actualizar la entrada:', error.message);
    }
  };
  

  return (
  <div className="agregar-usuario-container">
    <Header />
    <div 
      className="form-container" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '20px',
      }}
    >
      {/* Botón Volver y Título */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '75%',
          marginBottom: '20px',
        }}
      >
        <button
          className="btn-back-addUser"
          onClick={() => navigate("/bitacoras")}
          style={{ marginLeft: '10px' }}
        >
          Volver
        </button>
        <h2 style={{ textAlign: 'center', margin: '0 auto', flex: 1 }}>
          Entrada
        </h2>
      </div>

      {/* Formulario */}
      <form 
        className="form-addUser" 
        style={{ 
          width: '75%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px' 
        }}
      >
        {/* Fecha Última Actualización */}
        <label>Fecha última actualización:</label>
        <div className="input-container-add" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaMapMarked className="icon-add" />
          <input
            type="text"
            name="fecha"
            className="input-field"
            value={entrada.fecha}
            readOnly
            style={{ flex: 1 }}
          />
        </div>

        {/* Contenido */}
        <label>Puntos Analizados:</label>
        <div className="input-container-add" style={{ width: '100%' }}>
          <textarea
            name="puntosAnalizados"
            className="input-field"
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
            readOnly={entrada.aprobada_prof === true && entrada.aprobada_est === true}
          />
        </div>

        <label>Asuntos Pendientes:</label>
        <div className="input-container-add" style={{ width: '100%' }}>
          <textarea
            name="asuntosPendientes"
            className="input-field"
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
            readOnly={entrada.aprobada_prof === true && entrada.aprobada_est === true}
          />
        </div>

        <label>Observaciones:</label>
        <div className="input-container-add" style={{ width: '100%' }}>
          <textarea
            name="observaciones"
            className="input-field"
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
            readOnly={entrada.aprobada_prof === true && entrada.aprobada_est === true}
          />
        </div>

        {/* Botones */}
        <div 
          className="buttons" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            gap: '10px', 
            marginTop: '20px' 
          }}
        >
          {/* Botón Aprobar (Profesores) */}
          {entrada.aprobada_prof === false && esProfesor === true && (
            <button 
              type="button" 
              onClick={() => handleAprobarEntrada(true)} 
              style={{ flex: 1 }}
            >
              Aprobar
            </button>
          )}

          {/* Botón Aprobar (Estudiantes) */}
          {entrada.aprobada_est === false && esProfesor === false && (
            <button 
              type="button" 
              onClick={() => handleAprobarEntrada(false)} 
              style={{ flex: 1 }}
            >
              Aprobar
            </button>
          )}

          {/* Botón Guardar */}
          <button 
            type="button" 
            onClick={handleGuardarBitacora} 
            disabled={entrada.aprobada_prof === true && entrada.aprobada_est === true}
            style={{ flex: 1 }}
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

export default Entrada;
