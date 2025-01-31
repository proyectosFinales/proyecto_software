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

  // Función para realizar un borrado en cascada en las tablas relacionadas en la base de datos.
  // Se elimina **todos** los registros de las tablas que no deben mantenerse, 
  // asegurando que las relaciones de claves foráneas se resuelvan correctamente.
  //
  // Tablas que **se borran**:
  // - 'anteproyecto', 'bitacora', 'entrada', 'anteproyectocontacto', 'avance', 
  // - 'proyecto', 'semestre', 'contactoempresa' 
  // - además de los registros de 'acta', 'usuario', 'profesor', 'estudiante'.
  //
  // Las tablas que **se mantienen** (no se borran):
  // - 'Categoria', 'Machote', 'Acta', 'ContactosEmpresa', 'Empresa', 'Calificaciones'
  //
  // Cada eliminación de registros se realiza de manera secuencial para garantizar la consistencia de los datos y la resolución de las dependencias entre tablas.
  // Si ocurre un error en cualquier paso, el proceso se detiene y se lanza un error con el mensaje correspondiente.

  const ReiniciarBaseDatos = async () => {
    if (!window.confirm('¿Está seguro(a) de que desea eliminar los registros?')) return;
  
    try {
      // Borrar dependencias de Anteproyecto primero
      const { error: anteproyectoContactoError } = await supabase
        .from('AnteproyectoContacto')
        .delete();
      if (anteproyectoContactoError) throw anteproyectoContactoError;
  
      const { error: correccionesError } = await supabase
        .from('Correcciones')
        .delete();
      if (correccionesError) throw correccionesError;
  
      // Ahora sí se puede borrar Anteproyecto
      const { error: anteproyectoError } = await supabase
        .from('Anteproyecto')
        .delete();
      if (anteproyectoError) throw anteproyectoError;
  
      // Borrar dependencias de Bitácoras primero
      const { error: entradaError } = await supabase
        .from('Entrada')
        .delete();
      if (entradaError) throw entradaError;
  
      // Ahora se puede borrar Bitácora
      const { error: bitacoraError } = await supabase
        .from('Bitacora')
        .delete();
      if (bitacoraError) throw bitacoraError;
  
      // Borrar Avances del Proyecto
      const { error: avanceError } = await supabase
        .from('Avance')
        .delete();
      if (avanceError) throw avanceError;
  
      // Borrar SolicitudCarta antes de profesores y estudiantes
  
      const { error: solicitudCartaError } = await supabase
        .from('SolicitudCarta')
        .delete();
      if (solicitudCartaError) throw solicitudCartaError;

      const {error: CalificacionError} = await supabase
        .from('Calificacion')
        .delete();

      if(CalificacionError) throw CalificacionError;

      const {error: citaError} = await supabase
        .from('Cita')
        .delete();

      if(citaError) throw citaError;
  
      // Borrar Proyecto antes de los semestres (aunque los semestres no se eliminarán)
      const { error: proyectoError } = await supabase
        .from('Proyecto')
        .delete();
      if (proyectoError) throw proyectoError;
  
      // Borrar Calendario en lugar de Evento
      const { error: calendarioError } = await supabase
        .from('Calendario')
        .delete();
      if (calendarioError) throw calendarioError;
  
      console.log('Borrado en cascada completado correctamente');
    } catch (error) {
      console.error('Error durante el borrado en cascada:', error.message);
      alert('Error durante el borrado en cascada: ' + error.message);
    }
    setModal(false);
  };
  

  return (
    <>
      <Header title="Menú de Carga de Datos"/>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Menú de Carga de Datos
            </h1>
            <p className="text-gray-600">
              Gestione la información del sistema
            </p>
          </div>

          {/* Main Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Reset Database Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <button
                onClick={() => setModal(true)}
                className="w-full h-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-red-100 p-4 rounded-full mb-4">
                    <i className="fas fa-database text-3xl text-red-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Reiniciar Base de Datos
                  </h3>
                  <p className="text-gray-600 text-center">
                    Limpiar datos del semestre anterior
                  </p>
                </div>
              </button>
            </div>

            {/* Load Professors Card - Updated path */}
            <Link 
              to="/carga-datos/profesores"  // Changed from /carga-profesores
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6 h-full">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <i className="fas fa-users text-3xl text-blue-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Cargar Profesores
                  </h3>
                  <p className="text-gray-600 text-center">
                    Importar lista de profesores
                  </p>
                </div>
              </div>
            </Link>

            {/* Project Quantity Card */}
            <Link 
              to="/carga-datos/cantidad-proyectos"
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 md:col-span-2"
            >
              <div className="p-6 h-full">
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 p-4 rounded-full mb-4">
                    <i className="fas fa-tasks text-3xl text-green-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Cantidad de Proyectos
                  </h3>
                  <p className="text-gray-600 text-center">
                    Gestionar límites de proyectos por profesor
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Footer Text */}
          <div className="text-center text-gray-600 mt-8">
            <p className="font-medium">
              Instituto Tecnológico de Costa Rica
            </p>
          </div>
        </div>

        {/* Modal */}
        <Modal show={modal} onClose={() => setModal(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirmar Reinicio
            </h2>
            <p className="text-gray-600 mb-6">
              ¿Está seguro que desea reiniciar la base de datos? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={ReiniciarBaseDatos}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Confirmar Reinicio
              </button>
            </div>
          </div>
        </Modal>
      </div>
      <Footer />
    </>
  );
};

export default InicioCargaDatos;
