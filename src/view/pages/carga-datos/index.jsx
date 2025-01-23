/**
 * InicioCargaDatos.jsx
 * Menú para registrar profesores, modificar cantidad de proyectos,
 * y reiniciar (limpiar) datos de un semestre anterior.
 */
import { Link } from "react-router-dom";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";
import Modal from '../../components/Modal';
import React, { useState } from 'react';
// Ajusta la importación a tu propia instancia supabase
import { supabase } from '../../../model/Cliente';

/**
 * Menú de carga de datos, con opción de "Reiniciar Base de Datos".
 */
const InicioCargaDatos = () => {
  const [modal, setModal] = useState(false);

  /**
   * Ejemplo de limpieza de la BD:
   * - Buscamos Anteproyectos con estado "Finalizado"
   * - Eliminamos sus estudiantes en 'Usuario'
   * - Borramos disponibilidad, etc.
   * - Actualizamos 'semestre_id' a 0 o nulo en Anteproyecto, Cita
   */
  const ReiniciarBaseDatos = async () => {
    if (!window.confirm('¿Está seguro(a) de que desea eliminar los registros?')) return;
    try {
      // 1. Anteproyectos finalizados => obtener sus estudiante_id
      const { data: anteFinalizados, error: anteFinalError } = await supabase
        .from('Anteproyecto')
        .select('estudiante_id')
        .eq('estado', 'Finalizado'); // Ajusta si en tu enum existe "Finalizado"

      if (anteFinalError) throw anteFinalError;

      // 2. Tomar esos estudiante_id y borrar de 'Usuario'
      const idEstudiantes = anteFinalizados.map(a => a.estudiante_id);
      if (idEstudiantes.length > 0) {
        const { error: userDeleteError } = await supabase
          .from('Usuario')
          .delete()
          .in('id', idEstudiantes);

        if (userDeleteError) throw userDeleteError;
      }

      // 3. Borrar todas las disponibilidades
      //    (antes se llamaba 'disponibilidadCitas', ahora 'Disponibilidad').
      const { error: dispError } = await supabase
        .from('Disponibilidad')
        .delete()
        .neq('id', '-1'); // Si tenías esa lógica especial, sino quítalo

      if (dispError) throw dispError;

      // 4. Actualizar Anteproyecto para limpiar semestres
      const { error: anteUpdateError } = await supabase
        .from('Anteproyecto')
        .update({ /* semestre_id: null */ })
        // .eq('semestre_id', 1)  // si manejas semestres con ID=1
        .neq('id', ''); // Para forzar actualizaciones, ajusta tu lógica

      if (anteUpdateError) throw anteUpdateError;

      // 5. Actualizar Cita (antes 'citas')
      const { error: citaUpdateError } = await supabase
        .from('Cita')
        .update({ /* semestre_id: null */ })
        // .eq('semestre_id', 1)
        .neq('cita_id', ''); // ajusta a tu lógica
      if (citaUpdateError) throw citaUpdateError;

      alert('Los registros han sido limpiados correctamente.');
    } catch (error) {
      console.error('Error al eliminar registros:', error);
      alert('Hubo un error al eliminar los registros.');
    }
  };

  return (
    <>
      <Header title="Base de datos" />
      <div className="menu-grid" style={{textAlign: "center"}}>
        <Link 
          className="menu-item" 
          to="/carga-datos/profesores"
          style={{textDecoration: "none", color: "var(--azul)"}}
        >
          <i className="fa-solid fa-users" style={{color: "var(--azul)"}}></i>
          <p>Cargar profesores</p>
        </Link>
        <Link 
          className="menu-item" 
          to="/carga-datos/cantidad-proyectos"
          style={{textDecoration: "none", color: "var(--azul)"}}
        >
          <i className="fa-solid fa-list-ol" style={{color: "var(--azul)"}}></i>
          <p>Cantidad de proyectos</p>
        </Link>
        <div 
          className="menu-item"
          onClick={() => setModal(true)}
          style={{cursor: "pointer", color: "var(--azul)"}}
        >
          <i className="fa-solid fa-trash" style={{color: "var(--azul)"}}></i>
          <p>Reiniciar Base de Datos</p>
        </div>
      </div>

      <Modal show={modal} onClose={() => setModal(false)}>
        <>
          <h2>¿Está seguro?</h2>
          <p>
            Esta acción eliminará todos los datos del semestre actual. 
            Asegúrese de que ya no quiera realizar ninguna otra acción en el sistema 
            este semestre antes de borrar la base de datos.
          </p>
          <div className="modal-actions">
            <button 
              className="cita-btn cita-btn-error w-50" 
              onClick={ReiniciarBaseDatos}
            >
              Eliminar
            </button>
            <button 
              className="cita-btn w-50" 
              onClick={() => setModal(false)}
            >
              Cancelar
            </button>
          </div>
        </>
      </Modal>
      <Footer />
    </>
  );
};

export default InicioCargaDatos;
