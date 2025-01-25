import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/FormularioEstudiante.module.css';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import { errorToast, successToast } from '../components/toast';

const EstudianteForm = () => {
  const [nombre, setNombre] = useState('');
  const [carnet, setCarnet] = useState('');
  const [cedula, setCedula] = useState('');
  const [sede, setSede] = useState('');

  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [generoE, setGeneroE] = useState('');
  const [generoR, setGeneroR] = useState('');
  const [puestoR, setPuestoR] = useState('');
  const [nombreR, setNombreR] = useState('');
  const [apellidosR, setApellidosR] = useState('');
  const [idioma, setIdioma] = useState('');

  const navigate = useNavigate();

  const [estudianteId, setEstudianteId] = useState(null);

  useEffect(() => {
    consultarEstudiante();
  }, []);
  async function consultarEstudiante() {
    try {
      const userToken = sessionStorage.getItem('token');
      const { data, error } = await supabase
        .from('Usuario')
        .select(`
          id,
          sede,
          correo,
          telefono,
          nombre,
          Estudiante:Estudiante!Estudiante_id_usuario_fkey (
            estudiante_id,
            carnet
          )
        `)
        .eq('id', userToken)
        .single();
      if (error) throw error;
      if (!data) {
        errorToast('No se encontró la información del usuario/estudiante.');
        return;
      }
      setSede(data.sede || '');

      if (data.Estudiante) {
        setEstudianteId(data.Estudiante[0].estudiante_id);
        setNombre(data.nombre || '');
        setCarnet(data.Estudiante[0].carnet || '');
      } else {
        errorToast('Este usuario no está registrado como estudiante.');
      }
    } catch (err) {
      console.error('Error al consultar estudiante o usuario', err);
      errorToast('Error al consultar estudiante o usuario: ' + err.message);
    }
  }

  async function solicitarCarta(e) {
    e.preventDefault();
    const confirmarEnvio = window.confirm(
      "¿Está seguro que desea la carta con la información actual?"
    );
    if (!confirmarEnvio) {
      return;
    }
    if (!estudianteId) {
      errorToast("No se encontró un 'estudiante_id' válido. No se puede insertar.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('SolicitudCarta')
        .insert({
          id_estudiante: estudianteId,
          nombre_receptor: nombreR,
          puesto_receptor: puestoR,
          empresa: nombreEmpresa,
          genero_emisor: generoE,
          genero_receptor: generoR,
          apellidos_receptor: apellidosR,
          cedula: cedula,
          idioma: idioma
        })
        .select();

      if (error){ 
        throw error;
      }
      successToast('Carta solicitada exitosamente');
      navigate('/cartasEstudiante');
    } catch (err) {
      console.error('Error al insertar carta:', err);
      errorToast('Error al insertar carta: ' + err.message);
    }
  }

  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  return (
    <div>
      <header className={styles.header_estudiante}>
        <h1>Solicitar Carta</h1>
      </header>

      <form className={styles.form} onSubmit={solicitarCarta}>
        <h2>Datos del estudiante</h2>

        <div className={styles.formGroup}>
          <label>1. Nombre del estudiante:</label>
          <input
            type="text"
            value={nombre}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>2. Carnet:</label>
          <input
            type="text"
            value={carnet}
            readOnly
          />
        </div>

        <div className={styles.formGroup}>
          <label>3. Cédula:</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <div>
            <label>
              <input
                type="radio"
                name="generoE"
                value="Masculino"
                onChange={(e) => setGeneroE(e.target.value)}
                required
              />
              Masculino
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="generoE"
                value="Femenino"
                onChange={(e) => setGeneroE(e.target.value)}
                required
              />
              Femenino
            </label>
          </div>

          <div>
            <label>
              <input
                type="radio"
                name="generoE"
                value="Neutral"
                onChange={(e) => setGeneroE(e.target.value)}
                required
              />
              Prefiero no decir
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>4. Sede:</label>
          <input
            type="text"
            value={sede}
            readOnly
          />
        </div>

        <h2>Datos del receptor</h2>
        <div className={styles.formGroup}>
          <label>5. Nombre:</label>
          <input
            type="text"
            value={nombreR}
            onChange={(e) => setNombreR(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>6. Apellidos:</label>
          <input
            type="text"
            value={apellidosR}
            onChange={(e) => setApellidosR(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <div>
            <label>
              <input
                type="radio"
                name="generoR"
                value="Señor"
                onChange={(e) => setGeneroR(e.target.value)}
                required
              />
              Señor
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="generoR"
                value="Señora"
                onChange={(e) => setGeneroR(e.target.value)}
                required
              />
              Señora
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>7. Nombre de la empresa:</label>
          <input
            type="text"
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>8. Puesto:</label>
          <input
            type="text"
            value={puestoR}
            onChange={(e) => setPuestoR(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>9. Idioma:</label>
          <div>
            <label>
              <input
                type="radio"
                name="idioma"
                value="Español"
                onChange={(e) => setIdioma(e.target.value)}
                required
              />
              Español
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="idioma"
                value="Inglés"
                onChange={(e) => setIdioma(e.target.value)}
                required
              />
              Inglés
            </label>
          </div>
        </div>

        <div className={styles.contenedorBotonesFormEstudiante}>
          <button type="submit" className={`${styles.button} ${styles.enviar}`}>
            Solicitar
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

export default EstudianteForm;
