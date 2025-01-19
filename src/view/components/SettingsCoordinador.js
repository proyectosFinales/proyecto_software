/**SettingsCoordinador.js */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from './Modal';
import { supabase } from '../../model/Cliente'; // Ajusta la ruta a tu instancia Supabase
import styles from './SettingsMenu.module.css';
import modalEstilos from './SettingsCoordinador.module.css';

/**
 * SettingsCoordinador.jsx
 * - Opción para consultar el asesor (si el Anteproyecto está Aprobado).
 * - Opción para establecer la duración de las defensas (tabla "duraciones").
 */
const SettingsCoordinador = ({show}) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [asesorInfo, setAsesorInfo] = useState(null);

  // Para la funcionalidad "establecer duración"
  const [modalDuracion, setModalDuracion] = useState(false);
  const [duracion, setDuracion] = useState('');

  /**
   * Ejemplo de consulta para ver si el estudiante (sessionStorage.token)
   * tiene un Anteproyecto con estado "Aprobado". Luego buscamos su asesor
   * en la tabla "Estudiante".
   */
  async function consultarAsesor() {
    try {
      // 1. Buscar anteproyecto del estudiante
      const { data: anteproyecto, error: anteError } = await supabase
        .from('Anteproyecto')      // En tu nueva BD
        .select(`id, estudiante_id, estado`)
        .eq('estudiante_id', sessionStorage.getItem("token"))
        .eq('estado', 'Aprobado')
        .single();

      if (anteError || !anteproyecto) {
        setAsesorInfo("No se ha asignado un profesor asesor a su proyecto (o no está en estado 'Aprobado').");
        setModal(true);
        return;
      }

      // 2. Buscar en Estudiante el campo 'asesor'
      const { data: estudiante, error: estError } = await supabase
        .from('Estudiante')
        .select(`estudiante_id, asesor`)
        .eq('estudiante_id', anteproyecto.estudiante_id)
        .single();

      if (estError || !estudiante) {
        setAsesorInfo("No se pudo obtener la información del estudiante.");
        setModal(true);
        return;
      }
      if (!estudiante.asesor) {
        setAsesorInfo("No hay profesor asesor asignado todavía.");
        setModal(true);
        return;
      }

      // 3. Buscar datos del Profesor en la tabla "Profesor"
      const { data: profesor, error: profError } = await supabase
        .from('Profesor')
        .select(`
          profesor_id,
          cantidad_estudiantes,
          Usuario:id_usuario (
            nombre,
            correo,
            sede,
            telefono
          )
        `)
        .eq('profesor_id', estudiante.asesor)
        .single();

      if (profError || !profesor) {
        setAsesorInfo("No se pudo obtener la información del profesor asesor.");
        setModal(true);
        return;
      }

      // 4. Construir el mensaje
      setAsesorInfo(`
        Profesor(a): ${profesor.Usuario.nombre}
        Correo: ${profesor.Usuario.correo}
        Sede: ${profesor.Usuario.sede}
        Teléfono: ${profesor.Usuario.telefono || 'No registrado'}
      `);
    } catch (error) {
      setAsesorInfo("Error al consultar la información del asesor.");
    }

    // Mostramos el modal
    setModal(true);
  }

  /**
   * Ejemplo de guardar la duración de las defensas
   * en una tabla "duraciones" con un registro ID=1
   */
  async function cambiarDuracion(e) {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('duraciones')
        .update({ horas: duracion || 1 }) // Usa 'duracion' o 1 por defecto
        .eq('id', '1');                  // Ajusta a tu lógica real

      if (error) {
        alert('Error al actualizar la duración de las defensas: ' + error.message);
        return;
      }

      alert('Duración de las defensas actualizada con éxito a ' + (duracion || 1) + ' hora(s).');
      setModalDuracion(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  /**
   * Cierra sesión
   */
  function delSessionToken() {
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <>
    {/* Sidebar (o menú) */}
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
      <ul>
        <li className={styles.menuItem} onClick={consultarAsesor}>Consultar asesor</li>
        <li className={styles.menuItem} onClick={() => setModalDuracion(true)}>Establecer duración de las defensas</li>
        <li className={styles.menuItem} onClick={delSessionToken}>Cerrar sesión</li>
      </ul>
    </nav>

    {/* Modal para mostrar la info del asesor */}
    <Modal show={modal} onClose={() => setModal(false)}>
      <>
        <div className={modalEstilos.modal_titulo}>Información del Asesor</div>
        <div className={modalEstilos.contenedor}>
          <pre>{asesorInfo}</pre>
          <div className={modalEstilos.modal_buttons}>
            <button 
              className={`${modalEstilos.modal_button} ${modalEstilos.volver}`} 
              onClick={() => setModal(false)}
            >
              Volver
            </button>
          </div>
        </div>
      </>
    </Modal>

    {/* Modal para establecer duración */}
    <Modal show={modalDuracion} onClose={() => setModalDuracion(false)}>
      <>
        <div className={modalEstilos.modal_titulo}>Establecer duración de las defensas</div>
        <div className={modalEstilos.contenedor}>
          <label className={modalEstilos.modal_label}>
            La duración por defecto es de 1 hora. Si no ingresa valor, se usará la predeterminada.
          </label>
          <input
            type="number"
            className={modalEstilos.modal_input}
            placeholder="Duración en horas"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
          />
          <div className={modalEstilos.modal_buttons}>
            <button 
              className={`${modalEstilos.modal_button} ${modalEstilos.volver}`} 
              onClick={() => setModalDuracion(false)}
            >
              Volver
            </button>
            <button 
              className={`${modalEstilos.modal_button} ${modalEstilos.guardar}`} 
              onClick={cambiarDuracion}
            >
              Guardar
            </button>
          </div>
        </div>
      </>
    </Modal>
    </>
  );
};

export default SettingsCoordinador;
