import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Abandonar.module.css';
import { supabase } from '../../model/Cliente';
import Footer from '../components/Footer';
import Header from '../components/HeaderEstudiante';


const AprobarProyectos = () => {
    
    const navigate = useNavigate();

    async function abandonarProyecto (e) {
        e.preventDefault();
        const confirmReprobar=window.confirm("¿Está seguro/a que quiere DARSE DE BAJA del anteproyecto/proyecto?");
    
        if(!confirmReprobar){return;}
    
        try {
          const { data, error } = await supabase
            .from('anteproyectos')
            .update({estado:"Retirado"})
            .eq('idEstudiante', localStorage.getItem('token'));
          if (error) {
            alert('Error al retirar anteproyecto/proyecto:', error);
            return;
          }
    
          alert('Anteproyecto/proyecto retirado exitosamente');
          navigate('/menuEstudiante');
        } catch (error) {
          alert('Error al retirar anteproyecto/proyecto:', error);
        }
      }

  return (
    <div>
        <Header title="Darse de baja"/> 
      <div className={styles.contenedor}>
        <main>
          <div className={styles.contenedor_advertencia}>
            <h3>Advertencia</h3>
            <p className={styles.texto_advertencia}>Al presionar el botón "Darse de baja" usted estará abandonando el proyecto de graduación
                de la escuela de producción industrial para el semestre actual. Esta acción no se puede deshacer y debe ser tomada con
                precaución. Al darse de baja su perfil NO será eliminado y su anteproyecto/proyecto se conservarán en el sistema con
                el estado de "Retirado", sin embargo la próxima vez que desee cursar el proyecto deberá volver a crear un anteproyecto nuevo. 
                </p>
            <p className={styles.texto_advertencia}> Si no está seguro de lo que está haciendo, no haga clic en el botón "Darse de baja" y abandone
                esta sección de la página a través del botón "Volver" o a través del menú lateral izquierdo.
            </p>
            </div>
            <div className={styles.contenedor_botones}>
            <button className={styles.btn_darse_de_baja} onClick={abandonarProyecto}>Darse de baja</button>
            <button className={styles.btn_volver} onClick={() => navigate('/menuEstudiante')}>Volver</button>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AprobarProyectos;
