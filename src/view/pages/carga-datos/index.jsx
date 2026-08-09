/**
 * InicioCargaDatos.jsx
 * Menú para registrar profesores, modificar cantidad de proyectos,
 * y completar filas de AsignacionesProfesor por semestre.
 */
import { Link } from "react-router-dom";
import Header from "../../components/HeaderCoordinador";
import Footer from "../../components/Footer";
import Modal from '../../components/Modal';
import React, { useState } from 'react';
import supabase from '../../../model/supabase';

const getSemestresReferencia = () => {
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

  return {
    actual: { semestre: semestreActual, año: añoActual },
    siguiente: { semestre: semestreSiguiente, año: añoSiguiente },
  };
};

/**
 * Inserta en AsignacionesProfesor solo los profesores que aún no tienen
 * fila para el semestre/año indicado (disponibilidad=0, asignados=0).
 * No borra ni actualiza filas existentes.
 */
const cargarProfesoresParaSemestre = async (semestre, año) => {
  if (!supabase) {
    throw new Error('Cliente de Supabase no está inicializado');
  }

  const { data: profesores, error: errorProfesores } = await Promise.race([
    supabase.from('Profesor').select('profesor_id'),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout al obtener profesores')), 10000)
    ),
  ]);

  if (errorProfesores) {
    throw new Error('No se pudo conectar con la base de datos. Verifique su conexión a internet.');
  }

  if (!profesores || profesores.length === 0) {
    return { nuevas: 0, yaExistian: 0, total: 0, vacio: true };
  }

  const { data: asignacionesExistentes, error: errorAsignaciones } = await Promise.race([
    supabase
      .from('AsignacionesProfesor')
      .select('idProfesor')
      .eq('semestre', semestre)
      .eq('año', año),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout al obtener asignaciones')), 10000)
    ),
  ]);

  if (errorAsignaciones) {
    throw new Error('Error al verificar asignaciones existentes.');
  }

  const profesoresConAsignacion = new Set(
    (asignacionesExistentes || []).map((a) => a.idProfesor)
  );

  const profesoresSinAsignacion = profesores.filter(
    (p) => !profesoresConAsignacion.has(p.profesor_id)
  );

  if (profesoresSinAsignacion.length === 0) {
    return {
      nuevas: 0,
      yaExistian: profesoresConAsignacion.size,
      total: profesores.length,
      vacio: false,
    };
  }

  const nuevasAsignaciones = profesoresSinAsignacion.map((profesor) => ({
    idProfesor: profesor.profesor_id,
    semestre,
    año,
    disponibilidad: 0,
    asignados: 0,
  }));

  const { error: errorInsertar } = await Promise.race([
    supabase.from('AsignacionesProfesor').insert(nuevasAsignaciones),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout al insertar asignaciones')), 10000)
    ),
  ]);

  if (errorInsertar) {
    throw new Error(`Error al crear las asignaciones: ${errorInsertar.message}`);
  }

  return {
    nuevas: nuevasAsignaciones.length,
    yaExistian: profesoresConAsignacion.size,
    total: profesores.length,
    vacio: false,
  };
};

const InicioCargaDatos = () => {
  const [modal, setModal] = useState(false);
  const [cargando, setCargando] = useState(false);
  const { actual, siguiente } = getSemestresReferencia();

  const ejecutarCarga = async (semestre, año, etiqueta) => {
    if (
      !window.confirm(
        `¿Está seguro(a) de completar las asignaciones faltantes de profesores para ${etiqueta} (S${semestre} ${año})?`
      )
    ) {
      return;
    }

    setCargando(true);
    try {
      const resultado = await cargarProfesoresParaSemestre(semestre, año);

      if (resultado.vacio) {
        alert('No se encontraron profesores registrados.');
      } else if (resultado.nuevas === 0) {
        alert(`Todos los profesores ya tienen asignación para ${etiqueta} (S${semestre} ${año}).`);
      } else {
        alert(
          `Carga completada (${etiqueta} S${semestre} ${año}):\n` +
            `- Profesores con nueva asignación: ${resultado.nuevas}\n` +
            `- Profesores que ya tenían asignación: ${resultado.yaExistian}\n` +
            `- Total procesados: ${resultado.total}`
        );
      }
    } catch (error) {
      console.error('Error completo:', error);
      let mensaje = 'Error al cargar profesores: ';
      if (error.message?.includes('Timeout')) {
        mensaje +=
          'La operación tardó demasiado. Verifique su conexión a internet e intente nuevamente.';
      } else if (
        error.message?.includes('NetworkError') ||
        error.message?.includes('fetch')
      ) {
        mensaje += 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      } else {
        mensaje += error.message || 'Error desconocido';
      }
      alert(mensaje);
    } finally {
      setCargando(false);
      setModal(false);
    }
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
            
            {/* Completar asignaciones por semestre */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <button
                onClick={() => setModal(true)}
                disabled={cargando}
                className="w-full h-full p-6 text-left hover:bg-gray-50 transition-colors duration-200 disabled:opacity-60"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 p-4 rounded-full mb-4">
                    <i className="fas fa-calendar-plus text-3xl text-green-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Completar Asignaciones de Semestre
                  </h3>
                  <p className="text-gray-600 text-center">
                    Inserta profesores faltantes en AsignacionesProfesor (actual o siguiente)
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
        <Modal show={modal} onClose={() => !cargando && setModal(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Completar asignaciones
            </h2>
            <p className="text-gray-600 mb-6">
              Solo inserta filas faltantes en AsignacionesProfesor (disponibilidad 0, asignados 0).
              No borra ni modifica filas existentes.
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <button
                disabled={cargando}
                onClick={() =>
                  ejecutarCarga(actual.semestre, actual.año, 'semestre actual')
                }
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-60"
              >
                Completar semestre actual (S{actual.semestre} {actual.año})
              </button>
              <button
                disabled={cargando}
                onClick={() =>
                  ejecutarCarga(siguiente.semestre, siguiente.año, 'próximo semestre')
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60"
              >
                Completar próximo semestre (S{siguiente.semestre} {siguiente.año})
              </button>
            </div>
            <div className="flex justify-end">
              <button
                disabled={cargando}
                onClick={() => setModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 disabled:opacity-60"
              >
                Cancelar
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
