import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/FormularioCoordinador.module.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { FaEdit } from "react-icons/fa";

const FormularioEmpresa = () => {
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [empresaID, setEmpresaID] = useState('');
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
  
    useEffect(() => {
      const id = getQueryParam('id');
        if (id) {
          consultarEmpresa(id);;
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

  async function consultarEmpresa(id) {
    try {
      const { data, error } = await supabase
        .from('Empresa')
        .select(`
          id,
          nombre
        `)
        .eq('id',id);
      if (error) throw error;
      setEmpresa(data[0].nombre);
      setEmpresaID(data[0].id);
    } catch (err) {
      console.error('Error al consultar empresa:', err);
      alert('Error al consultar empresa: ' + err.message);
    }
  }

  async function crearContacto(e) {
    e.preventDefault();
    const confirmarEnvio = window.confirm(
      "¿Desea confirmar la nueva información del contacto actual?"
    );
    if (!confirmarEnvio) {
      return;
    }
    try {
      const repetido = await consultarRepetido(nombre);
      if(repetido == false){
        alert("Un contacto con ese nombre ya existe");
        return;
      }
      else{
        const { data, error } = await supabase
        .from('ContactoEmpresa')
        .insert({
          nombre: nombre,
          empresa_id: empresaID,
          departamento: puesto,
          correo: correo,
          telefono: telefono
        })
        .select();
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
      <Header title="Crear Contacto"/>
      <form className={styles.form} onSubmit={crearContacto}>
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
          <label>2. Empresa:</label>
          <input
            type="text"
            value={empresa}
            readOnly
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>3. Puesto:</label>
          <input
            type="text"
            value={puesto}
            onChange={(e) => setPuesto(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>4. Correo:</label>
          <input
            type="text"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>5. Teléfono:</label>
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
            Crear
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
