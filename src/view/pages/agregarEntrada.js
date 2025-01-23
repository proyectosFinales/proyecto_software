import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaEnvelope, FaMapMarked } from 'react-icons/fa';
import '../styles/AgregarUsuario.css';
import Header from '../components/HeaderCoordinador';
import Footer from '../components/Footer';
import supabase from '../../model/supabase';

const AgregarEntrada = () => {

    const [entrada, setEntrada] = useState({
      contenido: '',
    });

    const navigate = useNavigate();
    const location = useLocation();

    const getQueryParams = (query) => {
    return Object.fromEntries(new URLSearchParams(query));
    };

    const queryParams = getQueryParams(location.search);
    const bitacoraId = queryParams.id;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntrada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLimpiarEntradas = () => {
    setEntrada({
      contenido: '',
    });
  };

  const handleGuardarEntrada = async () => {
    console.log('Guardar bitacora');
    try {
      const { error } = await supabase
        .from('Entrada')
        .insert([
          {
              bitacora_id: bitacoraId,
              contenido: entrada.contenido,
              fecha: new Date().toISOString(),
              aprobada_prof: false,
              aprobada_est: false
          }
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
    <Header />
    <div className="form-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <button
          className="btn-back-addUser"
          onClick={() => navigate("/bitacoras")}
          style={{ marginLeft: '10px' }}
        >
          Volver
        </button>
        <h2 style={{ textAlign: 'center', margin: '0 auto', flex: 1 }}>Entrada</h2>
      </div>
  
      {/* Formulario */}
      <form className="form-addUser" style={{ width: "75%" }}>
        
        {/* Contenido */}
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
          />
        </div>
  
        {/* Botón Guardar */}
        <div className="buttons" style={{ marginTop: '20px', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={handleGuardarEntrada} 
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
