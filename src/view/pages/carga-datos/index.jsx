/**
 * InicioCargaDatos.jsx
 * Menú para registrar profesores, modificar cantidad de proyectos,
 * y cargar profesores disponibles para el próximo semestre.
 */
import { Link } from "react-router-dom";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";
import Modal from '../../components/Modal';
import React, { useState } from 'react';
// Ajusta la importación a tu propia instancia supabase
import supabase from '../../../model/supabase';

/**
 * Menú de carga de datos, con opción de "Cargar Próximo Semestre".
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

  const cargarProfesoresProxSemestre = async () => {
    if (!window.confirm('¿Está seguro(a) de que desea poner a los profesores actuales como disponibles para el próximo semestre?')) return;
    
    try {
      // Verificar que supabase esté disponible
      if (!supabase) {
        throw new Error('Cliente de Supabase no está inicializado');
      }

      console.log('Iniciando carga de profesores para próximo semestre...');

      // Calcular el próximo semestre
      const fecha = new Date();
      const añoActual = fecha.getFullYear();
      const mesActual = fecha.getMonth() + 1;
      const semestreActual = mesActual <= 7 ? 1 : 2;

      let semestreSiguiente, añoSiguiente;
      if (semestreActual === 1) {
        semestreSiguiente = 2;
        añoSiguiente = añoActual;
      } else {
        semestreSiguiente = 1;
        añoSiguiente = añoActual + 1;
      }

      console.log(`Próximo semestre: S${semestreSiguiente} ${añoSiguiente}`);

      // Obtener todos los profesores con timeout
      console.log('Obteniendo lista de profesores...');
      const { data: profesores, error: errorProfesores } = await Promise.race([
        supabase.from('Profesor').select('profesor_id'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al obtener profesores')), 10000)
        )
      ]);

      if (errorProfesores) {
        console.error('Error al obtener profesores:', errorProfesores);
        throw new Error(`No se pudo conectar con la base de datos. Verifique su conexión a internet.`);
      }

      if (!profesores || profesores.length === 0) {
        alert('No se encontraron profesores registrados.');
        setModal(false);
        return;
      }

      console.log(`Profesores encontrados: ${profesores.length}`);

      // Obtener todas las asignaciones existentes para el próximo semestre de una sola vez
      console.log('Verificando asignaciones existentes...');
      const { data: asignacionesExistentes, error: errorAsignaciones } = await Promise.race([
        supabase
          .from('AsignacionesProfesor')
          .select('idProfesor')
          .eq('semestre', semestreSiguiente)
          .eq('año', añoSiguiente),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al obtener asignaciones')), 10000)
        )
      ]);

      if (errorAsignaciones) {
        console.error('Error al obtener asignaciones:', errorAsignaciones);
        throw new Error(`Error al verificar asignaciones existentes.`);
      }

      // Crear un Set con los IDs de profesores que ya tienen asignación
      const profesoresConAsignacion = new Set(
        (asignacionesExistentes || []).map(a => a.idProfesor)
      );

      // Filtrar profesores que necesitan nueva asignación
      const profesoresSinAsignacion = profesores.filter(
        p => !profesoresConAsignacion.has(p.profesor_id)
      );

      console.log(`Profesores que ya tienen asignación: ${profesoresConAsignacion.size}`);
      console.log(`Profesores sin asignación: ${profesoresSinAsignacion.length}`);

      if (profesoresSinAsignacion.length === 0) {
        alert('Todos los profesores ya tienen asignación para el próximo semestre.');
        setModal(false);
        return;
      }

      // Crear las nuevas asignaciones en un solo insert
      const nuevasAsignaciones = profesoresSinAsignacion.map(profesor => ({
        idProfesor: profesor.profesor_id,
        semestre: semestreSiguiente,
        año: añoSiguiente,
        disponibilidad: 0,
        asignados: 0
      }));

      console.log('Insertando nuevas asignaciones...');
      const { error: errorInsertar } = await Promise.race([
        supabase
          .from('AsignacionesProfesor')
          .insert(nuevasAsignaciones),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout al insertar asignaciones')), 10000)
        )
      ]);

      if (errorInsertar) {
        console.error('Error al insertar asignaciones:', errorInsertar);
        throw new Error(`Error al crear las asignaciones: ${errorInsertar.message}`);
      }

      console.log(`Asignaciones creadas exitosamente: ${nuevasAsignaciones.length}`);

      alert(
        `Carga completada:\n` +
        `- Profesores con nueva asignación: ${nuevasAsignaciones.length}\n` +
        `- Profesores que ya tenían asignación: ${profesoresConAsignacion.size}\n` +
        `- Total procesados: ${profesores.length}`
      );

    } catch (error) {
      console.error('Error completo:', error);
      
      // Mensaje más específico según el tipo de error
      let mensaje = 'Error al cargar profesores: ';
      if (error.message.includes('Timeout')) {
        mensaje += 'La operación tardó demasiado. Verifique su conexión a internet e intente nuevamente.';
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        mensaje += 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      } else {
        mensaje += error.message || 'Error desconocido';
      }
      
      alert(mensaje);
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
            
            {/* Reset Database Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <button
                onClick={() => setModal(true)}
                className="w-full h-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 p-4 rounded-full mb-4">
                    <i className="fas fa-calendar-plus text-3xl text-green-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Cargar Próximo Semestre
                  </h3>
                  <p className="text-gray-600 text-center">
                    Profesores disponibles para el próximo semestre
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
              Confirmar Carga
            </h2>
            <p className="text-gray-600 mb-6">
              ¿Está seguro que desea poner a los profesores actuales como disponibles para el próximo semestre?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={cargarProfesoresProxSemestre}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                Confirmar Carga
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
