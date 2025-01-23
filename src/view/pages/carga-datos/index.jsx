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
      <Header title="Carga de Datos" />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4">
        <div className="max-w-md w-full bg-white rounded shadow p-6 space-y-4">
          <h1 className="text-xl font-bold text-center">Opciones de Carga</h1>

          <div className="flex flex-col space-y-4">
            <Link
              to="/carga-datos/profesores"
              className="w-full bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700"
            >
              Registrar Profesores
            </Link>
            <Link
              to="/carga-datos/cantidad-proyectos-profesor"
              className="w-full bg-green-600 text-white py-2 rounded text-center hover:bg-green-700"
            >
              Cantidad Proyectos Profesor
            </Link>
          </div>

          <button
            onClick={() => setModal(true)}
            className="w-full mt-4 bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Reiniciar BD
          </button>
        </div>
      </div>
      <Modal show={modal} onClose={() => setModal(false)}>
        <>
          <h2>LEA CUIDADOSAMENTE!</h2>
          <p>
            ¿Está seguro(a) que quiere borrar toda la información de este semestre? 
            Si presiona el botón de eliminar se perderá permanentemente la información 
            del semestre actual. 
            Asegúrese de que ya no quiera realizar ninguna otra acción en el sistema 
            este semestre antes de borrar la base de datos.
          </p>
          <div className="modal-actions">
            <button className="cita-btn cita-btn-error w-50" onClick={ReiniciarBaseDatos}>
              Eliminar
            </button>
            <button className="cita-btn w-50" onClick={() => setModal(false)}>
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
