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

                setEntrada((prev) => ({
                    ...prev,
                    bitacora_id: data[0].bitacora_id,
                    fecha: data[0].fecha,
                    contenido: data[0].contenido,
                    aprobada_prof: data[0].aprobada_prof,
                    aprobada_est: data[0].aprobada_est
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

  const handleLimpiarEntradas = () => {
    console.log('Limpiar entradas');
  };

  const handleGuardarBitacora = async () => {
    try {
      const { error } = await supabase
        .from('Entrada')
        .update({
          fecha: new Date().toISOString(),
          contenido: entrada.contenido,
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
      <div className="form-container">
        <button
          className="btn-back-addUser"
          onClick={() => navigate("/bitacoras")}
        >
          Volver
        </button>
        <h2>Entrada</h2>

        <form className="form-addUser" style={{ width: "75%"}}>
          <label>Fecha ultima actualizacion:</label>
          <div className="input-container-add">
            <FaMapMarked className="icon-add" />
            <input
              type="text"
              name="fecha"
              className="input-field"
              value={entrada.fecha}
              readOnly
            />
        </div>


        <label>Contenido:</label>
        <div className="input-container-add">
        <textarea
          name="contenido"
          className="input-field"
          value={entrada.contenido}
          onChange={handleInputChange}
          rows="4"
          style={{
            resize: "none",
            width: "100%",
            height: "auto",
            overflow: "hidden",
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          readOnly={(entrada.aprobada_prof === true) && (entrada.aprobada_est === true)}
        />
        
        </div>


        <div className="buttons">
          {(entrada.aprobada_prof === false) && (esProfesor === true) && (
            <button type="button" onClick={() => handleAprobarEntrada(true)}>
              Aprobar
            </button>
          )}

          {(entrada.aprobada_est === false) && (esProfesor === false) && (
            <button type="button" onClick={() => handleAprobarEntrada(false)}>
              Aprobar
            </button>
          )}
          <button type="button" onClick={handleGuardarBitacora} disabled={(entrada.aprobada_prof === true) && (entrada.aprobada_est === true)}>
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
