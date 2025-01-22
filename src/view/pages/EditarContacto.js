import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/FormularioCoordinador.module.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { FaEdit } from "react-icons/fa";

const FormularioEmpresa = () => {
  const [nombre, setNombre] = useState('');
  const [oldNombre, setOldNombre] = useState('');
  const [puesto, setPuesto] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contactoID, setContactoID] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const getQueryParam = (param) => {
      const params = new URLSearchParams(location.search);
      return params.get(param);
    };
  
    // Al montar, obtener el anteproyecto
    useEffect(() => {
      const id = getQueryParam('id');
      if (id) {
        consultarContacto(id);
      }
    }, [location]);

  async function consultarRepetido(name) {
    try {
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id          
        `)
        .eq('nombre', name);
      if (error) throw error;
      if(data.length==0){
        return true
      }
      else{
        return false;
      }
    } catch (err) {
      console.error('Error al consultar empresa:', err);
      alert('Error al consultar empresa: ' + err.message);
    }
  }

  async function consultarContacto(id) {
    try {
      const { data, error } = await supabase
        .from('ContactoEmpresa')
        .select(`
          id,
          nombre,
          departamento,
          correo,
          telefono
        `)
        .eq('id', id);
      if (error) throw error;
      setContactoID(data[0].id);
      setNombre(data[0].nombre);
      setOldNombre(data[0].nombre);
      setPuesto(data[0].departamento);
      setCorreo(data[0].correo);
      setTelefono(data[0].telefono);
    } catch (err) {
      console.error('Error al consultar contacto:', err);
      alert('Error al consultar contacto: ' + err.message);
    }
  }

  async function editarContacto(e) {
    e.preventDefault();
    const confirmarEnvio = window.confirm(
      "¿Desea confirmar la nueva información del contacto actual?"
    );
    if (!confirmarEnvio) {
      return;
    }
    try {
      const repetido = await consultarRepetido(nombre);
      if(repetido == false && nombre != oldNombre){
        alert("Un contacto con ese nombre ya existe");
        return;
      }
      else{
        const { data, error } = await supabase
        .from('ContactoEmpresa')
        .update({
          nombre: nombre,
          departamento: puesto,
          correo: correo,
          telefono: telefono
        })
        .eq('id',contactoID);
        navigate(-1);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error al editar contacto:', err);
      alert('Error al editar contacto: ' + err.message);
    }
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <Header title="Editar Contacto"/>
      <form className={styles.form} onSubmit={editarContacto}>
        <h2>Datos del contacto</h2>

        <div className={styles.formGroup}>
          <label>1. Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>2. Puesto:</label>
          <input
            type="text"
            value={puesto}
            onChange={(e) => setPuesto(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>3. Correo:</label>
          <input
            type="text"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>4. Teléfono:</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>

        <div className={styles.contenedor_botones_formCoordinador}>
          <button
            type="submit"
            className={`${styles.button} ${styles.aprobar}`}
          >
            Editar
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelar}`}
            onClick={handleGoBack}
          >
            Cancelar
          </button>
        </div>
      </form>
      <Footer />
    </div>
  );
};

export default FormularioEmpresa;
