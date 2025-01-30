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
  const [actividad, setActividadEmpresa] = useState('');
  const [activity, setActivity] = useState('');

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
          distrito,
          actividad          
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
      setActivity(data[0].actividad);
      if(data[0].actividad != 'Manufactura electrónica' && 
        data[0].actividad != 'Retail' &&  
        data[0].actividad != 'Servicio financiero' &&  
        data[0].actividad != 'Servicios del estado' &&
        data[0].actividad != 'Manufactura médica' && 
        data[0].actividad != 'Manufactura de alimentos' &&
        data[0].actividad != 'Manufactura comercial')
        {
          setActividadEmpresa("Otras");
        }
        else{
          setActividadEmpresa(data[0].actividad);
        }
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
    if(actividad == "Otras" && (activity == '' || activity == 'Otras')){
      alert("Debe ingresar la actividad de la empresa");
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
          distrito: distrito,
          actividad:activity
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

  const handleActividadChange = (e) => {
    setActividadEmpresa(e.target.value);
    setActivity(e.target.value);
  };

  const handleOtroChange = (e) => {
    setActivity(e.target.value);
  };

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
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="Empresa Pública"
                checked={tipo === "Empresa Pública"}
                onChange={(e) => setTipo(e.target.value)}
                required
              />
              Empresa pública
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="tipoEmpresa"
                value="PYME"
                checked={tipo === "PYME"}
                onChange={(e) => setTipo(e.target.value)}
                required
              />
              PYME
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
          <div>
            <label>
              <input
                type="radio"
                name="provinciaEmpresa"
                value="Guanacaste"
                checked={provincia === "Guanacaste"}
                onChange={(e) => setProvincia(e.target.value)}
                required
              />
              Guanacaste
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
        
        <div className={styles.formGroup}>
          <label>6. Actividad de la empresa: *</label>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Retail"
                checked={actividad === "Retail"}
                onChange={handleActividadChange}
                required
              />
              Retail
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Servicio financiero"
                checked={actividad === "Servicio financiero"}
                onChange={handleActividadChange}
                required
              />
              Servicio financiero
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Servicios del estado"
                checked={actividad === "Servicios del estado"}
                onChange={handleActividadChange}
                required
              />
              Servicios del Estado
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Manufactura de alimentos"
                checked={actividad === "Manufactura de alimentos"}
                onChange={handleActividadChange}
                required
              />
              Manufactura de alimentos
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Manufactura médica"
                checked={actividad === "Manufactura médica"}
                onChange={handleActividadChange}
                required
              />
              Manufactura médica
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Manufactura Comercial"
                checked={actividad === "Manufactura Comercial"}
                onChange={handleActividadChange}
                required
              />
              Manufactura comercial
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Manufactura electrónica"
                checked={actividad === "Manufactura electrónica"}
                onChange={handleActividadChange}
                required
              />
              Manufactura electrónica
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="actividadEmpresa"
                value="Otras"
                checked={actividad === "Otras"}
                onChange={handleActividadChange}
                required
              />
              Otras...
            </label>
          </div>
        </div>

        {(actividad === "Otras") && (
          <div className={styles.formGroup}>
            <label>Ingrese la actividad: *</label>
            <input
              type="text"
              value={activity}
              onChange={handleOtroChange}
              required
            />
          </div>
        )}

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
