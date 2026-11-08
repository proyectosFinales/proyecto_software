import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/FormularioEstudiante.module.css';
import supabase from '../../../model/supabase';
import Footer from '../../components/Footer';
import Header from '../../components/HeaderProfesor';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../../components/modal.jsx";

const ActaDefensa = () => {
  const [aprobacion, setAprobacion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [nombreProfesor, setNombreProfesor] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [profesor, setProfesor] = useState('');
  const [estudiante, setEstudiante] = useState('');
  const [semestre, setSemestre] = useState('');

  const navigate = useNavigate();
  const modalConf = useRef({});
  const user = JSON.parse(sessionStorage.getItem('USER'));
  const prof = JSON.parse(sessionStorage.getItem('PROFESSOR'));

  useEffect(() => {
    setProfesor(prof.profesor_id);
  }, []);

  useEffect(() => {
    if(profesor){
      consultarEstudiante();
    }
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
        console.log(`Error al consultar estudiante o usuario:  ${err.message}`);
        toast.error("Error al consultar información en la base de datos.");
      }
    }
  }

  async function solicitarCarta() {
    if (!estudiante) {
      toast.error("No se encontró un identificador de estudiante válido. No se puede insertar.");
      return;
    }

    try {
      const datos = {titulo: titulo, profesor: user.nombre, aprobacion: aprobacion}
      const { data, error } = await supabase
        .from('Acta')
        .insert({
          estudiante_id: estudiante,
          profesor_id: profesor,
          titulo: titulo,
          datos: datos,
          semestre: semestre,
          machote: "Acta de entrega de informe final"
        })
        .select();

      if (error){ 
        throw error;
      }
      toast.success('Acta solicitada exitosamente');
      navigate('/actas');
    } catch (err) {
      toast.error(`Error al insertar acta: ${err.message}`);
    }
  }

  const handleChange = (e) => {
    setEstudiante(e.target.value);
    const selectedDetails = Object.values(estudiantes).find(
      (estudiante) => estudiante.Estudiante.estudiante_id === estudiante
    );
  };

  async function handleModal(e){
    e.preventDefault();
    modalConf.open();
  }

  const handleGoBack = () => {
    navigate(-1); // Navega a la página anterior
  };

  return (
    <div>
      <Header title={"Solicitar acta de entrega de informe"}></Header>

      <Modal modalRef={modalConf} title={<h5>Solicitar Acta</h5>} onAccept={() => solicitarCarta()}>
        <p>¿Está seguro que desea solicitar el acta con la información actual?</p>
      </Modal>

      <form className={styles.form} onSubmit={handleModal}>
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
          <label>Nombre del Profesor:</label>
          <input
            type="text"
            disabled
            readOnly
            value={user.nombre}
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

        <div className={styles.formGroup}>
          <label>Aprueba o reprueba la entrega del proyecto para defensa:</label>
          <select value={aprobacion} onChange={(e) => setAprobacion(e.target.value)} required>
            <option value="" disabled>-- Seleccione una opción --</option>
            <option value={"Aprobado"}>Aprueba</option>
            <option value={"Reprobado"}>Reprueba</option>
          </select>
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
