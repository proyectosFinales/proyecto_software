import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from './SettingsMenu.module.css';
import Modal from './Modal';
import modalEstilos from './SettingsCoordinador.module.css'
import { supabase } from '../../model/Cliente';
import { useNavigate } from "react-router-dom";

const SettingsCoordinador = ({show}) => {
  const [modal, setModal] = useState(false);
  const [duracion, setDuracion] = useState('');
  const navigate = useNavigate();

  async function cambiarDuracion (e){
    e.preventDefault();

    const {data, error} = await supabase
      .from('duraciones')
      .update({horas: duracion})
      .eq('id', '1');

    if (error) {
      alert('Error al actualizar la duración de las defensas:', error);
      return;
    }

    alert('Duración de las defensas actualizada con éxito.');
    setModal(false);
  };

  function delSessionToken () {
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <>
    <nav className={show ? styles.sidebar : styles.sidebarHide}>
    <ul>
        <Link to="/editar-perfil" className={styles.menuItem}><li>Perfil</li></Link>
        <li className={styles.menuItem} onClick={() => setModal(true)}>Establecer duración de las defensas</li>
        <li className={styles.menuItem} onClick={delSessionToken}>Cerrar sesión</li>
    </ul>
    </nav>
    <Modal show={modal} onClose={() => setModal(false)}>
      {
      <>
        <div className={modalEstilos.modal_titulo}>Establecer duración de las defensas</div>
        <div className={modalEstilos.contenedor}>
          <label className={modalEstilos.modal_label}>La duración por defecto es de 1 hora, si no ingresa ningun valor, se usará esta duración.</label>
          <input 
            type="text" 
            className={modalEstilos.modal_input} 
            placeholder="Duración en horas"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)} 
          />
          <div className={modalEstilos.modal_buttons}>
            <button className={`${modalEstilos.modal_button} ${modalEstilos.volver}`} onClick={() => setModal(false)}>Volver</button>
            <button className={`${modalEstilos.modal_button} ${modalEstilos.guardar}`} onClick={cambiarDuracion}>Guardar</button>
          </div>
        </div>
      </>
      }
    </Modal>
    </>
  );
};

export default SettingsCoordinador;