import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/FormularioCoordinador.module.css';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { FaEdit } from "react-icons/fa";

const FormularioEmpresa = () => {
  const [nombre, setNombre] = useState('');
  const [oldNombre, setOldNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [distrito, setDistrito] = useState('');
  const [canton, setCanton] = useState('');
  const [provincia, setProvincia] = useState('');
  const [empresaID, setEmpresaID] = useState('');

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
        consultarEmpresa(id);
      }
    }, [location]);

  async function consultarRepetido(name) {
    try {
      const { data, error } = await supabase
        .from('Empresa')
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
          nombre,
          tipo,
          provincia,
          canton,
          distrito          
        `)
        .eq('id', id);
      if (error) throw error;
      setEmpresaID(data[0].id);
      setNombre(data[0].nombre);
      setOldNombre(data[0].nombre);
      setTipo(data[0].tipo);
      setProvincia(data[0].provincia);
      setCanton(data[0].canton);
      setDistrito(data[0].distrito);
    } catch (err) {
      console.error('Error al consultar empresa:', err);
      alert('Error al consultar empresa: ' + err.message);
    }
  }

  async function editarEmpresa(e) {
    e.preventDefault();
    const confirmarEnvio = window.confirm(
      "¿Desea crear una nueva empresa con la información actual?"
    );
    if (!confirmarEnvio) {
      return;
    }
    try {
      const repetido = await consultarRepetido(nombre);
      if(repetido == false && nombre != oldNombre){
        alert("Una empresa con ese nombre ya existe");
        return;
      }
      else{
        const { data, error } = await supabase
        .from('Empresa')
        .update({
          nombre: nombre,
          tipo: tipo,
          provincia: provincia,
          canton: canton,
          distrito: distrito
        })
        .eq('id',empresaID);
        navigate(-1);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Error al editar empresa:', err);
      alert('Error al editar empresa: ' + err.message);
    }
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <Header title="Editar Empresa"/>
      <form className={styles.form} onSubmit={editarEmpresa}>
        <h2>Datos de la empresa</h2>

        <div className={styles.formGroup}>
          <label>1. Nombre de la empresa:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>2. Tipo de empresa:</label>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Zona franca"
                checked={tipo === "Zona franca"}
                onChange={(e) => setTipo(e.target.value)}
                required
              />
              Zona franca
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Régimen definitivo"
                checked={tipo === "Régimen definitivo"}
                onChange={(e) => setTipo(e.target.value)}
                required
              />
              Régimen definitivo
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Perfeccionamiento activo"
                checked={tipo === "Perfeccionamiento activo"}
                onChange={(e) => setTipo(e.target.value)}
                required
              />
              Perfeccionamiento activo
            </label>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>3. Ubicación de la empresa (Provincia): *</label>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Heredia"
                checked={provincia === "Heredia"}
                onChange={(e) => setProvincia(e.target.value)}
                required
              />
              Heredia
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Alajuela"
                checked={provincia === "Alajuela"}
                onChange={(e) => setProvincia(e.target.value)}
                required
              />
              Alajuela
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Cartago"
                checked={provincia === "Cartago"}
                onChange={(e) => setProvincia(e.target.value)}
                required
              />
              Cartago
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="San José"
                checked={provincia === "San José"}
                onChange={(e) => setProvincia(e.target.value)}
                required
              />
              San José
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Limón"
                checked={provincia === "Limón"}
                onChange={(e) => setProvincia(e.target.value)}
                required
              />
              Limón
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Puntarenas"
                checked={provincia === "Puntarenas"}
                onChange={(e) => setProvincia(e.target.value)}
                required
              />
              Puntarenas
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>4. Cantón:</label>
          <input
            type="text"
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>5. Distrito:</label>
          <input
            type="text"
            value={distrito}
            onChange={(e) => setDistrito(e.target.value)}
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
