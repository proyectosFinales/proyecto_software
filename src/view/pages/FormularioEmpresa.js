import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/FormularioCoordinador.module.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderCoordinador';
import { FaEdit } from "react-icons/fa";

const FormularioEmpresa = () => {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [distrito, setDistrito] = useState('');
  const [canton, setCanton] = useState('');
  const [provincia, setProvincia] = useState('');
  const [empresaID, setEmpresaID] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  async function consultarEmpresa(name) {
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

  async function crearEmpresa(e) {
    e.preventDefault();
    const confirmarEnvio = window.confirm(
      "¿Desea confirmar la nueva información de la empresa actual?"
    );
    if (!confirmarEnvio) {
      return;
    }
    try {
      const repetido = await consultarEmpresa(nombre);
      if(repetido == true){
        const { data, error } = await supabase
        .from('Empresa')
        .insert({
          nombre: nombre,
          tipo: tipo,
          provincia: provincia,
          canton: canton,
          distrito: distrito
        })
        .select();
        navigate(-1);
        if (error) throw error;
      }
      else{
        alert("Una empresa con ese nombre ya existe");
      }
    } catch (err) {
      console.error('Error al crear empresa:', err);
      alert('Error al crear empresa: ' + err.message);
    }
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <Header title="Crear Empresa"/>
      <form className={styles.form} onSubmit={crearEmpresa}>
        <h2>Datos de la nueva empresa</h2>

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
