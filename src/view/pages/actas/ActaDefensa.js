import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/FormularioEstudiante.module.css';
import supabase from '../../../model/supabase';
import Footer from '../../components/Footer';
import Header from '../../components/HeaderProfesor';
import { errorToast, successToast } from '../../components/toast';

const ActaDefensa = () => {
  const [aprobacion, setAprobacion] = useState('');
  const [razon, setRazon] = useState('');
  const [nota, setNota] = useState('');
  const [titulo, setTitulo] = useState('');
  const [persona1, setP1] = useState('');
  const [persona2, setP2] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [profesor, setProfesor] = useState('');
  const [estudiante, setEstudiante] = useState('');
  const [semestre, setSemestre] = useState('');
  const [dias, setDias] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    consultarProfesor();
  }, []);

  useEffect(() => {
    consultarEstudiante();
  }, [profesor]);

  async function consultarEstudiante() {
    if(profesor!=""){
      try {
        const { data, error } = await supabase
          .from('Proyecto')
          .select(`
            estudiante_id,
            Estudiante:Estudiante!proyecto_estudiante_id_fkey (
              estudiante_id,
              Usuario:id_usuario (
                nombre,
                sede
              )
            )
          `)
          .eq('profesor_id', profesor);
        if (error) throw error;
        setEstudiantes(data);
      } catch (err) {
        console.error('Error al consultar estudiante o usuario', err);
        errorToast('Error al consultar estudiante o usuario: ' + err.message);
      }
    }
  }

  async function consultarProfesor() {
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
          Profesor:Profesor!Profesor_id_usuario_fkey (
            profesor_id
          )
        `)
        .eq('id', userToken)
        .single();
      if (error) throw error;
      if (!data) {
        errorToast('No se encontró la información del usuario/profesor.');
        return;
      }
      if (data.Profesor) {
        setProfesor(data.Profesor[0].profesor_id);
      } else {
        errorToast('Este usuario no está registrado como profesor.');
      }
    } catch (err) {
      console.error('Error al consultar estudiante o usuario', err);
      errorToast('Error al consultar estudiante o usuario: ' + err.message);
    }
  }

  async function solicitarCarta(e) {
    e.preventDefault();
    const confirmarEnvio = window.confirm(
      "¿Está seguro que desea solicitar el acta con la información actual?"
    );
    if (!confirmarEnvio) {
      return;
    }
    if (!estudiante) {
      errorToast("No se encontró un 'estudiante_id' válido. No se puede insertar.");
      return;
    }

    try {
      const datos = {razon: razon, aprobacion: aprobacion, nota: nota, dias: dias, persona1: persona1, persona2: persona2}
      const { data, error } = await supabase
        .from('Acta')
        .insert({
          estudiante_id: estudiante,
          profesor_id: profesor,
          titulo: titulo,
          datos: datos,
          semestre: semestre,
          machote: "Acta de defensa pública"
        })
        .select();

      if (error){ 
        throw error;
      }
      successToast('Acta solicitada exitosamente');
      navigate('/actas');
    } catch (err) {
      console.error('Error al insertar acta:', err);
      errorToast('Error al insertar acta: ' + err.message);
    }
  }

  const handleChange = (e) => {
    setEstudiante(e.target.value);
    const selectedDetails = Object.values(estudiantes).find(
      (estudiante) => estudiante.Estudiante.estudiante_id === estudiante
    );
  };

  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  return (
    <div>
      <Header title={"Solicitar acta de defensa"}></Header>

      <form className={styles.form} onSubmit={solicitarCarta}>
        <h2>Datos del acta</h2>

        <div className={styles.formGroup}>
          <label htmlFor="dropdown">Estudiante: </label>
          <select id="dropdown" value={estudiante} onChange={handleChange} required>
            <option value="">-- Seleccione un estudiante --</option>
            {Object.entries(estudiantes).map(([key, estudiante]) => (
              <option key={estudiante.Estudiante.estudiante_id} value={estudiante.Estudiante.estudiante_id}>
                {estudiante.Estudiante.Usuario.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Título del proyecto:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Aprobación:</label>
          <div>
            <label>
              <input
                type="radio"
                name="aprobacion"
                value="Aprobado"
                onChange={(e) => setAprobacion(e.target.value)}
                required
              />
              Aprobado
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="aprobacion"
                value="Correccion"
                onChange={(e) => setAprobacion(e.target.value)}
                required
              />
              Aprobado sujeto a modificaciones
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="aprobacion"
                value="Reprobado"
                onChange={(e) => setAprobacion(e.target.value)}
                required
              />
              Reprobado
            </label>
          </div>
        </div>
        {(aprobacion === "Correccion") && (
          <div className={styles.formGroup}>
            <label>Días para realizar las modificaciones:</label>
            <input
              type="number"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              required
            />
          </div>
        )}
        {(aprobacion === "Reprobado") && (
        <div className={styles.formGroup}>
          <label>Motivos de reprobación:</label>
          <textarea
            type="text"
            value={razon}
            onChange={(e) => setRazon(e.target.value)}
            required
          />
        </div>
        )}

        <div className={styles.formGroup}>
          <label>Nota</label>
          <input
            type="number"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Primer miembro del tribunal:</label>
          <input
            type="text"
            value={persona1}
            onChange={(e) => setP1(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Segundo miembro del tribunal:</label>
          <input
            type="text"
            value={persona2}
            onChange={(e) => setP2(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Semestre:</label>
          <div>
            <label>
              <input
                type="radio"
                name="semestre"
                value="I"
                onChange={(e) => setSemestre(e.target.value)}
                required
              />
              I
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="semestre"
                value="II"
                onChange={(e) => setSemestre(e.target.value)}
                required
              />
              II
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

export default ActaDefensa;
