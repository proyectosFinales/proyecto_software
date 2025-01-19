/*SettingsEStudiante.js */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from './SettingsMenu.module.css';
import { useNavigate } from "react-router-dom";
import Modal from './Modal';
import { supabase } from '../../model/Cliente';
import modalEstilos from './SettingsCoordinador.module.css'

const SettingsCoordinador = ({show}) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [asesorInfo, setAsesorInfo] = useState(null);

  async function consultarAsesor() {
    try {
      // Consulta para verificar si el anteproyecto tiene un `idEncargado`
      const { data: anteproyecto, error: anteproyectoError } = await supabase
        .from('anteproyectos')
        .select(`id,
          idEncargado`
        )
        .eq('idEstudiante', sessionStorage.getItem("token"))
        .eq('estado', 'Aprobado')
        .single();

      if (anteproyectoError || !anteproyecto?.idEncargado) {
        setAsesorInfo("No se ha asignado un profesor asesor a su proyecto.");
        setModal(true);
        return;
      }

      // Si existe un idEncargado, consultar la tabla `profesores`
      const { data: profesor, error: profesorError } = await supabase
        .from('profesores')
        .select('nombre, telefono')
        .eq('id', anteproyecto.idEncargado)
        .single();

      if (profesorError || !profesor) {
        setAsesorInfo("No se pudo obtener la información del asesor.");
        setModal(true);
        return;
      }

      // Si existe un idEncargado, consultar la tabla `profesores`
      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('correo, sede')
        .eq('id', anteproyecto.idEncargado)
        .single();

      if (usuarioError || !usuario) {
        setAsesorInfo("No se pudo obtener la información del asesor.");
        setModal(true);
        return;
      }

      // Configurar la información del asesor
      setAsesorInfo(`
        Nombre: ${profesor.nombre}
        Sede: ${usuario.sede} 
        Correo: ${usuario.correo} 
        Telefono: ${profesor.telefono}
      `);
    } catch (error) {
      setAsesorInfo("Error al consultar la información del asesor.");
    }

    setModal(true);
  }

  function delSessionToken () {
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <>
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/editar-perfil" className={styles.menuItem}><li>Perfil</li></Link>
        <Link to="/darseBaja" className={styles.menuItem}><li>Darse de baja</li></Link>
        <li className={styles.menuItem} onClick={consultarAsesor}>Consultar asesor</li>
        <li className={styles.menuItem} onClick={delSessionToken}>Cerrar sesión</li>
    </ul>
    </nav>
    <Modal show={modal} onClose={() => setModal(false)}>
    {
    <>
      <div className={modalEstilos.modal_titulo}>Información del Asesor</div>
        <div className={modalEstilos.contenedor}>
          <pre>{asesorInfo}</pre>
          <div className={modalEstilos.modal_buttons}>
            <button className={`${modalEstilos.modal_button} ${modalEstilos.volver}`} onClick={() => setModal(false)}>
              Volver
            </button>
          </div>
      </div>
    </>
    }
  </Modal>
  </>
  );
};

export default SettingsCoordinador;