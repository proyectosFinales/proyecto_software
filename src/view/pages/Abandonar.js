/**
 * DarseDeBaja.jsx
 * Permite que un Estudiante cambie su anteproyecto/proyecto a estado "Retirado".
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Abandonar.module.css';
import supabase from '../../model/supabase';
import Footer from '../components/Footer';
import Header from '../components/HeaderEstudiante';

const DarseDeBaja = () => {
  const navigate = useNavigate();

  async function abandonarProyecto(e) {
    e.preventDefault();
    const confirmReprobar = window.confirm(
      "¿Está seguro/a que quiere DARSE DE BAJA del anteproyecto/proyecto?"
    );
    if(!confirmReprobar) return;

    try {
      const { error } = await supabase
        .from('Anteproyecto')               // Cambia 'anteproyectos' -> 'Anteproyecto'
        .update({ estado: "Retirado" })     // Asegúrate de que "Retirado" existe en tu enum
        .eq('estudiante_id', sessionStorage.getItem('token')) // Cambia 'idEstudiante' -> 'estudiante_id'
        .eq('semestre_id', 1);             // si usas 'semestre_id'; ajusta si no usas semestre
      if (error) {
        alert('Error al retirar anteproyecto/proyecto: ' + error.message);
        return;
      }

      alert('Anteproyecto/proyecto retirado exitosamente');
      navigate('/menuEstudiante');
    } catch (error) {
      alert('Error al retirar anteproyecto/proyecto: ' + error);
    }
  }

  return (
    <div>
      <Header title="Darse de baja"/>
      <div className={styles.contenedor}>
        <main>
          <div className={styles.contenedor_advertencia}>
            <h3>Advertencia</h3>
            <p className={styles.texto_advertencia}>
              Al presionar el botón "Darse de baja" usted estará abandonando el proyecto de graduación
              de la escuela de producción industrial para el semestre actual. Esta acción no se puede
              deshacer y debe ser tomada con precaución. Al darse de baja su perfil NO será eliminado 
              y su anteproyecto/proyecto se conservarán en el sistema con el estado de "Retirado". 
              La próxima vez que desee cursar el proyecto deberá crear un anteproyecto nuevo.
            </p>
            <p className={styles.texto_advertencia}>
              Si no está seguro de lo que está haciendo, no haga clic en el botón "Darse de baja" y abandone
              esta sección con el botón "Volver" o el menú lateral.
            </p>
          </div>
          <div className={styles.contenedor_botones}>
            <button
              className={styles.btn_darse_de_baja}
              onClick={abandonarProyecto}
            >
              Darse de baja
            </button>
            <button
              className={styles.btn_volver}
              onClick={() => navigate('/menuEstudiante')}
            >
              Volver
            </button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DarseDeBaja;
